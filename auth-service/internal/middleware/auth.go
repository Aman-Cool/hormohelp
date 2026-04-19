package middleware

import (
	"context"
	"crypto/rsa"
	"encoding/json"
	"net/http"
	"strings"

	"harmohelp/auth-service/internal/utils"
)

type contextKey string

// UserKey is the context key under which the validated JWT claims are stored.
const UserKey contextKey = "auth_claims"

// AuthMiddleware validates RS256 JWTs on protected routes.
type AuthMiddleware struct {
	publicKey *rsa.PublicKey
}

// NewAuthMiddleware returns an AuthMiddleware configured with the given RSA public key.
func NewAuthMiddleware(pub *rsa.PublicKey) *AuthMiddleware {
	return &AuthMiddleware{publicKey: pub}
}

// RequireAuth is a chi-compatible middleware that validates the Bearer token and
// stores the claims in the request context. Requests without a valid, verified-email
// token are rejected before reaching the handler.
func (m *AuthMiddleware) RequireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		header := r.Header.Get("Authorization")
		if !strings.HasPrefix(header, "Bearer ") {
			writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
			return
		}

		claims, err := utils.VerifyAccessToken(header[7:], m.publicKey)
		if err != nil {
			writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "Invalid or expired token"})
			return
		}

		if !claims.EmailVerified {
			writeJSON(w, http.StatusForbidden, map[string]any{
				"error": "Please verify your email address to continue.",
				"code":  "EMAIL_NOT_VERIFIED",
			})
			return
		}

		ctx := context.WithValue(r.Context(), UserKey, claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v) //nolint:errcheck
}
