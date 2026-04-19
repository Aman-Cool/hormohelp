package handlers

import (
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"harmohelp/auth-service/internal/models"
	"harmohelp/auth-service/internal/utils"
)

// VerifyEmail handles POST /auth/verify-email.
func (h *Handler) VerifyEmail(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Token string `json:"token"`
	}
	if err := decode(r, &body); err != nil || strings.TrimSpace(body.Token) == "" {
		writeJSON(w, http.StatusBadRequest, map[string]any{
			"errors": []validationError{{"token", "Token is required"}},
		})
		return
	}

	incomingHash := utils.SHA256Hex(body.Token)
	ctx := r.Context()

	var user models.User
	var tokenHash string
	var tokenExpiry time.Time
	err := h.db.QueryRow(ctx,
		`SELECT id, email, name, verification_token_hash, verification_token_expires_at
		 FROM users
		 WHERE verification_token_hash = $1 AND email_verified = FALSE`,
		incomingHash,
	).Scan(&user.ID, &user.Email, &user.Name, &tokenHash, &tokenExpiry)
	if err == pgx.ErrNoRows {
		writeErr(w, http.StatusBadRequest, "Invalid or already-used verification link.")
		return
	}
	if err != nil {
		log.Printf("verify-email: query: %v", err)
		writeErr(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	if time.Now().After(tokenExpiry) {
		writeErr(w, http.StatusBadRequest, "Verification link has expired. Please request a new one.")
		return
	}

	if !utils.ConstantTimeHexEqual(tokenHash, incomingHash) {
		writeErr(w, http.StatusBadRequest, "Invalid verification token.")
		return
	}

	_, err = h.db.Exec(ctx,
		`UPDATE users
		 SET email_verified = TRUE, verification_token_hash = NULL, verification_token_expires_at = NULL
		 WHERE id = $1`,
		user.ID,
	)
	if err != nil {
		log.Printf("verify-email: update user: %v", err)
		writeErr(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	accessToken, err := utils.IssueAccessToken(user.ID, true, h.cfg.PrivateKey)
	if err != nil {
		log.Printf("verify-email: issue token: %v", err)
		writeErr(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	rawRefresh, err := utils.RandomHex(32)
	if err != nil {
		log.Printf("verify-email: random refresh: %v", err)
		writeErr(w, http.StatusInternalServerError, "Internal server error")
		return
	}
	_, err = h.db.Exec(ctx,
		`INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
		user.ID, utils.SHA256Hex(rawRefresh), time.Now().Add(7*24*time.Hour),
	)
	if err != nil {
		log.Printf("verify-email: store refresh token: %v", err)
		writeErr(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	setRefreshCookie(w, rawRefresh, h.cfg.NodeEnv == "production")
	writeJSON(w, http.StatusOK, map[string]any{
		"accessToken": accessToken,
		"user":        models.PublicUser{ID: user.ID, Email: user.Email, Name: user.Name},
	})
}

// ResendVerification handles POST /auth/resend-verification.
// Always returns the same response to prevent email enumeration.
func (h *Handler) ResendVerification(w http.ResponseWriter, r *http.Request) {
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

	ok := map[string]string{"message": "If that email is pending verification, a new link has been sent."}

	// Rate limit by SHA-256(email) — max 3 resends per hour per address
	if h.resendRL != nil {
		allowed, retry := h.resendRL.Allow(utils.SHA256Hex(email))
		if !allowed {
			w.Header().Set("Retry-After", fmt.Sprintf("%d", int(retry.Seconds())+1))
			writeErr(w, http.StatusTooManyRequests, "Too many resend attempts. Please wait before trying again.")
			return
		}
	}

	ctx := r.Context()

	var userID, name string
	err := h.db.QueryRow(ctx,
		`SELECT id, name FROM users WHERE email = $1 AND email_verified = FALSE`,
		email,
	).Scan(&userID, &name)
	if err == pgx.ErrNoRows {
		writeJSON(w, http.StatusOK, ok)
		return
	}
	if err != nil {
		log.Printf("resend-verification: query: %v", err)
		writeJSON(w, http.StatusOK, ok)
		return
	}

	rawToken, err := utils.RandomHex(32)
	if err != nil {
		log.Printf("resend-verification: random token: %v", err)
		writeJSON(w, http.StatusOK, ok)
		return
	}

	_, err = h.db.Exec(ctx,
		`UPDATE users SET verification_token_hash = $1, verification_token_expires_at = $2 WHERE id = $3`,
		utils.SHA256Hex(rawToken), time.Now().Add(24*time.Hour), userID,
	)
	if err != nil {
		log.Printf("resend-verification: update token: %v", err)
		writeJSON(w, http.StatusOK, ok)
		return
	}

	go func() {
		verifyURL := fmt.Sprintf("%s/verify-email?token=%s", h.cfg.FrontendOrigin, rawToken)
		text := fmt.Sprintf("Hi %s,\n\nVerify your email (expires in 24 hours):\n%s", name, verifyURL)
		if err := h.emailer.Send(email, "Verify your HarmoHelp email address", text, utils.VerificationEmailHTML(name, verifyURL)); err != nil {
			log.Printf("resend-verification: send email: %v", err)
		}
	}()

	writeJSON(w, http.StatusOK, ok)
}
