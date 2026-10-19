# Dependency health

Snapshot: 2026-10-19. Counts below were checked with npm audit after compatible updates. Audit counts can change with the advisory database and dependency tree. They are not proof of exploitability, safety, or a completed security audit.

| Component | Full dependency audit | Production-only audit |
| --- | --- | --- |
| Web (`frontend/`) | 5 high, in the development ESLint/braces chain | 0 |
| Mobile (`mobile/`) | 33 total: 11 moderate, 22 high | 33 total: 11 moderate, 22 high |

The web chain was confirmed locally with `npm explain braces`:

```text
eslint-config-next@16.4.2 (dev)
  -> @next/eslint-plugin-next@16.4.2
  -> fast-glob@3.3.1
  -> micromatch@4.0.8
  -> braces@3.0.3
```

The five high findings are reported audit entries across this dependency chain, not five independently verified application exploits. Development-only dependencies still execute during installs, linting and CI; their classification does not establish that they are harmless. The mobile total includes its full installed tree and must not be described as 33 production vulnerabilities without the production-only report. No backend dependency audit count is established here.

## Review and update policy

Record full and production-only audit results separately in each npm project:

```sh
npm audit
npm audit --omit=dev
npm explain braces
```

Run from `frontend/` or `mobile/` as appropriate. These audit commands contact the configured npm registry; they do not exercise app APIs or payment/cloud workflows. Preserve sanitized advisory identifiers, dependency paths, versions and remediation notes when updating this snapshot. A nonzero audit exit status indicates findings and must not be relabeled as a passing security check.

Use compatible, reviewed updates within the existing framework constraints. Do not use `npm audit fix --force`, force resolutions, or broad framework upgrades to make counts disappear. Expo/React Native changes need SDK-compatible versions and native/device validation. Review any remaining findings upstream and plan a separately tested migration when a fix requires breaking changes. Compatible dependency updates were applied; breaking upgrades remain separate work.

## Remaining source and verification limitations

- The backend, web and mobile pickers support five standard presets. Unsupported OOH/QMS and custom-dimension choices have been removed from the web UI. The landing preview uses local crops, not live generation. Dedicated OOH/QMS dimension modules and layer decomposition are absent in this branch.
- JWT configuration can fall back to the storage secret or a predictable default. Set a strong independent `JWT_SECRET`; configuration guidance does not repair this source behavior. API-key hashing should use an independent `API_KEY_SECRET`.
- Administrative access includes a hard-coded owner-email fallback. Tenant ownership and organization-token trust boundaries need a dedicated review; the isolated tests do not establish tenant isolation.
- Validation errors include a request-body preview, and SMTP-failure handling logs reset tokens. Review sensitive-data exposure before deployment.
- Generated files use a public-read Spaces ACL; images/prompts may be sent to Google. Dependency remediation does not resolve storage privacy or provider-data handling.
- Backend import pings MongoDB, creates indexes and initializes storage; startup schedules billing rollover. Unit tests substitute clients before app import and do not validate live persistence, generation, storage, Stripe, webhook correctness or startup billing.
- Web lint uses a checked-in no-new-violations baseline. Passing `lint:check` does not mean clean raw lint. TypeScript/build checks and mobile TypeScript checks do not establish native runtime behavior or end-to-end correctness.

See [SECURITY.md](../SECURITY.md) and [testing boundaries](testing.md) for details.

## Offline backend verification

The isolated suite passed 23 tests with 7 deprecation warnings on Python 3.14.4. CI independently provisions Python 3.11. See [testing](testing.md) for commands and boundaries.
