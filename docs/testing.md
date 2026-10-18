# Test boundaries

Run `python -m pytest` from backend after installing requirements-dev.txt. pytest.ini selects tests/, excluding the legacy manual resolution script that catches assertions and imports real configuration before its mocks.

The suite's conftest disables dotenv loading, replaces the process environment with synthetic local configuration, blocks outbound socket connections, and replaces MongoDB, Spaces and Gemini constructors before importing main. Mongo index creation is allowed only as a local no-op; other database operations fail unless explicitly patched by a test. Stripe and SMTP operations cannot connect. TestClient is used without a lifespan context so the billing startup task does not run. Dependency overrides are cleared before and after every test.

`frontend/scripts/check-lint-baseline.mjs` compares ESLint findings with checked-in file/rule/severity counts. New violations fail. Raw lint still reports 120 inherited errors and 175 warnings at this snapshot. Conditional hook-order violations were fixed instead of accepted into the baseline.

Tests exercise actual API-key routes and auth dependencies plus the real parser/dimension table in main.py. No live API key, external database, generation, storage or payment operation is used. They do not prove database semantics, webhook correctness, tenant isolation, image quality or production readiness.

Frontend CI runs the maintainer-managed lint baseline gate, explicit TypeScript checking and a build as independent steps. Strict raw lint still reports legacy debt; baseline success is not clean lint. Mobile CI checks TypeScript only, not native builds or device behavior. No deployment is performed by CI.
