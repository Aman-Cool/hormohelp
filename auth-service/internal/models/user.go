package models

import "time"

// User mirrors the users table. Fields that may be NULL use pointers.
type User struct {
	ID                         string
	Email                      string
	PasswordHash               string
	Name                       string
	EmailVerified              bool
	VerificationTokenHash      *string
	VerificationTokenExpiresAt *time.Time
	CreatedAt                  time.Time
}

// PublicUser is the subset returned to API consumers.
type PublicUser struct {
	ID    string `json:"id"`
	Email string `json:"email"`
	Name  string `json:"name"`
}
