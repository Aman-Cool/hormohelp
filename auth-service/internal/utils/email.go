package utils

import (
	"bytes"
	"crypto/tls"
	"fmt"
	"net/smtp"
	"strings"
	"time"
)

// Emailer sends transactional email via SMTP.
type Emailer struct {
	host   string
	port   int
	secure bool // true = implicit TLS (port 465); false = STARTTLS (port 587)
	user   string
	pass   string
	from   string
}

// NewEmailer constructs an Emailer from individual fields.
func NewEmailer(host string, port int, secure bool, user, pass, from string) *Emailer {
	return &Emailer{host: host, port: port, secure: secure, user: user, pass: pass, from: from}
}

// Send delivers an email with both plain-text and HTML parts.
func (e *Emailer) Send(to, subject, textBody, htmlBody string) error {
	msg := buildMIME(e.from, to, subject, textBody, htmlBody)
	addr := fmt.Sprintf("%s:%d", e.host, e.port)

	var auth smtp.Auth
	if e.user != "" {
		auth = smtp.PlainAuth("", e.user, e.pass, e.host)
	}

	if e.secure {
		return e.sendImplicitTLS(addr, auth, to, msg)
	}
	// STARTTLS — smtp.SendMail negotiates STARTTLS automatically when available
	return smtp.SendMail(addr, auth, addrOnly(e.from), []string{to}, msg)
}

func (e *Emailer) sendImplicitTLS(addr string, auth smtp.Auth, to string, msg []byte) error {
	conn, err := tls.Dial("tcp", addr, &tls.Config{ServerName: e.host})
	if err != nil {
		return fmt.Errorf("TLS dial: %w", err)
	}

	c, err := smtp.NewClient(conn, e.host)
	if err != nil {
		conn.Close()
		return fmt.Errorf("smtp client: %w", err)
	}
	defer c.Quit() //nolint:errcheck

	if auth != nil {
		if err = c.Auth(auth); err != nil {
			return fmt.Errorf("smtp auth: %w", err)
		}
	}
	if err = c.Mail(addrOnly(e.from)); err != nil {
		return err
	}
	if err = c.Rcpt(to); err != nil {
		return err
	}

	w, err := c.Data()
	if err != nil {
		return err
	}
	if _, err = w.Write(msg); err != nil {
		return err
	}
	return w.Close()
}

// buildMIME constructs a multipart/alternative MIME message.
func buildMIME(from, to, subject, text, html string) []byte {
	boundary := fmt.Sprintf("boundary_%d", time.Now().UnixNano())
	var b bytes.Buffer
	b.WriteString("From: " + from + "\r\n")
	b.WriteString("To: " + to + "\r\n")
	b.WriteString("Subject: " + subject + "\r\n")
	b.WriteString("MIME-Version: 1.0\r\n")
	b.WriteString(`Content-Type: multipart/alternative; boundary="` + boundary + `"` + "\r\n\r\n")

	b.WriteString("--" + boundary + "\r\n")
	b.WriteString("Content-Type: text/plain; charset=utf-8\r\n\r\n")
	b.WriteString(text + "\r\n\r\n")

	b.WriteString("--" + boundary + "\r\n")
	b.WriteString("Content-Type: text/html; charset=utf-8\r\n\r\n")
	b.WriteString(html + "\r\n\r\n")

	b.WriteString("--" + boundary + "--\r\n")
	return b.Bytes()
}

// addrOnly extracts the bare email from "Display Name <email@example.com>".
func addrOnly(addr string) string {
	if i := strings.LastIndex(addr, "<"); i >= 0 {
		addr = addr[i+1:]
		if j := strings.Index(addr, ">"); j >= 0 {
			return strings.TrimSpace(addr[:j])
		}
	}
	return strings.TrimSpace(addr)
}

// VerificationEmailHTML returns the branded HTML for the email verification message.
func VerificationEmailHTML(name, verifyURL string) string {
	year := time.Now().Year()
	return fmt.Sprintf(`<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FFFBEF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%%" cellpadding="0" cellspacing="0" style="background:#FFFBEF;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;border:1px solid #E8D88A;overflow:hidden;max-width:560px;width:100%%;">
        <tr>
          <td style="background:#1a1a2e;padding:28px 40px;">
            <span style="color:#ffffff;font-size:18px;font-weight:800;">&#9829; HarmoHelp</span>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 32px;">
            <p style="margin:0 0 8px;font-size:26px;font-weight:900;color:#1a1a2e;">Verify your email address</p>
            <p style="margin:0 0 28px;font-size:15px;color:#6b7280;line-height:1.6;">
              Hi %s, thanks for joining HarmoHelp! Click the button below to confirm your email address and activate your account.
            </p>
            <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td style="background:#1a1a2e;border-radius:12px;">
                  <a href="%s" style="display:inline-block;padding:14px 36px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">
                    Verify Email Address
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;">
              This link expires in <strong style="color:#1a1a2e;">24 hours</strong>. If you did not create a HarmoHelp account, you can safely ignore this email.
            </p>
            <hr style="border:none;border-top:1px solid #f3f4f6;margin:28px 0;">
            <p style="margin:0 0 6px;font-size:12px;color:#9ca3af;">Or copy and paste this URL into your browser:</p>
            <p style="margin:0;font-size:12px;color:#1a1a2e;word-break:break-all;">%s</p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #f3f4f6;">
            <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
              &copy; %d HarmoHelp &mdash; Empowering hormonal wellness.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`, name, verifyURL, verifyURL, year)
}

// ResetPasswordEmailHTML returns the HTML for password reset emails.
func ResetPasswordEmailHTML(resetURL string) string {
	year := time.Now().Year()
	return fmt.Sprintf(`<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FFFBEF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%%" cellpadding="0" cellspacing="0" style="background:#FFFBEF;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;border:1px solid #E8D88A;overflow:hidden;max-width:560px;width:100%%;">
        <tr>
          <td style="background:#1a1a2e;padding:28px 40px;">
            <span style="color:#ffffff;font-size:18px;font-weight:800;">&#9829; HarmoHelp</span>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 32px;">
            <p style="margin:0 0 8px;font-size:26px;font-weight:900;color:#1a1a2e;">Reset your password</p>
            <p style="margin:0 0 28px;font-size:15px;color:#6b7280;line-height:1.6;">
              Click the button below to choose a new password. This link expires in 1 hour.
            </p>
            <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td style="background:#1a1a2e;border-radius:12px;">
                  <a href="%s" style="display:inline-block;padding:14px 36px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">
                    Reset Password
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;">
              If you did not request a password reset, you can safely ignore this email.
            </p>
            <hr style="border:none;border-top:1px solid #f3f4f6;margin:28px 0;">
            <p style="margin:0 0 6px;font-size:12px;color:#9ca3af;">Or copy and paste this URL:</p>
            <p style="margin:0;font-size:12px;color:#1a1a2e;word-break:break-all;">%s</p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #f3f4f6;">
            <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
              &copy; %d HarmoHelp &mdash; Empowering hormonal wellness.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`, resetURL, resetURL, year)
}
