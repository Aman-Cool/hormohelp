package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/jackc/pgx/v5"
	"harmohelp/auth-service/internal/middleware"
	"harmohelp/auth-service/internal/utils"
)

// Me handles GET /auth/me.
// Returns the authenticated user's profile. Requires a valid Bearer token
// (enforced by the RequireAuth middleware applied in the router).
func (h *Handler) Me(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middleware.UserKey).(*utils.Claims)
	if !ok || claims == nil {
		writeErr(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	ctx := r.Context()

	var id, email, name string
	var onboardingData json.RawMessage
	err := h.db.QueryRow(ctx,
		`SELECT id, email, name, onboarding_data FROM users WHERE id = $1`,
		claims.Subject,
	).Scan(&id, &email, &name, &onboardingData)
	if err == pgx.ErrNoRows {
		writeErr(w, http.StatusNotFound, "User not found")
		return
	}
	if err != nil {
		log.Printf("me: query user: %v", err)
		writeErr(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"user": map[string]any{
			"id":             id,
			"email":          email,
			"name":           name,
			"onboarding_data": onboardingData,
		},
	})
}
