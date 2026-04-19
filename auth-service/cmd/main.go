package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"

	"harmohelp/auth-service/internal/config"
	"harmohelp/auth-service/internal/db"
	"harmohelp/auth-service/internal/handlers"
	"harmohelp/auth-service/internal/middleware"
	"harmohelp/auth-service/internal/utils"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config: %v", err)
	}

	pool, err := db.New(context.Background(), cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("database: %v", err)
	}
	defer pool.Close()

	// Pre-hash a dummy password once at startup so the login handler can always
	// run Argon2 regardless of whether the queried user exists, preventing
	// timing-based user enumeration.
	dummyHash, err := utils.HashPassword("harmohelp-timing-guard-constant")
	if err != nil {
		log.Fatalf("dummy hash: %v", err)
	}

	emailer := utils.NewEmailer(
		cfg.SMTPHost, cfg.SMTPPort, cfg.SMTPSecure,
		cfg.SMTPUser, cfg.SMTPPass, cfg.SMTPFrom,
	)

	// Rate limiters
	authRL   := middleware.NewRateLimiter(10, 15*time.Minute) // /login + /signup: 10 req / 15 min per IP
	resendRL := middleware.NewRateLimiter(3, time.Hour)        // /resend-verification: 3 req / hour per email hash

	// Auth middleware (RS256 JWT verification)
	authMW := middleware.NewAuthMiddleware(cfg.PublicKey)

	h := handlers.New(pool, cfg, emailer, resendRL, dummyHash)

	r := chi.NewRouter()
	r.Use(chimw.RealIP)
	r.Use(chimw.Logger)
	r.Use(chimw.Recoverer)
	r.Use(chimw.Timeout(30 * time.Second))

	r.Get("/health", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok"}`)) //nolint:errcheck
	})

	r.Route("/auth", func(r chi.Router) {
		r.With(authRL.IPMiddleware).Post("/signup", h.Signup)
		r.With(authRL.IPMiddleware).Post("/login", h.Login)
		r.Post("/logout", h.Logout)
		r.Post("/refresh", h.Refresh)
		r.Post("/verify-email", h.VerifyEmail)
		r.Post("/resend-verification", h.ResendVerification) // keyed by email hash inside handler
		r.Post("/forgot-password", h.ForgotPassword)
		r.Post("/reset-password", h.ResetPassword)
		r.With(authMW.RequireAuth).Get("/me", h.Me)
	})

	addr := ":" + cfg.Port
	log.Printf("auth-service listening on %s", addr)
	if err := http.ListenAndServe(addr, r); err != nil {
		log.Fatalf("server: %v", err)
	}
}
