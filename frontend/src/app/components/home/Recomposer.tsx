"use client";
import React, { useEffect, useRef, useState } from "react";
import { IMAGE_PRESETS } from "@/lib/presets";

export const INK = "#101418";
export const SPEC = "#2346D9";
export const SIZES = IMAGE_PRESETS;

// Local crop illustration only. This component never calls the image engine.
export function SampleAd({ w, h }: { w: number; h: number }) {
  return <div role="img" aria-label="Sample photograph cropped to preview the selected format" style={{ width: w, height: h, background: "#1F2A24 url(/sample/cold-brew.jpg) center 55% / cover no-repeat" }} />;
}

export default function Recomposer({ onStart }: { onStart: () => void }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);
  const [sizeId, setSizeId] = useState<string>("landscape");
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const preset = SIZES.find((item) => item.id === sizeId) ?? SIZES[2];
  const scale = Math.min(width / preset.w, (width < 700 ? 300 : 500) / preset.h);
  return (
    <div>
      <div ref={stageRef} className="recomposer-stage" style={{ width: "100%" }}>
        <div style={{ width: preset.w * scale, height: preset.h * scale, outline: `1px solid ${INK}`, overflow: "hidden" }}>
          <SampleAd w={preset.w * scale} h={preset.h * scale} />
        </div>
      </div>
      <div aria-live="polite" className="recomposer-readout" style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center", marginTop: 28 }}>
        <div>
          <div style={{ fontSize: 14, color: "#4A5260" }}>{preset.label} · {preset.ratio}</div>
          <div className="spec-figure" style={{ fontSize: 30, fontWeight: 600 }}>{preset.w} × {preset.h}</div>
          <div style={{ fontSize: 13, color: "#4A5260" }}>Native output size. Preview uses a local crop, not AI generation.</div>
        </div>
        <button type="button" onClick={onStart} className="v-btn v-btn-primary" style={{ marginLeft: "auto" }}>Try your image</button>
      </div>
      <div role="group" aria-label="Preview a supported format" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 18 }}>
        {SIZES.map((item) => (
          <button key={item.id} type="button" aria-pressed={item.id === sizeId} onClick={() => setSizeId(item.id)} className="v-snap" style={{ padding: "10px 14px", minHeight: 44, background: item.id === sizeId ? "#F4F6FE" : "#fff", border: `1px solid ${item.id === sizeId ? SPEC : "#C7CCD5"}`, borderRadius: 4, color: INK, cursor: "pointer", font: "inherit" }}>
            {item.label} · {item.ratio}
          </button>
        ))}
      </div>
    </div>
  );
}
