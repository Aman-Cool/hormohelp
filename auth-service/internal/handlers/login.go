package handlers

import (
	"log"
	"net/http"
	"strings"
	"time"

	"harmohelp/auth-service/internal/models"
	"harmohelp/auth-service/internal/utils"
)

// Login handles POST /auth/login.
func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := decode(r, &body); err != nil {
		writeErr(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	var errs []validationError
	email := strings.ToLower(strings.TrimSpace(body.Email))
	if !isValidEmail(email) {
		errs = append(errs, validationError{"email", "Valid email is required"})
	}
	if strings.TrimSpace(body.Password) == "" {
		errs = append(errs, validationError{"password", "Password is required"})
	}
	if len(errs) > 0 {
		writeJSON(w, http.StatusBadRequest, map[string]any{"errors": errs})
		return
	}

	ctx := r.Context()

	var user models.User
	var found bool
	err := h.db.QueryRow(ctx,
		`SELECT id, email, name, password_hash, email_verified FROM users WHERE email = $1`,
		email,
	).Scan(&user.ID, &user.Email, &user.Name, &user.PasswordHash, &user.EmailVerified)
	if err == nil {
		found = true
	}

	// Always run Argon2 to prevent user-enumeration through timing differences.
	hashToCheck := h.dummyHash
	if found {
		hashToCheck = user.PasswordHash
	}
	valid, err := utils.VerifyPassword(hashToCheck, body.Password)
	if err != nil {
		log.Printf("login: verify password: %v", err)
	}

	if !found || !valid {
		writeErr(w, http.StatusUnauthorized, "Invalid email or password.")
		return
	}

	if !user.EmailVerified {
		writeJSON(w, http.StatusForbidden, map[string]any{
			"error": "Please verify your email address before signing in.",
			"code":  "EMAIL_NOT_VERIFIED",
			"email": user.Email,
		})
		return
	}

	accessToken, err := utils.IssueAccessToken(user.ID, true, h.cfg.PrivateKey)
	if err != nil {
		log.Printf("login: issue token: %v", err)
		writeErr(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	rawRefresh, err := utils.RandomHex(32)
	if err != nil {
		log.Printf("login: random refresh: %v", err)
		writeErr(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	_, err = h.db.Exec(ctx,
		`INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
		user.ID, utils.SHA256Hex(rawRefresh), time.Now().Add(7*24*time.Hour),
	)
	if err != nil {
		log.Printf("login: store refresh token: %v", err)
		writeErr(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	setRefreshCookie(w, rawRefresh, h.cfg.NodeEnv == "production")

	writeJSON(w, http.StatusOK, map[string]any{
		"accessToken": accessToken,
		"user":        models.PublicUser{ID: user.ID, Email: user.Email, Name: user.Name},
	})
}

func setRefreshCookie(w http.ResponseWriter, raw string, secure bool) {
	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    raw,
		HttpOnly: true,
		Secure:   secure,
		SameSite: http.SameSiteStrictMode,
		Path:     "/auth/refresh",
		MaxAge:   7 * 24 * 60 * 60,
	})
}

func clearRefreshCookie(w http.ResponseWriter, secure bool) {
	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    "",
		HttpOnly: true,
		Secure:   secure,
		SameSite: http.SameSiteStrictMode,
		Path:     "/auth/refresh",
		MaxAge:   -1,
	})
}
