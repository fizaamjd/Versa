"use client";
import React, { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";
import { VersaLogo, VersaMark } from "@/components/brand/VersaLogo";
import { IMAGE_PRESETS } from "@/lib/presets";
import Recomposer, { SampleAd, INK, SPEC } from "./components/home/Recomposer";

const GA = "#4F6CE1";

/* ── Dot-to-Text Intro Animation ────────────────────────────────── */
function IntroAnimation({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2400);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: INK,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden"
      }}
    >
      {/* Main content container */}
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: 12 }}
        >
          <VersaMark size={64} tone="light" />
        </motion.div>

        {/* Brand Text */}
        <motion.h1
          initial={{ letterSpacing: "-0.05em", opacity: 0, y: 15 }}
          animate={{ letterSpacing: "0.05em", opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontSize: "clamp(32px, 5vw, 48px)",
            fontWeight: 700,
            color: "white",
            margin: 0,
            lineHeight: 1,
            textAlign: "center"
          }}
        >
          Versa
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          style={{
            fontSize: "clamp(14px, 1.5vw, 16px)",
            fontWeight: 500,
            color: "#C7CCD5",
            margin: 0,
            textAlign: "center"
          }}
        >
          Five formats for your creative
        </motion.p>

        {/* Slim animated progress line */}
        <div style={{ width: 140, height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 4, marginTop: 24, overflow: "hidden", position: "relative" }}>
          <motion.div
            initial={{ left: "-100%", width: "100%" }}
            animate={{ left: "100%" }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.2 }}
            style={{
              position: "absolute",
              height: "100%",
              background: GA
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

function PresetsRow() {
  return <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
    {IMAGE_PRESETS.map((preset) => <div key={preset.id} style={{ flex: "1 1 140px", padding: 16, border: "1px solid #C7CCD5" }}>
      <div style={{ fontWeight: 600 }}>{preset.label} · {preset.ratio}</div>
      <div className="spec-figure">{preset.w} × {preset.h}</div>
    </div>)}
  </div>;
}

/* Renders the sample ad at its container's size. */
function FitAd() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 300, h: 200 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ position: "absolute", inset: 0 }}>
      <SampleAd w={box.w} h={box.h} />
    </div>
  );
}

/* ── Outputs with their verdicts (sample report) ── */
const OUTPUTS = IMAGE_PRESETS.slice(0, 3).map((preset) => ({ ...preset, verdict: "Preview", note: "Local crop illustration. Generate an image to receive its actual report." }));

function Verdict({ v }: { v: string }) {
  const pass = false;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: pass ? "#047857" : "#6B4E00" }}>
      <span aria-hidden style={{ width: 10, height: 10, borderRadius: 5, background: pass ? "#047857" : "#F2B705", border: pass ? "none" : "1px solid #6B4E00" }} />
      {v}
    </span>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const { loading } = useAuth();
  /* intro plays once per session */
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window === "undefined") return false;
    try { return sessionStorage.getItem("ve_intro") !== "1"; } catch { return false; }
  });
  const handleIntroDone = useCallback(() => {
    try { sessionStorage.setItem("ve_intro", "1"); } catch { /* storage blocked */ }
    setShowIntro(false);
  }, []);
  const start = () => router.push("/auth?tab=signup&redirect=/pricing");

  if (loading) return null;

  return (
    <>
      <AnimatePresence>{showIntro && <IntroAnimation key="intro" onDone={handleIntroDone} />}</AnimatePresence>

      <div style={{ background: "#fff", color: INK, overflowX: "hidden" }}>
        <style>{`
          .v-wrap{max-width:1200px;margin:0 auto;padding:0 40px;}
          .v-btn{font:inherit;font-weight:600;font-size:14px;border-radius:4px;padding:11px 20px;cursor:pointer;white-space:nowrap;}
          .v-btn-primary{background:${SPEC};color:#fff;border:1px solid ${SPEC};}
          .v-btn-primary:hover{background:#1B38B4;border-color:#1B38B4;}
          .v-btn-ghost{background:#fff;color:${INK};border:1px solid #C7CCD5;}
          .v-btn-ghost:hover{border-color:${INK};}
          .v-btn-light{background:#fff;color:${INK};border:1px solid #fff;}
          .v-snap:hover{border-color:${INK} !important;}
          .v-link{color:#4A5260;font-size:14px;cursor:pointer;text-decoration:none;background:none;border:0;font:inherit;}
          .v-link:hover{color:${INK};text-decoration:underline;}
                    .outputs{display:grid;grid-template-columns:1fr;gap:40px;}
          @media(max-width:900px){
            .v-wrap{padding:0 16px;}
            .hide-sm{display:none !important;}
            .split{grid-template-columns:1fr !important;}
          }
        `}</style>

        {/* Nav */}
        <nav style={{ borderBottom: "1px solid #E3E6EB", background: "#fff", position: "sticky", top: 0, zIndex: 50 }}>
          <div className="v-wrap" style={{ height: 64, display: "flex", alignItems: "center", gap: 28 }}>
            <VersaLogo height={28} />
            <div className="hide-sm" style={{ display: "flex", gap: 24, marginLeft: 12 }}>
              <button className="v-link" onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}>How it works</button>
              <button className="v-link" onClick={() => router.push("/pricing")}>Pricing</button>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
              <button className="v-btn v-btn-ghost hide-sm" onClick={() => router.push("/auth?tab=login")}>Sign in</button>
              <button className="v-btn v-btn-primary" onClick={start}>Get started</button>
            </div>
          </div>
        </nav>

        {/* Hero: the mechanism itself */}
        <section style={{ paddingTop: "clamp(40px,7vh,88px)", paddingBottom: 72 }}>
          <div className="v-wrap">
            <h1 style={{ fontSize: "clamp(36px,6.4vw,84px)", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 0.98, maxWidth: 1000, margin: 0 }}>
              One image.<br />Five supported formats.
            </h1>
            <p style={{ fontSize: "clamp(16px,1.5vw,19px)", color: "#4A5260", lineHeight: 1.6, maxWidth: 640, margin: "22px 0 44px" }}>
              Transform an uploaded image or create one from a prompt. Choose square, story, landscape, portrait or ultrawide, then review the generated result.
            </p>
            <Recomposer onStart={start} />
            <p style={{ fontSize: 12, color: "#6B7380", marginTop: 16 }}>
              Local format preview using a sample photograph. This is not an AI-generated result or a demonstration of layer extraction.
            </p>
          </div>
        </section>

        {/* Supported formats */}
        <section id="how" style={{ background: "#F6F7F9", borderTop: "1px solid #E3E6EB", borderBottom: "1px solid #E3E6EB", padding: "96px 0" }}>
          <div className="v-wrap">
            <h2 style={{ fontSize: "clamp(28px,3.6vw,44px)", fontWeight: 600, letterSpacing: "-0.025em", lineHeight: 1.08, margin: "0 0 14px", maxWidth: 760 }}>
              Choose from five formats.
            </h2>
            <p style={{ fontSize: 16, color: "#4A5260", lineHeight: 1.65, margin: "0 0 48px", maxWidth: 620 }}>
              Both engines use these five presets. The sizes below are Gemini-native outputs; their pixel proportions may differ slightly from the named ratios.
            </p>
            <PresetsRow />
          </div>
        </section>

        {/* Outputs and verdicts */}
        <section style={{ padding: "96px 0" }}>
          <div className="v-wrap">
            <h2 style={{ fontSize: "clamp(28px,3.6vw,44px)", fontWeight: 600, letterSpacing: "-0.025em", lineHeight: 1.08, margin: "0 0 12px", maxWidth: 720 }}>
              Review the result and its report.
            </h2>
            <p style={{ fontSize: 16, color: "#4A5260", lineHeight: 1.65, maxWidth: 620, margin: "0 0 56px" }}>
              Reports combine technical image checks with AI analysis. Review the artwork, text and branding yourself before using an output; a report is not a quality guarantee or certification.
            </p>
            <div className="outputs">
              {OUTPUTS.map((o) => {
                const maxW = 820, maxH = 360;
                const k = Math.min(maxW / o.w, maxH / o.h);
                return (
                  <div key={o.w} className="split" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 300px", gap: 28, alignItems: "start" }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ position: "relative", width: "100%", maxWidth: o.w * k, aspectRatio: `${o.w} / ${o.h}`, outline: `1px solid ${INK}`, overflow: "hidden" }}>
                        <FitAd />
                      </div>
                    </div>
                    <div style={{ paddingTop: 2 }}>
                      <div className="spec-figure" style={{ fontSize: 28, fontWeight: 600, lineHeight: 1 }}>{o.w} × {o.h}</div>
                      <div style={{ margin: "10px 0 6px" }}><Verdict v={o.verdict} /></div>
                      <div style={{ fontSize: 14, color: "#4A5260", lineHeight: 1.55 }}>{o.note}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize: 12, color: "#6B7380", marginTop: 28 }}>Format illustrations only. No generation or report analysis runs in this preview.</p>
          </div>
        </section>

        {/* Two engines */}
        <section style={{ borderTop: "1px solid #E3E6EB", padding: "88px 0" }}>
          <div className="v-wrap split" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56 }}>
            <div>
              <h3 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.015em", margin: "0 0 10px", color: SPEC }}>Transformation Engine</h3>
              <p style={{ fontSize: 16, color: "#4A5260", lineHeight: 1.65, margin: "0 0 18px" }}>
                Upload an image and select up to two of the five presets per batch. Review the AI-transformed outputs and their reports before downloading.
              </p>
              <button className="v-link" style={{ color: SPEC, fontWeight: 600 }} onClick={start}>Transform an image →</button>
            </div>
            <div>
              <h3 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.015em", margin: "0 0 10px" }}>Creation Engine</h3>
              <p style={{ fontSize: 16, color: "#4A5260", lineHeight: 1.65, margin: "0 0 18px" }}>
                Describe the image you want to create and select a supported preset. Review the generated artwork before using it.
              </p>
              <button className="v-link" style={{ color: INK, fontWeight: 600 }} onClick={start}>Create from a prompt →</button>
            </div>
          </div>
        </section>

        {/* Close */}
        <section style={{ background: INK, color: "#fff", padding: "96px 0" }}>
          <div className="v-wrap" style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 32 }}>
            <div style={{ maxWidth: 680 }}>
              <h2 style={{ fontSize: "clamp(30px,4.4vw,56px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.02, margin: "0 0 14px" }}>
                Bring one approved artwork.
              </h2>
              <p style={{ fontSize: 17, color: "#C7CCD5", lineHeight: 1.6, margin: 0 }}>
                Start with 2 free generations, then choose a plan. Cancel anytime.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, marginLeft: "auto" }}>
              <button className="v-btn v-btn-light" onClick={start}>Get started free</button>
              <button className="v-btn" style={{ background: "transparent", color: "#fff", border: "1px solid #4A5260" }} onClick={() => router.push("/pricing")}>View pricing</button>
            </div>
          </div>
        </section>

        <footer style={{ borderTop: "1px solid #E3E6EB" }}>
          <div className="v-wrap" style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", justifyContent: "space-between", padding: "28px 40px" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: 13, color: "#6B7380" }}>
              <VersaMark size={22} /> Versa · Five formats for your creative · 2026
            </span>
            <span style={{ display: "flex", gap: 20 }}>
              {["Privacy Policy", "Terms of Service", "Contact Sales"].map((l) => (
                <span key={l} style={{ fontSize: 12, color: "#6B7380" }}>{l}</span>
              ))}
            </span>
          </div>
        </footer>
      </div>
    </>
  );
}
