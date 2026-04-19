package handlers

import (
	"log"
	"net/http"

	"harmohelp/auth-service/internal/utils"
)

// Logout handles POST /auth/logout.
// It deletes the refresh token from the database (if present in the cookie) and
// clears the cookie. Because the cookie path is /auth/refresh, browsers will not
// automatically forward it here; the frontend may also send the raw token in the
// JSON body as {"token":"..."} to enable server-side invalidation.
func (h *Handler) Logout(w http.ResponseWriter, r *http.Request) {
	secure := h.cfg.NodeEnv == "production"

	// Attempt to read the raw token from the cookie first, then the request body.
	raw := ""
	if c, err := r.Cookie("refresh_token"); err == nil {
		raw = c.Value
	}

	// Fallback: accept token from body so the client can always invalidate the
	// server-side record even when the browser didn't forward the cookie.
	if raw == "" {
		var body struct {
			Token string `json:"token"`
		}
		if err := decode(r, &body); err == nil && body.Token != "" {
			raw = body.Token
		}
	}

	if raw != "" {
		hash := utils.SHA256Hex(raw)
		if _, err := h.db.Exec(r.Context(),
			"DELETE FROM refresh_tokens WHERE token_hash = $1", hash,
		); err != nil {
			log.Printf("logout: delete refresh token: %v", err)
		}
	}

	clearRefreshCookie(w, secure)
	writeJSON(w, http.StatusOK, map[string]string{"message": "Logged out"})
}
