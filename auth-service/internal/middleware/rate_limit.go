package middleware

import (
	"encoding/json"
	"net"
	"net/http"
	"strconv"
	"sync"
	"time"
)

type bucket struct {
	mu    sync.Mutex
	count int
	start time.Time
}

// RateLimiter is an in-memory sliding-window rate limiter backed by sync.Map.
// It requires no external dependencies.
type RateLimiter struct {
	buckets sync.Map
	max     int
	window  time.Duration
}

// NewRateLimiter returns a RateLimiter that allows at most max requests per window.
func NewRateLimiter(max int, window time.Duration) *RateLimiter {
	rl := &RateLimiter{max: max, window: window}
	go rl.reap()
	return rl
}

// reap periodically removes expired buckets to avoid unbounded memory growth.
func (rl *RateLimiter) reap() {
	tick := time.NewTicker(rl.window)
	defer tick.Stop()
	for range tick.C {
		rl.buckets.Range(func(k, v any) bool {
			b := v.(*bucket)
			b.mu.Lock()
			expired := time.Since(b.start) > rl.window
			b.mu.Unlock()
			if expired {
				rl.buckets.Delete(k)
			}
			return true
		})
	}
}

// Allow returns (true, 0) when the key is within limit, or (false, retryAfter)
// when the limit is exceeded.
func (rl *RateLimiter) Allow(key string) (bool, time.Duration) {
	val, _ := rl.buckets.LoadOrStore(key, &bucket{start: time.Now()})
	b := val.(*bucket)

	b.mu.Lock()
	defer b.mu.Unlock()

	if time.Since(b.start) > rl.window {
		b.count = 0
		b.start = time.Now()
	}

	b.count++
	if b.count > rl.max {
		retry := rl.window - time.Since(b.start)
		if retry < 0 {
			retry = 0
		}
		return false, retry
	}
	return true, 0
}

// IPMiddleware applies the rate limit keyed by the request's remote IP address.
func (rl *RateLimiter) IPMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := clientIP(r)
		allowed, retry := rl.Allow(ip)
		if !allowed {
			w.Header().Set("Retry-After", strconv.Itoa(int(retry.Seconds())+1))
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusTooManyRequests)
			json.NewEncoder(w).Encode(map[string]string{ //nolint:errcheck
				"error": "Too many requests. Please try again later.",
			})
			return
		}
		next.ServeHTTP(w, r)
	})
}

// clientIP extracts the real client IP, respecting X-Real-IP and X-Forwarded-For.
func clientIP(r *http.Request) string {
	if ip := r.Header.Get("X-Real-IP"); ip != "" {
		return ip
	}
	if fwd := r.Header.Get("X-Forwarded-For"); fwd != "" {
		// X-Forwarded-For may be a comma-separated list; take the first entry.
		if idx := len(fwd); idx > 0 {
			for i, c := range fwd {
				if c == ',' {
					return fwd[:i]
				}
			}
			return fwd
		}
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}
