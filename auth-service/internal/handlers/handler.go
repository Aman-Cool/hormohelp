package handlers

import (
	"encoding/json"
	"net/http"
	"regexp"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"harmohelp/auth-service/internal/config"
	"harmohelp/auth-service/internal/utils"
)

var emailRe = regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)

// Handler holds shared dependencies for all auth endpoint handlers.
type Handler struct {
	db        *pgxpool.Pool
	cfg       *config.Config
	emailer   *utils.Emailer
	resendRL  interface {
		Allow(key string) (bool, time.Duration)
	}
	dummyHash string // pre-hashed constant used during login to prevent timing attacks
}

// New constructs a Handler. dummyHash must be computed once at startup with HashPassword.
// resendRL is the rate limiter for /resend-verification, keyed by SHA-256(email).
func New(
	db *pgxpool.Pool,
	cfg *config.Config,
	emailer *utils.Emailer,
	resendRL interface{ Allow(string) (bool, time.Duration) },
	dummyHash string,
) *Handler {
	return &Handler{db: db, cfg: cfg, emailer: emailer, resendRL: resendRL, dummyHash: dummyHash}
}

// validationError is a single field-level validation failure.
type validationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

// writeJSON serialises v as JSON with the given HTTP status code.
func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v) //nolint:errcheck
}

// writeErr writes a single {"error":"..."} JSON response.
func writeErr(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}

// decode reads and JSON-decodes the request body into dst.
func decode(r *http.Request, dst any) error {
	return json.NewDecoder(r.Body).Decode(dst)
}

// isValidEmail returns true when s matches a basic email pattern.
func isValidEmail(s string) bool {
	return emailRe.MatchString(s)
}
