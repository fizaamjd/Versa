# Versa

Versa is an AI image workspace with a Next.js web client, an Expo mobile client, and a FastAPI backend. It supports image transformation, prompt-based creation, history, usage tracking, subscription billing, and post-generation technical/AI reports. Former repository/product names include GenFrame-AI and Visual Engine; some internal identifiers still use them.

## Live demo video

https://github.com/user-attachments/assets/dc7a05a9-1991-46ba-8b04-bc575befb9b1

[Open Versa](https://versa-workspace.vercel.app/) · [Download video](docs/media/versa-demo.mp4) · [HTML presentation source](docs/media/versa-demo.html)

A walkthrough of the web and mobile interfaces using sample account data.

## Architecture

| Component | Implementation and dependencies |
| --- | --- |
| `frontend/` | Next.js 16, React 19, TypeScript; calls FastAPI and a separate organization API |
| `mobile/` | Expo 55 / React Native; authentication, engines, history and profile |
| `backend/main.py` | FastAPI routes; Google GenAI image generation and Pillow input decoding |
| `backend/auth.py`, `org_auth.py` | MongoDB users/usage, API-key hashes, local and organization JWT authentication |
| `backend/stripe_manager.py` | Stripe checkout, portal, webhook and subscription synchronization |
| `backend/compliance_service.py` | Technical image checks and Gemini vision analysis; reports stored in MongoDB |
| External services | MongoDB, Gemini, S3-compatible DigitalOcean Spaces, Stripe, SMTP; organization service is not included |

Generated outputs are uploaded with a public-read ACL. Treat uploaded images, prompts, returned URLs and reports as potentially sensitive. AI reports are heuristic output, not certification or a legal compliance audit.

## Local development

Use Node.js 22, npm and Python 3.11 for the CI-compatible setup. Dependency installs require network access. Never copy production credentials into local files.

```sh
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements-dev.txt
cp .env.example .env
# Configure a dedicated development database and services before starting.
uvicorn main:app --reload
```

Backend startup is not an offline smoke test: imports ping MongoDB, create indexes and initialize Spaces; startup also schedules billing rollover. Configure explicit development DB names and a strong, independent `JWT_SECRET`. See [backend setup](backend/README.md).

In a second terminal:

```sh
cd frontend
npm ci
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. FastAPI schema is at http://localhost:8000/docs. Organization management requires the separately deployed organization service; its default URL is http://localhost:3001/api.

For mobile:

```sh
cd mobile
npm ci
# Optional mobile/.env: EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8000/api
npm start
```

Android emulator uses `10.0.2.2`; use localhost for the iOS simulator and your development machine's LAN address for a physical device. Native builds require the corresponding platform toolchain.

## Supported behavior and limitations

- Both engines use `POST /api/resize`. Transformation requires an image and ignores custom prompts; creation requires a prompt. Authentication uses a bearer token or `X-API-KEY`.
- The actual parser accepts five presets: square `1:1`, landscape `16:9`, story/story-reel `9:16` (alias `story/reel`), portrait `3:4`, ultrawide `21:9`. It also normalizes `x` and `-` separators. Dimensions are Gemini-native sizes, not exact mathematical aspect ratios.
- The web and mobile pickers expose only those five presets. OOH/QMS and custom-dimension choices have been removed from the web UI. The landing preview is a local crop illustration, not AI generation or layer extraction. The unsupported JSON layer-plan toggle and custom-resize request path are removed. Native preset sizes do not guarantee preservation of source text, logos or layout; review the generated image and its heuristic report before use. Dedicated OOH/QMS dimension modules and layer decomposition are absent in this branch; historical product/design claims do not establish implemented support.
- Cloud generation, storage, billing and organization workflows need configured external services. A frontend page alone does not demonstrate end-to-end functionality.
- JWT configuration currently falls back to the storage `SECRET_KEY` or a predictable default when `JWT_SECRET` is missing. Explicitly set `JWT_SECRET`; this is not a production security guarantee. See [security](SECURITY.md).
- Legacy lint debt remains. Strict `npm run lint` reports inherited violations. `npm run lint:check` is the maintainer-managed no-new-violations baseline gate; passing it does not mean clean lint.

## Checks

```sh
cd backend
python -m pytest
# From frontend/
npm run lint:check
npx tsc --noEmit
npm run build
# From mobile/
npx tsc --noEmit
```

Backend pytest isolates external clients before app import and tests API-key routes and real preset parsing. It does not exercise live generation, payments, persistence or startup billing. See [testing](docs/testing.md) and [contributing](CONTRIBUTING.md).

## Project maintenance

[Contributing](CONTRIBUTING.md) · [Code of conduct](CODE_OF_CONDUCT.md) · [Security](SECURITY.md) · [Support](SUPPORT.md) · [Changelog](CHANGELOG.md)

Canonical repository: [fizaamjd/Versa](https://github.com/fizaamjd/Versa). See [dependency health](docs/dependency-health.md) for current audit limitations.

## License

Original contributions are available under the [MIT license](LICENSE). Existing third-party notices, including [Expo's mobile license](mobile/LICENSE), remain applicable. See [license scope](docs/license-scope.md); no ownership of third-party assets or generated content is asserted.
