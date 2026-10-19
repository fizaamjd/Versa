"use client";
import React, { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";
import { VersaLogo, VersaMark } from "@/components/brand/VersaLogo";
import { IMAGE_PRESETS } from "@/lib/presets";

/* The landing mirrors the Versa reel (docs/media/versa-demo.html) scene for
   scene: drawn frames and diagrams only, no photographs or screenshots. */
const INK = "#101418";
const SPEC = "#2346D9";
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

/* A drawn output frame: blue outline, tinted fill, hatched safe margin,
   a width dimension above and its ratio in the corner. */
function Drawing({ w, h, x, y, label, drift = 0 }: { w: number; h: number; x: number; y: number; label: string; drift?: number }) {
  return (
    <motion.div
      className="drawing"
      initial={{ y: 0 }}
      animate={{ y: drift }}
      transition={{ duration: 7, ease: [0.16, 1, 0.3, 1] }}
      style={{ width: `${w}%`, height: `${h}%`, left: `${x}%`, top: `${y}%` }}
    >
      <i className="safe" />
      <span>{label}</span>
    </motion.div>
  );
}

/* Reel scene 3: the five presets, the active one filled. */
const RATIO_BOX: Record<string, { w: number; h: number }> = {
  square: { w: 180, h: 180 },
  landscape: { w: 230, h: 132 },
  story: { w: 120, h: 210 },
  portrait: { w: 145, h: 186 },
  ultrawide: { w: 250, h: 104 },
};
const BOARD_ORDER = ["square", "landscape", "story", "portrait", "ultrawide"];

function RatioBoard() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t = setInterval(() => setActive((i) => (i + 1) % BOARD_ORDER.length), 1900);
    return () => clearInterval(t);
  }, [paused]);
  return (
    <div className="ratio-board" role="radiogroup" aria-label="Supported formats">
      {BOARD_ORDER.map((id, i) => {
        const p = IMAGE_PRESETS.find((x) => x.id === id)!;
        const box = RATIO_BOX[id];
        const on = i === active;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={on}
            className={`ratio${on ? " active-ratio" : ""}`}
            onClick={() => { setActive(i); setPaused(true); }}
          >
            <strong>{p.label === "Story/Reel" ? "Story" : p.label}</strong>
            <span className="ratio-box" style={{ ["--w" as string]: `${box.w}px`, ["--h" as string]: `${box.h}px` } as React.CSSProperties} />
            <strong>{p.ratio}</strong>
            <span className="ratio-size">{p.w} × {p.h}</span>
          </button>
        );
      })}
    </div>
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

      <div className="reel-page">
        <style>{`
          .reel-page{background:#fff;color:${INK};overflow-x:hidden;--muted:#4A5260;--sheet:#F6F7F9;--rule:#E3E6EB;--tint:#E8EDFC}
          .v-wrap{max-width:1200px;margin:0 auto;padding:0 40px;}
          .v-btn{font:inherit;font-weight:600;font-size:15px;border-radius:4px;padding:12px 20px;cursor:pointer;white-space:nowrap;}
          .v-btn-primary{background:${SPEC};color:#fff;border:1px solid ${SPEC};}
          .v-btn-primary:hover{background:#1B38B4;border-color:#1B38B4;}
          .v-btn-ghost{background:#fff;color:${INK};border:1px solid #C7CCD5;}
          .v-btn-ghost:hover{border-color:${SPEC};color:${SPEC};}
          .v-link{color:var(--muted);font-size:14px;cursor:pointer;background:none;border:0;font:inherit;}
          .v-link:hover{color:${INK};text-decoration:underline;text-underline-offset:5px;}
          .scene{padding:96px 0;border-top:1px solid var(--rule);}
          .scene h2{font-size:clamp(34px,5vw,62px);line-height:1.04;letter-spacing:-.035em;font-weight:600;margin:0 0 18px;text-wrap:balance;}
          .scene .small{font-size:17px;line-height:1.5;color:var(--muted);margin:0;max-width:560px;}
          .scene-head{display:flex;justify-content:space-between;align-items:flex-end;gap:40px;margin-bottom:36px;flex-wrap:wrap;}
          .scene-head h2{margin:0;max-width:720px;}
          .intro{display:flex;align-items:center;justify-content:space-between;gap:56px;padding:72px 0 96px;}
          .intro h1{font-size:clamp(46px,7.4vw,96px);line-height:1.02;letter-spacing:-.04em;font-weight:600;margin:0 0 22px;max-width:620px;}
          .intro p{font-size:20px;line-height:1.5;margin:0;max-width:520px;}
          .intro-note{margin-top:28px;padding-top:16px;border-top:1px solid var(--rule);font-size:15px;color:var(--muted);}
          .frame-study{flex:none;width:min(480px,44vw);aspect-ratio:630/620;position:relative;background:var(--sheet);border:1px solid var(--rule);}
          .drawing{position:absolute;background:var(--tint);border:2px solid ${SPEC};}
          .drawing:before{content:'';position:absolute;left:0;right:0;top:-14px;height:9px;border:1px solid ${INK};border-bottom:0;}
          .drawing span{position:absolute;top:10px;left:11px;font-size:15px;font-weight:600;color:${SPEC};z-index:1;}
          .drawing .safe{position:absolute;inset:10px;border:1px dashed #6B4E00;background:repeating-linear-gradient(135deg,transparent,transparent 7px,#F2B70544 7px,#F2B70544 9px);}
          .drawing .safe:after{content:'';position:absolute;inset:10px;background:var(--tint);}
          .ratio-board{position:relative;background:var(--sheet);border-top:1px solid var(--rule);border-bottom:1px solid var(--rule);display:flex;align-items:center;justify-content:space-around;gap:12px;padding:44px 20px;min-height:380px;}
          .ratio{display:flex;flex-direction:column;align-items:center;gap:18px;background:none;border:0;padding:8px;cursor:pointer;font:inherit;color:${INK};border-radius:4px;}
          .ratio:focus-visible{outline:2px solid ${SPEC};outline-offset:4px;}
          .ratio strong{font-size:18px;font-weight:600;}
          .ratio-box{display:block;width:calc(var(--w) * .8);height:calc(var(--h) * .8);border:2px solid ${SPEC};background:var(--tint);position:relative;transition:background .3s;}
          .ratio-box:after{content:'';position:absolute;top:-14px;left:0;right:0;height:8px;border:1px solid ${INK};border-bottom:0;}
          .ratio.active-ratio .ratio-box{background:${SPEC};}
          .ratio-size{font-size:15px;color:var(--muted);font-variant-numeric:tabular-nums;}
          .ratio-caption{margin-top:20px;display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap;font-size:16px;}
          .pipeline{display:grid;grid-template-columns:repeat(3,1fr);gap:56px;margin-top:40px;}
          .pipeline article{border-top:2px solid ${SPEC};padding:22px 0;position:relative;}
          .pipeline article:after{content:'';position:absolute;right:-42px;top:64px;width:28px;height:1px;background:#C7CCD5;}
          .pipeline article:last-child:after{display:none;}
          .pipeline .packet{height:9px;width:9px;background:${SPEC};position:absolute;top:-5px;left:0;animation:packet 2.6s cubic-bezier(.16,1,.3,1) infinite;}
          .pipeline article:nth-child(2) .packet{animation-delay:.6s}.pipeline article:nth-child(3) .packet{animation-delay:1.2s}
          @keyframes packet{from{left:0}to{left:95%}}
          .pipeline h3{font-size:24px;font-weight:600;letter-spacing:-.02em;margin:0 0 12px;}
          .pipeline p{font-size:17px;line-height:1.55;color:var(--muted);margin:0;}
          .method{margin-top:36px;padding:20px 24px;background:var(--sheet);font-size:16px;line-height:1.8;border:1px solid var(--rule);}
          .method b{color:${SPEC};font-weight:600;}
          .check-row{display:flex;gap:16px;flex-wrap:wrap;}
          .check-row span{font-size:17px;border:1px solid var(--rule);padding:12px 18px;}
          .check-row b{font-weight:600;}
          .verdicts{display:flex;gap:28px;flex-wrap:wrap;margin-top:28px;font-size:16px;color:var(--muted);}
          .pass{color:#047857}.warn{color:#6B4E00}.fail{color:#B91C1C}
          .two{display:grid;grid-template-columns:1fr 1fr;gap:64px;}
          .tags{display:flex;gap:10px;flex-wrap:wrap;margin-top:24px;}
          .tags span{font-size:15px;border:1px solid var(--rule);padding:8px 14px;background:var(--sheet);}
          .close{padding:110px 0;border-top:1px solid var(--rule);}
          .close h2{font-size:clamp(46px,7.4vw,96px);line-height:1.02;letter-spacing:-.04em;font-weight:600;margin:0 0 22px;}
          .close p{font-size:20px;line-height:1.5;color:var(--muted);margin:0;max-width:640px;}
          .close-links{display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap;border-top:1px solid var(--rule);margin-top:48px;padding-top:24px;}
          .rise{animation:rise .8s cubic-bezier(.16,1,.3,1) both;animation-delay:var(--delay,0ms);}
          @keyframes rise{from{opacity:.3;transform:translateY(18px);clip-path:inset(0 0 35%)}to{opacity:1;transform:translateY(0);clip-path:inset(0)}}
          @media(prefers-reduced-motion:reduce){.rise,.pipeline .packet{animation:none!important}}
          @media(max-width:900px){
            .v-wrap{padding:0 16px;}
            .hide-sm{display:none !important;}
            .intro{flex-direction:column;align-items:flex-start;padding:40px 0 64px;}
            .frame-study{width:100%;}
            .ratio-board{flex-wrap:wrap;justify-content:center;gap:28px 12px;}
            .ratio-box{width:calc(var(--w) * .5);height:calc(var(--h) * .5);}
            .pipeline,.two{grid-template-columns:1fr;gap:28px;}
            .pipeline article:after{display:none;}
            .scene{padding:64px 0;}
          }
        `}</style>

        {/* Nav */}
        <nav style={{ borderBottom: "1px solid #E3E6EB", background: "#fff", position: "sticky", top: 0, zIndex: 50 }}>
          <div className="v-wrap" style={{ height: 64, display: "flex", alignItems: "center", gap: 28 }}>
            <VersaLogo height={28} />
            <div className="hide-sm" style={{ display: "flex", gap: 24, marginLeft: 12 }}>
              <button className="v-link" onClick={() => document.getElementById("formats")?.scrollIntoView({ behavior: "smooth" })}>Formats</button>
              <button className="v-link" onClick={() => document.getElementById("request")?.scrollIntoView({ behavior: "smooth" })}>How it works</button>
              <button className="v-link" onClick={() => router.push("/pricing")}>Pricing</button>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
              <button className="v-btn v-btn-ghost hide-sm" onClick={() => router.push("/auth?tab=login")}>Sign in</button>
              <button className="v-btn v-btn-primary" onClick={start}>Get started</button>
            </div>
          </div>
        </nav>

        {/* 01 One creative */}
        <section className="v-wrap">
          <div className="intro">
            <div>
              <h1 className="rise">One creative.<br />More formats.</h1>
              <p className="rise" style={{ ["--delay" as string]: "120ms" } as React.CSSProperties}>
                Versa brings image transformation, creation, and review into an agency workspace.
              </p>
              <div className="rise" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 30, ["--delay" as string]: "180ms" } as React.CSSProperties}>
                <button className="v-btn v-btn-primary" onClick={start}>Get started free</button>
                <button className="v-btn v-btn-ghost" onClick={() => router.push("/pricing")}>View pricing</button>
              </div>
              <div className="intro-note rise" style={{ ["--delay" as string]: "240ms" } as React.CSSProperties}>
                Square · Story · Landscape · Portrait · Ultrawide
              </div>
            </div>
            <div className="frame-study rise" aria-hidden style={{ ["--delay" as string]: "200ms" } as React.CSSProperties}>
              <Drawing w={58.7} h={35.2} x={6.3} y={14.5} label="16:9" drift={-14} />
              <Drawing w={29.4} h={51.6} x={57.9} y={37.9} label="9:16" drift={16} />
              <Drawing w={30.2} h={30.6} x={12.7} y={58.1} label="1:1" />
            </div>
          </div>
        </section>

        {/* 03 Five standard formats */}
        <section id="formats" className="scene">
          <div className="v-wrap">
            <h2>Five standard formats.<br />One repeatable workflow.</h2>
            <p className="small" style={{ marginBottom: 36 }}>The native output sizes each preset produces.</p>
          </div>
          <RatioBoard />
          <div className="v-wrap">
            <div className="ratio-caption">
              <span>Source → chosen preset → generated image → fitted PNG</span>
              <span className="small">Format diagram, not generated artwork.</span>
            </div>
          </div>
        </section>

        {/* 04 Inside the request */}
        <section id="request" className="scene">
          <div className="v-wrap">
            <h2>Generate. Fit. Store.</h2>
            <p className="small">What one image request does behind the interface.</p>
            <div className="pipeline">
              <article><i className="packet" /><h3>Gemini image generation</h3><p>The image and optional prompt guide the model response.</p></article>
              <article><i className="packet" /><h3>Pillow output fitting</h3><p>The returned image is fitted to the preset&apos;s native pixel dimensions.</p></article>
              <article><i className="packet" /><h3>Spaces + history</h3><p>The PNG is uploaded and the operation is recorded for the account.</p></article>
            </div>
            <div className="method">
              <b>POST /api/resize</b><br />file + aspect_ratio + optional prompt → image URL + operation metadata
            </div>
            <p className="small" style={{ marginTop: 18 }}>Sequence illustration. No processing-time or text-preservation guarantee is implied.</p>
          </div>
        </section>

        {/* 05 Review the output */}
        <section className="scene">
          <div className="v-wrap">
            <div className="scene-head">
              <h2>Review the output.</h2>
              <p className="small">Compliance reports combine technical checks, visual heuristics, and model-assisted analysis.</p>
            </div>
            <div className="check-row">
              <span><b>Technical</b> · size / format</span>
              <span><b>Visual</b> · layout heuristics</span>
              <span><b>Content</b> · vision analysis</span>
            </div>
            <div className="verdicts">
              <span>Reports can warn or fail; model judgments require human review.</span>
              <span><b className="pass">PASS</b> / <b className="warn">WARN</b> / <b className="fail">FAIL</b></span>
            </div>
          </div>
        </section>

        {/* 06 + 07 Team, web and mobile */}
        <section className="scene">
          <div className="v-wrap two">
            <div>
              <h2>The team around the creative.</h2>
              <p className="small">Organizations, users, shared plans, credits, history, and billing.</p>
              <div className="tags">
                {["Organizations", "Users and roles", "Shared plans", "Credits", "History", "Billing"].map((t) => <span key={t}>{t}</span>)}
              </div>
            </div>
            <div>
              <h2>The workflow, on a smaller screen.</h2>
              <p className="small">The Expo app provides transformation, creation, history, and result screens.</p>
              <div className="tags">
                {["Transformation", "Creation", "History", "Results"].map((t) => <span key={t}>{t}</span>)}
              </div>
            </div>
          </div>
        </section>

        {/* 08 Versa */}
        <section className="close">
          <div className="v-wrap">
            <h2>Create. Adapt.<br />Review. Export.</h2>
            <p>A creative workflow across web, backend, and mobile. Start with 2 free generations, then choose a plan.</p>
            <div className="close-links">
              <VersaLogo height={30} />
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button className="v-btn v-btn-primary" onClick={start}>Get started free</button>
                <button className="v-btn v-btn-ghost" onClick={() => router.push("/pricing")}>View pricing</button>
              </div>
            </div>
          </div>
        </section>

        <footer style={{ borderTop: "1px solid #E3E6EB" }}>
          <div className="v-wrap" style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", justifyContent: "space-between", padding: "28px 40px" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: 13, color: "#6B7380" }}>
              <VersaMark size={22} /> Versa / Creative workflows
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
