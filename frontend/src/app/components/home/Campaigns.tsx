"use client";
import React, { useEffect, useRef, useState } from "react";
import { IMAGE_PRESETS } from "@/lib/presets";

/*
 * Illustrative sample campaigns for the public pages. Three fictional brands,
 * each composed for the five supported formats. These are designed artwork,
 * not engine output; every page that shows them says so.
 */

export type Campaign = {
  id: string;
  brand: string;
  headline: string;
  tag: string;
  img: string;
  focus: string;
  ground: string;
  fg: string;
  tagBg: string;
  tagFg: string;
};

export const CAMPAIGNS: Campaign[] = [
  { id: "northline", brand: "NORTHLINE", headline: "Cold brew, all summer.", tag: "In store now", img: "/sample/cold-brew.jpg", focus: "center 55%", ground: "#1F2A24", fg: "#F3E9D7", tagBg: "#E8692C", tagFg: "#1F2A24" },
  { id: "halo", brand: "HALO", headline: "Hear every detail.", tag: "New colourway", img: "/sample/headphones.jpg", focus: "62% 50%", ground: "#F2BE22", fg: "#14161A", tagBg: "#14161A", tagFg: "#F2BE22" },
  { id: "fieldwork", brand: "FIELDWORK", headline: "Walk into spring.", tag: "Shop the edit", img: "/sample/shoe.jpg", focus: "50% 58%", ground: "#F3D6C6", fg: "#1D4744", tagBg: "#1D4744", tagFg: "#F3D6C6" },
];

export const PRESETS = IMAGE_PRESETS;

/* Rendered width of a logo box, in ems of its font size (letter-spaced caps). */
const logoEm = (brand: string) => brand.length * 0.92 + 1.2;

type Box = { x: number; y: number; w: number; h: number };

/* Where each layer goes for a w × h canvas. */
function place(c: Campaign, w: number, h: number) {
  const a = w / h;
  const pad = Math.max(4, Math.min(w, h) * 0.07);
  const L = logoEm(c.brand);
  if (a >= 1.25) {
    const photoW = w * (a > 2 ? 0.42 : 0.5);
    const colX = photoW + pad;
    const colW = w - colX - pad;
    const size = Math.max(9, Math.min(h * 0.14, colW / 6.2));
    const logo = Math.max(6, Math.min(h * 0.055, colW / (L * 1.4)));
    return {
      photo: { x: 0, y: 0, w: photoW, h } as Box,
      logo: { x: colX, y: pad, size: logo },
      headline: { x: colX, y: h * 0.34, w: colW, size },
      tag: { x: colX, y: h - pad - logo * 2.3, size: logo },
    };
  }
  if (a >= 0.85) {
    const photoH = h * 0.6;
    const size = Math.max(9, w * 0.08);
    const logo = Math.max(6, w * 0.032);
    return {
      photo: { x: 0, y: 0, w, h: photoH } as Box,
      logo: { x: pad, y: h - pad - logo * 1.5, size: logo },
      headline: { x: pad, y: photoH + pad * 0.8, w: w - pad * 2, size },
      tag: { x: w - pad - logo * 9, y: h - pad - logo * 2.3, size: logo },
    };
  }
  const logo = Math.max(6, w * 0.045);
  const size = Math.max(9, w * 0.095);
  const photoY = pad * 2 + logo * 1.5;
  const photoH = h * 0.46;
  return {
    photo: { x: 0, y: photoY, w, h: photoH } as Box,
    logo: { x: w / 2 - (logo * L) / 2, y: pad, size: logo },
    headline: { x: pad, y: photoY + photoH + pad, w: w - pad * 2, size },
    tag: { x: w / 2 - logo * 4.5, y: h - pad - logo * 2.3, size: logo },
  };
}

/* One campaign composed at exactly w × h pixels. */
export function CampaignAd({ c, w, h }: { c: Campaign; w: number; h: number }) {
  const p = place(c, w, h);
  return (
    <div style={{ position: "relative", width: w, height: h, background: c.ground, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: p.photo.x,
          top: p.photo.y,
          width: p.photo.w,
          height: p.photo.h,
          backgroundImage: `url(${c.img})`,
          backgroundSize: "cover",
          backgroundPosition: c.focus,
        }}
      />
      <div style={{ position: "absolute", left: p.logo.x, top: p.logo.y, fontSize: p.logo.size, color: c.fg, fontWeight: 700, letterSpacing: "0.18em", border: `1.5px solid ${c.fg}`, padding: "0.15em 0.5em", whiteSpace: "nowrap" }}>
        {c.brand}
      </div>
      <div style={{ position: "absolute", left: p.headline.x, top: p.headline.y, width: p.headline.w, fontSize: p.headline.size, color: c.fg, fontWeight: 700, lineHeight: 1.04, letterSpacing: "-0.02em" }}>
        {c.headline}
      </div>
      {h > 150 && p.tag.y > p.headline.y + p.headline.size * 2.3 && (
        <div style={{ position: "absolute", left: p.tag.x, top: p.tag.y, fontSize: p.tag.size, background: c.tagBg, color: c.tagFg, fontWeight: 700, padding: "0.45em 0.8em", whiteSpace: "nowrap" }}>
          {c.tag}
        </div>
      )}
    </div>
  );
}

/* A campaign at a preset's aspect ratio, filling its container's width. */
export function FitCampaign({ c, presetId, label = true }: { c: Campaign; presetId: string; label?: boolean }) {
  const preset = PRESETS.find((p) => p.id === presetId) ?? PRESETS[0];
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <figure style={{ margin: 0 }}>
      <div
        ref={ref}
        role="img"
        aria-label={`Sample ${c.brand} artwork in ${preset.label} format`}
        style={{ position: "relative", width: "100%", aspectRatio: `${preset.w} / ${preset.h}`, overflow: "hidden", background: c.ground }}
      >
        {box.w > 0 && <CampaignAd c={c} w={box.w} h={box.h} />}
      </div>
      {label && (
        <figcaption style={{ display: "flex", justifyContent: "space-between", gap: 8, marginTop: 6, fontSize: 12, color: "#4A5260" }}>
          <span>{preset.label}</span>
          <span className="spec-figure" style={{ color: "#101418", fontWeight: 600 }}>{preset.ratio}</span>
        </figcaption>
      )}
    </figure>
  );
}
