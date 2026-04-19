package handlers

import (
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"harmohelp/auth-service/internal/utils"
)

// ForgotPassword handles POST /auth/forgot-password.
// Always returns the same response to prevent email enumeration.
func (h *Handler) ForgotPassword(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Email string `json:"email"`
	}
	if err := decode(r, &body); err != nil {
		writeErr(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	email := strings.ToLower(strings.TrimSpace(body.Email))
	if !isValidEmail(email) {
		writeJSON(w, http.StatusBadRequest, map[string]any{
			"errors": []validationError{{"email", "Valid email is required"}},
		})
		return
	}

	ok := map[string]string{"message": "If that email is registered, a reset link has been sent."}
	ctx := r.Context()

	var userID string
	err := h.db.QueryRow(ctx, "SELECT id FROM users WHERE email = $1", email).Scan(&userID)
	if err == pgx.ErrNoRows {
		writeJSON(w, http.StatusOK, ok)
		return
	}
	if err != nil {
		log.Printf("forgot-password: query user: %v", err)
		writeJSON(w, http.StatusOK, ok)
		return
	}

	rawToken, err := utils.RandomHex(32)
	if err != nil {
		log.Printf("forgot-password: random token: %v", err)
		writeJSON(w, http.StatusOK, ok)
		return
	}
	tokenHash := utils.SHA256Hex(rawToken)
	expiresAt := time.Now().Add(time.Hour)

	// Replace any existing reset token for this user
	_, err = h.db.Exec(ctx, "DELETE FROM password_reset_tokens WHERE user_id = $1", userID)
	if err != nil {
		log.Printf("forgot-password: delete old tokens: %v", err)
		writeJSON(w, http.StatusOK, ok)
		return
	}
	_, err = h.db.Exec(ctx,
		"INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)",
		userID, tokenHash, expiresAt,
	)
	if err != nil {
		log.Printf("forgot-password: insert token: %v", err)
		writeJSON(w, http.StatusOK, ok)
		return
	}

	go func() {
		resetURL := fmt.Sprintf("%s/reset-password?token=%s", h.cfg.FrontendOrigin, rawToken)
		text := fmt.Sprintf("Reset your HarmoHelp password (expires in 1 hour):\n\n%s\n\nIf you did not request this, ignore this email.", resetURL)
		if err := h.emailer.Send(email, "Reset your HarmoHelp password", text, utils.ResetPasswordEmailHTML(resetURL)); err != nil {
			log.Printf("forgot-password: send email: %v", err)
		}
	}()

	writeJSON(w, http.StatusOK, ok)
}
