# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM golang:1.22-alpine AS builder

# ca-certificates is needed for SMTP TLS in the final image
RUN apk add --no-cache ca-certificates

WORKDIR /build

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# CGO_ENABLED=0 → fully static binary; -w -s → strip debug info for smaller output
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-w -s" -o auth-service ./cmd/main.go

# ── Stage 2: minimal runtime image ────────────────────────────────────────────
FROM scratch

# TLS root certificates (required for SMTP over TLS)
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

COPY --from=builder /build/auth-service /auth-service

EXPOSE 8001

ENTRYPOINT ["/auth-service"]
