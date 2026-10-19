# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

The Next.js app (`frontend/`) is the primary surface. An Expo / React Native app (`mobile/`, bundle id `ai.genframe.mobile`) ships the same engines on iOS and Android with one shared brand, not per-OS design languages.

## Users

**Primary: ad agency creatives and creative-ops teams.** They have one approved campaign artwork and a deadline. Their job is to produce that artwork in every size a media plan needs, including dozens of fixed Out-of-Home billboard and QMS digital-screen dimensions (ultra-wide strips like 2640×288, tall portraits like 504×1008). Today that means a designer rebuilding each size by hand. They work inside an organisation (agency) with teammates, roles, and a shared credit balance.

Secondary audiences (organisation admins managing users, roles, billing, and reports) exist in the product but are in service of the primary job.

## Product Purpose

Turn one source creative into a full set of correctly sized, on-brand outputs without manual rebuilding. Success is an agency delivering every required dimension for a campaign in minutes instead of days, with outputs that pass the screen owner's technical and visual requirements the first time.

## Positioning

Not a generic AI resizer or crop tool. The Transformation Engine decomposes the creative into its layers (photo, logo, text, solid background), isolates each, and recomposes them for the target canvas, using a dedicated layout profile for each supported OOH/QMS dimension. Each output is then graded by a design compliance report (technical, visual, content checks: PASS / WARN / FAIL). The specific claim is **layer-aware recomposition for real media-site dimensions, with built-in compliance checking**, rather than stretch, crop, or outpaint.

## Operating Context

- Workflow: upload source image → choose target dimensions (standard ratios, custom, or named OOH/QMS media-site sizes) → optional prompt → process → review outputs and compliance report → download.
- Agency setting: multi-organisation accounts, users and roles/permissions, archive of past outputs, usage reports, billing.
- Desktop web is the main working environment; mobile is for running engines and checking results on the go.

## Capabilities and Constraints

- **Transformation Engine**: smart resize and full OOH/QMS recomposition (Gemini vision + PIL), exact pixel dimensions guaranteed.
- **Creation Engine**: generates creative from templates/specifications; less mature than Transformation.
- **Design Compliance Reports**: technical (dims, file size, format), visual (safe zone, contrast, clutter, saturation), content (prompt adherence, text readability, focal point).
- Plans and credits via Stripe; per-engine credit thresholds and pricing per organisation.
- Processing is not instant; recomposition runs multiple AI calls per output, so waiting and progress states are a core part of the experience.
- Terminology in use: "Transformation Engine", "Creation Engine", "OOH", "QMS", "media site dimensions", "credits", "organisation".

## Brand Commitments

- **Name: Versa** (from "versioning", the agency term for producing every size of a campaign). "GenFrame AI", "GenFrame", "Visual Engine", and "Visual Transformation Engine" are retired from every user-facing surface. Trademark/domain clearance is the owner's responsibility.
- The old sparkle / Gemini-style star marks and sky-blue gradient theme are **retired everywhere** (web app, auth, pricing, landing, mobile app, app icons, favicons, metadata, emails). The replacement identity, the "Media Spec Sheet" world, is recorded in DESIGN.md; brand changes go through that system, never one page at a time.
- Landing page: no longer reskin-only. It must be **visibly distinct from the owner's other products, CacheNet and Infinium**. Avoid their shared moves: a left headline with a right framed panel, ruled feature tables and step sequences, small tech-stack labels, a blueprint drawing-grid ground, centered badge-over-headline heroes, feature-card grids, and a scrolling ticker or marquee of any kind. The `/preview/*` concept routes are removed.
- No AI-vendor iconography: the brand must not borrow the visual language of its model providers.

## Evidence on Hand

- **Real pilot customers exist** (agencies using the product). No names, logos, or approved quotes have been provided.
- The landing testimonial "GenFrame saved our team 3 days per campaign" is **not an approved quote**. Do not present it, or any invented quote, customer name, logo, or metric, as real. Ask for approved pilot material before showing proof.
- Real product data: the 40+ OOH/QMS dimension profiles (`backend/ooh_dimensions.py`, `backend/qms_dimensions.py`) and the compliance report schema (`frontend/src/types/compliance.ts`) can be shown truthfully.
- Pricing tiers in `frontend/src/utils/plansData.ts` include generic feature copy (e.g. "More than 100 App", "Full player offline operation") that looks inherited from another product. Confirm before reusing.

## Product Principles

1. **Every size, one source.** The unit of value is the full set of dimensions a campaign needs, not a single resize.
2. **Fidelity over invention.** The creative belongs to the client: preserve faces, logos, and copy exactly. The AI rearranges; it does not reimagine.
3. **Proof before download.** Outputs come with a reason to trust them (compliance checks, clear dimension labels), so agencies can ship without a second manual QA pass.
4. **Built for the agency team.** Organisations, roles, shared credits, and history are first-class, not bolted on.
5. **Honest about the machine.** Show real progress and real results; never fake speed, customers, or quality claims.
