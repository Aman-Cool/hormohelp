package handlers

import (
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"harmohelp/auth-service/internal/utils"
)

// ResetPassword handles POST /auth/reset-password.
func (h *Handler) ResetPassword(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Token    string `json:"token"`
		Password string `json:"password"`
	}
	if err := decode(r, &body); err != nil {
		writeErr(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	var errs []validationError
	if strings.TrimSpace(body.Token) == "" {
		errs = append(errs, validationError{"token", "Reset token is required"})
	}
	if len(body.Password) < 8 {
		errs = append(errs, validationError{"password", "Password must be at least 8 characters"})
	}
	if len(errs) > 0 {
		writeJSON(w, http.StatusBadRequest, map[string]any{"errors": errs})
		return
	}

	incomingHash := utils.SHA256Hex(body.Token)
	ctx := r.Context()

	var resetID, userID, storedHash string
	var expiresAt time.Time
	var used bool
	err := h.db.QueryRow(ctx,
		`SELECT id, user_id, token_hash, expires_at, used
		 FROM password_reset_tokens
		 WHERE token_hash = $1 AND expires_at > NOW() AND used = FALSE`,
		incomingHash,
	).Scan(&resetID, &userID, &storedHash, &expiresAt, &used)
	if err == pgx.ErrNoRows {
		writeErr(w, http.StatusBadRequest, "Invalid or expired reset token.")
		return
	}
	if err != nil {
		log.Printf("reset-password: query token: %v", err)
		writeErr(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	if !utils.ConstantTimeHexEqual(storedHash, incomingHash) {
		writeErr(w, http.StatusBadRequest, "Invalid reset token.")
		return
	}

	newHash, err := utils.HashPassword(body.Password)
	if err != nil {
		log.Printf("reset-password: hash password: %v", err)
		writeErr(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	tx, err := h.db.Begin(ctx)
	if err != nil {
		log.Printf("reset-password: begin tx: %v", err)
		writeErr(w, http.StatusInternalServerError, "Internal server error")
		return
	}
	defer tx.Rollback(ctx) //nolint:errcheck

	if _, err = tx.Exec(ctx, "UPDATE users SET password_hash = $1 WHERE id = $2", newHash, userID); err != nil {
		log.Printf("reset-password: update password: %v", err)
		writeErr(w, http.StatusInternalServerError, "Internal server error")
		return
	}
	if _, err = tx.Exec(ctx, "UPDATE password_reset_tokens SET used = TRUE WHERE id = $1", resetID); err != nil {
		log.Printf("reset-password: mark token used: %v", err)
		writeErr(w, http.StatusInternalServerError, "Internal server error")
		return
	}
	// Revoke all active sessions for security
	if _, err = tx.Exec(ctx, "DELETE FROM refresh_tokens WHERE user_id = $1", userID); err != nil {
		log.Printf("reset-password: revoke sessions: %v", err)
		writeErr(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	if err = tx.Commit(ctx); err != nil {
		log.Printf("reset-password: commit: %v", err)
		writeErr(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "Password reset successfully."})
}
