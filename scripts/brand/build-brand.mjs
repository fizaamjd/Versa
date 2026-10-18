// Usage: npm i opentype.js@1.3.4 @resvg/resvg-js@2.6.2 (outside the app), then
//   node build-brand.mjs <repo-root> <Archivo-Bold-SemiExpanded.ttf>
// The TTF comes from Google Fonts: Archivo, wdth 112, wght 700.

// Builds every Versa brand file from one geometry: SVG logos (wordmark
// outlined from Archivo Bold Semi-Expanded) and the PNG icon set.
import fs from "node:fs";
import path from "node:path";
import opentype from "opentype.js";
import { Resvg } from "@resvg/resvg-js";

const ROOT = process.argv[2];
const FONT = process.argv[3];
const INK = "#101418";
const SPEC = "#2346D9";
const HATCH = "#F2B705";
const WHITE = "#FFFFFF";

// The mark: a screen frame with its width and height dimensioned, exactly as
// a media owner's spec sheet draws it. Drawn on a 64-unit grid.
function mark({ frame, dims, stroke = 2.2 }) {
  // A screen with its width dimensioned the way a media owner's spec sheet
  // draws it: extension lines off the frame, an arrowed dimension line above.
  return `
  <rect x="8" y="24" width="48" height="30" rx="1.5" fill="${frame}"/>
  <g stroke="${dims}" fill="none">
    <path stroke-width="${stroke}" d="M13 13H51"/>
    <path stroke-width="${stroke * 0.65}" d="M8 7V20M56 7V20"/>
  </g>
  <path fill="${dims}" d="M8 13L13.5 9.6V16.4ZM56 13L50.5 9.6V16.4Z"/>`;
}
// Mark bounds on the grid, used to centre it.
const MB = { x: 7, y: 7, w: 50, h: 47 };

const font = opentype.loadSync(FONT);
function wordmark(text, size, x, baseline, fill) {
  const p = font.getPath(text, x, baseline, size, { kerning: true });
  const bb = p.getBoundingBox();
  return { d: p.toPathData(2), bb, fill };
}

function lockup({ markFrame, markDims, textFill }) {
  // Mark scaled to 40px tall, wordmark cap height matched to the frame height.
  const s = 40 / MB.h;
  const markW = MB.w * s;
  const size = 34;
  const w = wordmark("Versa", size, 0, 0, textFill);
  const capTop = w.bb.y1;
  const textH = -capTop;
  // Baseline aligns with the bottom of the frame (y=50 on the grid).
  const frameBottom = (54 - MB.y) * s;
  const tx = markW + 12;
  const ty = frameBottom + 1;
  const width = Math.ceil(tx + w.bb.x2 + 2);
  const height = 43;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" role="img" aria-label="Versa">
  <g transform="translate(0 1) scale(${s.toFixed(4)}) translate(${-MB.x} ${-MB.y})">${mark({ frame: markFrame, dims: markDims })}
  </g>
  <path transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)})" d="${w.d}" fill="${textFill}"/>
</svg>
`;
}

function bareMark({ frame, dims, size = 64 }) {
  const pad = 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${MB.x - pad} ${MB.y - pad - (MB.w - MB.h) / 2} ${MB.w + pad * 2} ${MB.w + pad * 2}" fill="none" role="img" aria-label="Versa">${mark({ frame, dims })}
</svg>
`;
}

// App icon: spec-blue plate, white screen, hatch-yellow dimensions.
// scale = how much of the plate the mark occupies (Android needs a safe zone).
function tile({ size, scale = 0.62, bg = SPEC, frame = WHITE, dims = HATCH, radius = 0, transparent = false }) {
  const k = (size * scale) / MB.w;
  const ox = (size - MB.w * k) / 2 - MB.x * k;
  const oy = (size - MB.h * k) / 2 - MB.y * k;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${transparent ? "" : `<rect width="${size}" height="${size}" rx="${radius}" fill="${bg}"/>`}
  <g transform="translate(${ox.toFixed(2)} ${oy.toFixed(2)}) scale(${k.toFixed(4)})">${mark({ frame, dims })}
  </g>
</svg>
`;
}

function write(rel, content) {
  const out = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, content);
  console.log("wrote", rel);
}
function png(rel, svg, width) {
  const r = new Resvg(svg, { fitTo: { mode: "width", value: width } });
  write(rel, r.render().asPng());
}

// Web
write("frontend/public/logo.svg", lockup({ markFrame: SPEC, markDims: INK, textFill: INK }));
write("frontend/public/logo-light.svg", lockup({ markFrame: WHITE, markDims: HATCH, textFill: WHITE }));
write("frontend/public/logo-mark.svg", bareMark({ frame: SPEC, dims: INK }));
write("frontend/src/app/icon.svg", tile({ size: 64, scale: 0.7, radius: 12 }));
png("frontend/src/app/apple-icon.png", tile({ size: 180, scale: 0.62 }), 180);
png("frontend/public/logo.png", tile({ size: 654, scale: 0.62, radius: 120 }), 654);

// Mobile (Expo)
png("mobile/assets/icon.png", tile({ size: 1024, scale: 0.6 }), 1024);
png("mobile/assets/favicon.png", tile({ size: 48, scale: 0.72, radius: 9 }), 48);
png("mobile/assets/splash-icon.png", tile({ size: 1024, scale: 0.5, transparent: true, frame: SPEC, dims: INK }), 1024);
png("mobile/assets/android-icon-background.png", `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" fill="${SPEC}"/></svg>`, 512);
png("mobile/assets/android-icon-foreground.png", tile({ size: 512, scale: 0.42, transparent: true }), 512);
png("mobile/assets/android-icon-monochrome.png", tile({ size: 432, scale: 0.42, transparent: true, frame: WHITE, dims: WHITE }), 432);
// Mobile in-app lockup (no SVG runtime in the app, so ship a 3x PNG).
png("mobile/assets/brand-lockup.png", lockup({ markFrame: SPEC, markDims: INK, textFill: INK }), 169 * 3);
