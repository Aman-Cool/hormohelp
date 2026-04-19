package config

import (
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"fmt"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Port           string
	DatabaseURL    string
	PrivateKey     *rsa.PrivateKey
	PublicKey      *rsa.PublicKey
	SMTPHost       string
	SMTPPort       int
	SMTPSecure     bool
	SMTPUser       string
	SMTPPass       string
	SMTPFrom       string
	FrontendOrigin string
	NodeEnv        string
}

func Load() (*Config, error) {
	// Load .env if present; never overrides real environment variables
	_ = godotenv.Load()

	cfg := &Config{
		Port:           getEnv("PORT", "8001"),
		FrontendOrigin: getEnv("FRONTEND_ORIGIN", "http://localhost:5173"),
		NodeEnv:        getEnv("NODE_ENV", "development"),
		SMTPUser:       os.Getenv("SMTP_USER"),
		SMTPPass:       os.Getenv("SMTP_PASS"),
	}

	var err error

	cfg.DatabaseURL, err = requireEnv("DATABASE_URL")
	if err != nil {
		return nil, err
	}
	cfg.SMTPHost, err = requireEnv("SMTP_HOST")
	if err != nil {
		return nil, err
	}
	cfg.SMTPFrom, err = requireEnv("SMTP_FROM")
	if err != nil {
		return nil, err
	}

	portStr := getEnv("SMTP_PORT", "587")
	cfg.SMTPPort, err = strconv.Atoi(portStr)
	if err != nil {
		return nil, fmt.Errorf("invalid SMTP_PORT %q: %w", portStr, err)
	}
	cfg.SMTPSecure = os.Getenv("SMTP_SECURE") == "true"

	privPath, err := requireEnv("JWT_PRIVATE_KEY_PATH")
	if err != nil {
		return nil, err
	}
	pubPath, err := requireEnv("JWT_PUBLIC_KEY_PATH")
	if err != nil {
		return nil, err
	}

	cfg.PrivateKey, err = loadPrivateKey(privPath)
	if err != nil {
		return nil, fmt.Errorf("loading private key: %w", err)
	}
	cfg.PublicKey, err = loadPublicKey(pubPath)
	if err != nil {
		return nil, fmt.Errorf("loading public key: %w", err)
	}

	return cfg, nil
}

func loadPrivateKey(path string) (*rsa.PrivateKey, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	block, _ := pem.Decode(data)
	if block == nil {
		return nil, fmt.Errorf("no PEM block found in %s", path)
	}
	key, err := x509.ParsePKCS1PrivateKey(block.Bytes)
	if err != nil {
		// Try PKCS8 as well
		parsed, err2 := x509.ParsePKCS8PrivateKey(block.Bytes)
		if err2 != nil {
			return nil, fmt.Errorf("PKCS1: %v; PKCS8: %v", err, err2)
		}
		rsaKey, ok := parsed.(*rsa.PrivateKey)
		if !ok {
			return nil, fmt.Errorf("not an RSA private key")
		}
		return rsaKey, nil
	}
	return key, nil
}

func loadPublicKey(path string) (*rsa.PublicKey, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	block, _ := pem.Decode(data)
	if block == nil {
		return nil, fmt.Errorf("no PEM block found in %s", path)
	}
	pub, err := x509.ParsePKIXPublicKey(block.Bytes)
	if err != nil {
		return nil, err
	}
	rsaPub, ok := pub.(*rsa.PublicKey)
	if !ok {
		return nil, fmt.Errorf("not an RSA public key")
	}
	return rsaPub, nil
}

func requireEnv(key string) (string, error) {
	v := os.Getenv(key)
	if v == "" {
		return "", fmt.Errorf("required environment variable %s is not set", key)
	}
	return v, nil
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
