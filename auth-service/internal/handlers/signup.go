package handlers

import (
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"harmohelp/auth-service/internal/utils"
)

// Signup handles POST /auth/signup.
// On success it creates the user, sends a verification email, and returns
// { requiresVerification: true, email: "..." } — no session is issued yet.
func (h *Handler) Signup(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := decode(r, &body); err != nil {
		writeErr(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate
	var errs []validationError
	name := strings.TrimSpace(body.Name)
	if name == "" {
		errs = append(errs, validationError{"name", "Name is required"})
	}
	email := strings.ToLower(strings.TrimSpace(body.Email))
	if !isValidEmail(email) {
		errs = append(errs, validationError{"email", "Valid email is required"})
	}
	if len(body.Password) < 8 {
		errs = append(errs, validationError{"password", "Password must be at least 8 characters"})
	}
	if len(errs) > 0 {
		writeJSON(w, http.StatusBadRequest, map[string]any{"errors": errs})
		return
	}

	ctx := r.Context()

	// Check for duplicate email
	var exists bool
	err := h.db.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)", email).Scan(&exists)
	if err != nil {
		log.Printf("signup: check existing: %v", err)
		writeErr(w, http.StatusInternalServerError, "Internal server error")
		return
	}
	if exists {
		writeErr(w, http.StatusConflict, "An account with that email already exists.")
		return
	}

	passwordHash, err := utils.HashPassword(body.Password)
	if err != nil {
		log.Printf("signup: hash password: %v", err)
		writeErr(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	rawToken, err := utils.RandomHex(32)
	if err != nil {
		log.Printf("signup: random token: %v", err)
		writeErr(w, http.StatusInternalServerError, "Internal server error")
		return
	}
	tokenHash := utils.SHA256Hex(rawToken)
	tokenExpiry := time.Now().Add(24 * time.Hour)

	_, err = h.db.Exec(ctx,
		`INSERT INTO users
		   (email, password_hash, name, email_verified, verification_token_hash, verification_token_expires_at)
		 VALUES ($1, $2, $3, FALSE, $4, $5)`,
		email, passwordHash, name, tokenHash, tokenExpiry,
	)
	if err != nil {
		log.Printf("signup: insert user: %v", err)
		writeErr(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	// Fire-and-forget: a mail failure must not break signup
	go func() {
		verifyURL := fmt.Sprintf("%s/verify-email?token=%s", h.cfg.FrontendOrigin, rawToken)
		text := fmt.Sprintf("Hi %s,\n\nVerify your email (expires in 24 hours):\n%s\n\nIf you did not sign up, ignore this email.", name, verifyURL)
		if err := h.emailer.Send(email, "Verify your HarmoHelp email address", text, utils.VerificationEmailHTML(name, verifyURL)); err != nil {
			log.Printf("signup: send verification email to %s: %v", email, err)
		}
	}()

	writeJSON(w, http.StatusCreated, map[string]any{
		"requiresVerification": true,
		"email":                email,
	})
}
