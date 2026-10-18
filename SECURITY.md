# Security policy

Only the current main branch is actively maintained; no supported release series or response SLA has been established. This project has not been represented as audited or production-secure.

## Private reporting

Use GitHub's private vulnerability reporting option on the repository Security tab if enabled. Otherwise use a private maintainer contact already published on their GitHub profile; a dedicated address is pending. If neither exists, open only a minimal request for a private channel, without exploit details. Do not publish credentials, exploit payloads, tenant data, images, signed URLs or payment information in public issues.

Include affected revision, minimal sanitized reproduction, expected versus observed behavior, and impact. Coordinate disclosure after a fix can be reviewed; no response-time guarantee is offered.

## Deployment review requirements

- Set a strong explicit `JWT_SECRET`. Current auth code falls back to the storage `SECRET_KEY` or a predictable default; never rely on either. Set independent `API_KEY_SECRET` and rotate compromised keys/tokens with a revocation plan. Organization JWTs use the shared JWT secret: review claim validation and trust boundaries.
- Verify organization membership, role and ownership on every object lookup, history/report read, credit operation and administrative endpoint. API-key tests are not proof of tenant isolation. Review the hard-coded owner-email administrative fallback in `get_admin_user` before deployment.
- Restrict CORS to actual trusted origins. Use TLS and least-privilege DB, Google and storage accounts. Explicitly separate DB names for every environment. Import creates indexes and startup schedules rollover work.
- Prompts and images may be sent to Gemini and generated outputs to Spaces with a public-read ACL. Review consent, provider retention, access controls and deletion requirements before uploading private data. AI report scores are not compliance certification.
- Keep Stripe secret/webhook keys server-side, use isolated test mode for manual billing validation, verify signatures and replay handling, and validate customer/subscription ownership. Review sync, test-checkout and rollover endpoints before exposing them. Do not use production payment operations for testing.
- Keep SMTP passwords, Mongo URIs, storage secrets and Google keys out of logs and browser/mobile bundles. `NEXT_PUBLIC_*` and `EXPO_PUBLIC_*` variables are public. Validation responses currently include a request-body preview, and SMTP-failure handling logs a password-reset token; review and remove sensitive-data exposure before deployment. Review upload limits, MIME validation and generated-content handling.

These are requirements for review, not claims that the implementation enforces them. Dependency alerts and CI provide limited signals; neither is a security audit.
