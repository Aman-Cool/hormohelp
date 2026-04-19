package handlers

import (
	"log"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5"
	"harmohelp/auth-service/internal/models"
	"harmohelp/auth-service/internal/utils"
)

// Refresh handles POST /auth/refresh.
// It performs atomic token rotation inside a transaction:
// delete old token → insert new token → issue new access token.
func (h *Handler) Refresh(w http.ResponseWriter, r *http.Request) {
	secure := h.cfg.NodeEnv == "production"

	c, err := r.Cookie("refresh_token")
	if err != nil {
		writeErr(w, http.StatusUnauthorized, "No refresh token")
		return
	}
	incomingRaw := c.Value
	incomingHash := utils.SHA256Hex(incomingRaw)

	ctx := r.Context()

	tx, err := h.db.Begin(ctx)
	if err != nil {
		log.Printf("refresh: begin tx: %v", err)
		writeErr(w, http.StatusInternalServerError, "Internal server error")
		return
	}
	defer tx.Rollback(ctx) //nolint:errcheck

	// Fetch and lock the stored token row
	var storedHash string
	var userID string
	err = tx.QueryRow(ctx,
		`SELECT token_hash, user_id FROM refresh_tokens
		 WHERE token_hash = $1 AND expires_at > NOW()`,
		incomingHash,
	).Scan(&storedHash, &userID)
	if err == pgx.ErrNoRows {
		clearRefreshCookie(w, secure)
		writeErr(w, http.StatusUnauthorized, "Invalid or expired refresh token")
		return
	}
	if err != nil {
		log.Printf("refresh: query token: %v", err)
		writeErr(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	// Constant-time comparison even though we fetched by hash (defence in depth)
	if !utils.ConstantTimeHexEqual(storedHash, incomingHash) {
		clearRefreshCookie(w, secure)
		writeErr(w, http.StatusUnauthorized, "Invalid refresh token")
		return
	}

	// Delete old token
	if _, err = tx.Exec(ctx, "DELETE FROM refresh_tokens WHERE token_hash = $1", storedHash); err != nil {
		log.Printf("refresh: delete old token: %v", err)
		writeErr(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	// Generate and insert new token
	newRaw, err := utils.RandomHex(32)
	if err != nil {
		log.Printf("refresh: random token: %v", err)
		writeErr(w, http.StatusInternalServerError, "Internal server error")
		return
	}
	newHash := utils.SHA256Hex(newRaw)
	_, err = tx.Exec(ctx,
		`INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
		userID, newHash, time.Now().Add(7*24*time.Hour),
	)
	if err != nil {
		log.Printf("refresh: insert new token: %v", err)
		writeErr(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	if err = tx.Commit(ctx); err != nil {
		log.Printf("refresh: commit: %v", err)
		writeErr(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	// Fetch user for response
	var user models.User
	err = h.db.QueryRow(ctx,
		`SELECT id, email, name, email_verified FROM users WHERE id = $1`, userID,
	).Scan(&user.ID, &user.Email, &user.Name, &user.EmailVerified)
	if err != nil {
		log.Printf("refresh: fetch user: %v", err)
		writeErr(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	accessToken, err := utils.IssueAccessToken(user.ID, user.EmailVerified, h.cfg.PrivateKey)
	if err != nil {
		log.Printf("refresh: issue token: %v", err)
		writeErr(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	setRefreshCookie(w, newRaw, secure)
	writeJSON(w, http.StatusOK, map[string]any{
		"accessToken": accessToken,
		"user":        models.PublicUser{ID: user.ID, Email: user.Email, Name: user.Name},
	})
}
