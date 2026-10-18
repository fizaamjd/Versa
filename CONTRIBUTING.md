# Contributing to Versa

Discuss substantial changes in an issue first. Use a focused branch and pull request; include the problem, resulting behavior, validation, and limitations. Never include credentials, private images, customer data, production database dumps or live Stripe identifiers.

See the README for setup. Use dedicated development services; do not run seed, billing, cleanup, payment, generation or storage operations against production. Organization integration needs a separately configured service.

Before review run backend `python -m pytest`, frontend `npm run lint:check`, `npx tsc --noEmit`, `npm run build`, and mobile `npx tsc --noEmit` in their respective directories. Strict frontend `npm run lint` remains available and currently exposes inherited debt. The baseline gate checks no new violations; it does not claim clean lint. Do not refresh a baseline merely to accept regressions. Explain any changed baseline entries in the PR.

Test behavior at boundaries: authentication, tenant ownership, malformed inputs, credits and webhook replay. Mock external services before imports. Never make live calls in unit tests. UI changes should include screenshots and keyboard/responsive checks. Document unsupported behavior honestly.

Retain third-party notices. Contribute only code and assets you have permission to share; original contributions follow the root MIT license. Follow the code of conduct. Report security issues privately as described in SECURITY.md.
