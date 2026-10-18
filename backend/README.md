# Versa backend

FastAPI service for authentication, image transformation/creation, history, usage, billing and image reports. Run commands from `backend/`.

```sh
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements-dev.txt
cp .env.example .env
# Replace placeholders using dedicated development services.
uvicorn main:app --reload
```

The `.env` is loaded relative to the running environment; run from this directory. Python 3.11 is used in CI. `requirements-dev.txt` includes runtime requirements and test tools. The optional standalone `validators.py` imports `python-magic` (and needs system libmagic); current route/preset tests do not import it, and runtime requirements do not include it.

## Configuration

See [.env.example](.env.example). Set `JWT_SECRET` and `API_KEY_SECRET` independently of Spaces secrets. `ENVIRONMENT=development` still follows the non-staging DB branch: set `DB_NAME` and `ORG_DB_NAME` explicitly. `ENVIRONMENT=staging` instead uses `STAGING_DB_NAME` and `STAGING_ORG_DB_NAME`. Organization JWT validation shares `JWT_SECRET` with the external organization service.

Spaces requires endpoint, bucket and credentials at import; `DO_ACCESS_KEY_ID`/`DO_SECRET_KEY` take precedence over legacy `ACCESS_KEY_ID`/`SECRET_KEY`. MongoDB is pinged with retries and indexes created during import. Import may continue after a DB failure even with `REQUIRE_MONGO`; it is not a reliable health gate. Startup schedules monthly billing rollover. Do not start against production databases for tests.

Google generation uses `gemini-3-pro-image`; report vision defaults to `gemini-2.5-flash` and can use `COMPLIANCE_VISION_MODEL`. Access and availability depend on your Google account. Generated files currently use public-read storage. Stripe price IDs and SMTP are needed only for their corresponding workflows, but absent configuration does not make the whole app offline-safe.

## Route overview

| Routes | Purpose |
| --- | --- |
| `/api/users/register`, `/login`, `/me` (under `/api/users`) | User registration, login, current profile |
| `/api/users/request-password-reset`, `/api/users/reset-password` | Email reset flow |
| `/api/users/api-key` (POST/DELETE) | Issue or revoke an API key |
| `/api/resize` (POST multipart) | `engine_type`, `aspect_ratio`, optional `file` and `prompt` |
| `/api/history`, `/api/reports/history`, `/api/reports/summary`, `/api/reports/{report_id}` | Archive and reports |
| `/api/plans`, `/api/users/usage`, `/api/users/billing-history` | Plans and usage |
| `/api/stripe/*` | Checkout, portal, webhook, cancellation and sync |
| `/api/status` | Configuration status; not full downstream readiness |

Use `/docs` or `/openapi.json` for exact request schemas. Both engines accept only the five backend presets described in the root README. No dedicated OOH/QMS modules or layer decomposition are implemented here. `/api/dev/clean-user-archive` and `/api/admin/trigger-billing-rollover` are operationally sensitive; do not invoke them as setup or tests. Seed/demo scripts mutate data and are not setup prerequisites.

## Offline checks

```sh
python -m pytest
```

See [test isolation](../docs/testing.md). Do not run the legacy `test_resolutions.py` script as an offline check: it imports app configuration before installing its own mocks and catches assertion failures. Pytest intentionally collects `tests/`, where failures propagate.
