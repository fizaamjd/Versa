"use client";
import React, { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";
import { VersaLogo, VersaMark } from "@/components/brand/VersaLogo";
import { CAMPAIGNS, PRESETS, FitCampaign } from "./components/home/Campaigns";

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

/* ── Hero wall: every sample campaign in every supported format ── */
const ROW_ORDER = [
  ["landscape", "portrait", "square", "ultrawide", "story"],
  ["story", "ultrawide", "landscape", "square", "portrait"],
  ["square", "landscape", "story", "portrait", "ultrawide"],
];

function CampaignWall() {
  return (
    <div className="wall" aria-label="Three sample campaigns, each in all five supported formats">
      {CAMPAIGNS.map((c, r) => (
        <div key={c.id} className="wall-row" style={{ marginLeft: [-60, -220, -120][r] }}>
          {[...ROW_ORDER[r], ...ROW_ORDER[r]].map((id, i) => {
            const p = PRESETS.find((x) => x.id === id)!;
            return (
              <div key={`${id}-${i}`} className="wall-tile" style={{ aspectRatio: `${p.w} / ${p.h}` }}>
                <FitCampaign c={c} presetId={id} label={false} />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ── Interactive preview: pick a campaign and a format ── */
function FormatPreview({ onStart }: { onStart: () => void }) {
  const [cid, setCid] = useState(CAMPAIGNS[1].id);
  const [pid, setPid] = useState("landscape");
  const c = CAMPAIGNS.find((x) => x.id === cid)!;
  const p = PRESETS.find((x) => x.id === pid)!;
  const tall = p.h > p.w;
  return (
    <div className="preview-grid">
      <div className="preview-stage">
        <div style={{ width: tall ? "min(100%, 360px)" : "100%" }}>
          <FitCampaign c={c} presetId={pid} label={false} />
        </div>
      </div>
      <div className="preview-side">
        <div style={{ fontSize: 13, color: "#4A5260", marginBottom: 8 }}>Sample campaign</div>
        <div role="radiogroup" aria-label="Sample campaign" style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {CAMPAIGNS.map((x) => (
            <button key={x.id} type="button" role="radio" aria-checked={x.id === cid} onClick={() => setCid(x.id)}
              style={{ flex: 1, padding: 0, border: `2px solid ${x.id === cid ? SPEC : "transparent"}`, borderRadius: 4, background: "none", cursor: "pointer" }}>
              <span style={{ display: "block", aspectRatio: "1 / 1", backgroundImage: `url(${x.img})`, backgroundSize: "cover", backgroundPosition: x.focus, borderRadius: 2 }} />
              <span style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: INK, padding: "6px 0 4px" }}>{x.brand}</span>
            </button>
          ))}
        </div>
        <div style={{ fontSize: 13, color: "#4A5260", marginBottom: 8 }}>Format</div>
        <div role="radiogroup" aria-label="Format" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {PRESETS.map((x) => {
            const on = x.id === pid;
            const a = x.w / x.h;
            return (
              <button key={x.id} type="button" role="radio" aria-checked={on} onClick={() => setPid(x.id)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", minHeight: 44, border: `1px solid ${on ? SPEC : "#C7CCD5"}`, background: on ? "#F4F6FE" : "#fff", borderRadius: 4, cursor: "pointer", font: "inherit", textAlign: "left" }}>
                <span aria-hidden style={{ width: 24, height: 24, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                  <span style={{ width: a >= 1 ? 22 : 22 * a, height: a >= 1 ? 22 / a : 22, border: `1.5px solid ${on ? SPEC : INK}` }} />
                </span>
                <span>
                  <span style={{ display: "block", fontSize: 14, fontWeight: 600, color: on ? SPEC : INK }}>{x.label}</span>
                  <span className="spec-figure" style={{ fontSize: 12, color: "#4A5260" }}>{x.w} × {x.h}</span>
                </span>
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 24, paddingTop: 16, borderTop: "1px solid #E3E6EB" }}>
          <span style={{ fontSize: 13, color: "#4A5260" }}>{p.label} · {p.ratio}</span>
          <span className="spec-figure" style={{ fontSize: 26, fontWeight: 600, color: INK }}>{p.w} × {p.h}</span>
        </div>
        <button className="v-btn v-btn-primary" style={{ width: "100%", marginTop: 16 }} onClick={onStart}>Try it with your image</button>
        <p style={{ fontSize: 12, color: "#6B7380", marginTop: 10, lineHeight: 1.5 }}>
          Illustrative artwork for fictional brands. Real outputs are generated from your own image and will differ.
        </p>
      </div>
    </div>
  );
}

/* ── A sample report, drawn the way the app shows one ── */
const CHECKS = [
  ["Dimensions", "1344 × 768", "Matches the preset"],
  ["Format and file size", "PNG · 412 KB", "Within limits"],
  ["Text contrast", "7.9 : 1", "Readable"],
  ["Safe zone", "Clear", "Nothing important at the edge"],
  ["AI review", "Headline legible", "Brand mark intact"],
];

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
  const halo = CAMPAIGNS[1];

  return (
    <>
      <AnimatePresence>{showIntro && <IntroAnimation key="intro" onDone={handleIntroDone} />}</AnimatePresence>

      <div style={{ background: "#fff", color: INK, overflowX: "hidden" }}>
        <style>{`
          .v-wrap{max-width:1200px;margin:0 auto;padding:0 40px;}
          .v-btn{font:inherit;font-weight:600;font-size:14px;border-radius:4px;padding:12px 20px;cursor:pointer;white-space:nowrap;}
          .v-btn-primary{background:${SPEC};color:#fff;border:1px solid ${SPEC};}
          .v-btn-primary:hover{background:#1B38B4;border-color:#1B38B4;}
          .v-btn-ghost{background:#fff;color:${INK};border:1px solid #C7CCD5;}
          .v-btn-ghost:hover{border-color:${INK};}
          .v-btn-light{background:#fff;color:${INK};border:1px solid #fff;}
          .v-link{color:#4A5260;font-size:14px;cursor:pointer;text-decoration:none;background:none;border:0;font:inherit;}
          .v-link:hover{color:${INK};text-decoration:underline;}
          .h2{font-size:clamp(28px,3.6vw,46px);font-weight:600;letter-spacing:-0.025em;line-height:1.06;margin:0 0 14px;}
          .lead{font-size:17px;color:#4A5260;line-height:1.6;max-width:620px;margin:0;}
          .wall{display:flex;flex-direction:column;gap:12px;padding:8px 0;}
          .wall-row{display:flex;gap:12px;height:210px;}
          .wall-tile{height:100%;flex:none;}
          .preview-grid{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:40px;align-items:start;}
          .preview-stage{background:#F6F7F9;border:1px solid #E3E6EB;border-radius:6px;padding:32px;min-height:460px;display:flex;align-items:center;justify-content:center;}
          .flow{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;}
          .flow-panel{background:#fff;border:1px solid #E3E6EB;border-radius:6px;padding:20px;display:flex;flex-direction:column;gap:14px;}
          .report{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:32px;align-items:center;}
          .engines{display:grid;grid-template-columns:1fr 1fr;gap:24px;}
          @media(max-width:960px){
            .v-wrap{padding:0 16px;}
            .hide-sm{display:none !important;}
            .wall-row{height:120px;gap:8px;}
            .wall{gap:8px;}
            .preview-grid,.flow,.report,.engines{grid-template-columns:1fr;}
            .preview-stage{min-height:0;padding:16px;}
          }
        `}</style>

        {/* Nav */}
        <nav style={{ borderBottom: "1px solid #E3E6EB", background: "#fff", position: "sticky", top: 0, zIndex: 50 }}>
          <div className="v-wrap" style={{ height: 64, display: "flex", alignItems: "center", gap: 28 }}>
            <VersaLogo height={28} />
            <div className="hide-sm" style={{ display: "flex", gap: 24, marginLeft: 12 }}>
              <button className="v-link" onClick={() => document.getElementById("try")?.scrollIntoView({ behavior: "smooth" })}>Formats</button>
              <button className="v-link" onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}>How it works</button>
              <button className="v-link" onClick={() => router.push("/pricing")}>Pricing</button>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
              <button className="v-btn v-btn-ghost hide-sm" onClick={() => router.push("/auth?tab=login")}>Sign in</button>
              <button className="v-btn v-btn-primary" onClick={start}>Get started</button>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section style={{ paddingTop: "clamp(40px,7vh,80px)" }}>
          <div className="v-wrap" style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "24px 48px", marginBottom: 44 }}>
            <div style={{ flex: "1 1 560px" }}>
              <h1 style={{ fontSize: "clamp(40px,6.6vw,88px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 0.96, margin: 0 }}>
                One image.<br />Every format.
              </h1>
            </div>
            <div style={{ flex: "0 1 380px" }}>
              <p className="lead" style={{ marginBottom: 20 }}>
                Upload an image or describe one, pick square, story, landscape, portrait or ultrawide, and review each result with
                its report.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button className="v-btn v-btn-primary" onClick={start}>Get started free</button>
                <button className="v-btn v-btn-ghost" onClick={() => router.push("/pricing")}>View pricing</button>
              </div>
            </div>
          </div>
          <CampaignWall />
          <div className="v-wrap">
            <p style={{ fontSize: 12, color: "#6B7380", margin: "12px 0 0" }}>Three sample campaigns in all five formats. Illustrative artwork for fictional brands.</p>
          </div>
        </section>

        {/* Try the formats */}
        <section id="try" style={{ padding: "112px 0 96px" }}>
          <div className="v-wrap">
            <h2 className="h2">Five formats. Pick the ones you need.</h2>
            <p className="lead" style={{ marginBottom: 40 }}>
              Each output is produced at the preset&apos;s native size. Switch campaign and format to see how one idea holds up
              across shapes.
            </p>
            <FormatPreview onStart={start} />
          </div>
        </section>

        {/* How it works */}
        <section id="how" style={{ background: "#F6F7F9", borderTop: "1px solid #E3E6EB", borderBottom: "1px solid #E3E6EB", padding: "96px 0" }}>
          <div className="v-wrap">
            <h2 className="h2">From one upload to a reviewed set.</h2>
            <p className="lead" style={{ marginBottom: 40 }}>Two minutes of your time, then the engine does the rest.</p>
            <div className="flow">
              <div className="flow-panel">
                <div style={{ position: "relative", aspectRatio: "3 / 2", backgroundImage: "url(/sample/headphones.jpg)", backgroundSize: "cover", backgroundPosition: "center", borderRadius: 3 }}>
                  <span className="spec-figure" style={{ position: "absolute", left: 10, bottom: 10, background: "rgba(16,20,24,0.82)", color: "#fff", fontSize: 12, padding: "4px 8px", borderRadius: 2 }}>headphones.jpg · 1400 × 933</span>
                </div>
                <div><div style={{ fontSize: 16, fontWeight: 600 }}>Upload one image</div><div style={{ fontSize: 14, color: "#4A5260", marginTop: 4, lineHeight: 1.55 }}>Or, in the Creation Engine, describe the image you want.</div></div>
              </div>
              <div className="flow-panel">
                <div style={{ aspectRatio: "3 / 2", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, alignContent: "center" }}>
                  {PRESETS.map((x) => {
                    const on = x.id === "square" || x.id === "story";
                    return (
                      <span key={x.id} style={{ fontSize: 13, fontWeight: 600, padding: "9px 10px", border: `1px solid ${on ? SPEC : "#C7CCD5"}`, background: on ? "#F4F6FE" : "#fff", color: on ? SPEC : INK, borderRadius: 4 }}>
                        {on ? "✓ " : ""}{x.label}
                      </span>
                    );
                  })}
                </div>
                <div><div style={{ fontSize: 16, fontWeight: 600 }}>Pick up to two formats</div><div style={{ fontSize: 14, color: "#4A5260", marginTop: 4, lineHeight: 1.55 }}>Each batch takes up to two of the five presets.</div></div>
              </div>
              <div className="flow-panel">
                <div style={{ aspectRatio: "3 / 2", display: "flex", gap: 10, alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: "38%" }}><FitCampaign c={halo} presetId="square" label={false} /></div>
                  <div style={{ width: "26%" }}><FitCampaign c={halo} presetId="story" label={false} /></div>
                </div>
                <div><div style={{ fontSize: 16, fontWeight: 600 }}>Review results and reports</div><div style={{ fontSize: 14, color: "#4A5260", marginTop: 4, lineHeight: 1.55 }}>Check each output and its report, then download.</div></div>
              </div>
            </div>
          </div>
        </section>

        {/* Report */}
        <section style={{ padding: "112px 0" }}>
          <div className="v-wrap report">
            <div>
              <FitCampaign c={CAMPAIGNS[2]} presetId="landscape" label={false} />
            </div>
            <div>
              <h2 className="h2">Every result comes with a report.</h2>
              <p className="lead" style={{ fontSize: 16, marginBottom: 24 }}>
                Technical checks plus an AI review. Use it to catch problems early, then review the artwork yourself; a report is
                not a certification.
              </p>
              <div style={{ border: "1px solid #E3E6EB", borderRadius: 6 }}>
                {CHECKS.map(([name, value, note], i) => (
                  <div key={name} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "2px 16px", padding: "12px 16px", borderTop: i ? "1px solid #EEF0F3" : "none" }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{name}</span>
                    <span className="spec-figure" style={{ fontSize: 14, fontWeight: 600, textAlign: "right" }}>{value}</span>
                    <span style={{ fontSize: 13, color: "#4A5260" }}>{note}</span>
                    <span style={{ fontSize: 13, color: "#047857", fontWeight: 600, textAlign: "right" }}>Pass</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 12, color: "#6B7380", marginTop: 10 }}>Sample report on sample artwork. Values are illustrative.</p>
            </div>
          </div>
        </section>

        {/* Engines */}
        <section style={{ borderTop: "1px solid #E3E6EB", padding: "96px 0" }}>
          <div className="v-wrap">
            <h2 className="h2" style={{ marginBottom: 32 }}>Two ways to start.</h2>
            <div className="engines">
              <div style={{ border: "1px solid #E3E6EB", borderRadius: 6, overflow: "hidden" }}>
                <div style={{ background: "#F6F7F9", padding: 24, display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: "34%", aspectRatio: "3 / 2", backgroundImage: "url(/sample/cold-brew.jpg)", backgroundSize: "cover", backgroundPosition: "center 55%", borderRadius: 2, flex: "none" }} />
                  <span aria-hidden style={{ fontSize: 22, color: "#6B7380" }}>→</span>
                  <div style={{ flex: 1, display: "flex", gap: 8, alignItems: "flex-end" }}>
                    <div style={{ width: "58%" }}><FitCampaign c={CAMPAIGNS[0]} presetId="ultrawide" label={false} /></div>
                    <div style={{ width: "26%" }}><FitCampaign c={CAMPAIGNS[0]} presetId="portrait" label={false} /></div>
                  </div>
                </div>
                <div style={{ padding: 24 }}>
                  <h3 style={{ fontSize: 22, fontWeight: 600, margin: "0 0 8px", color: SPEC }}>Transformation Engine</h3>
                  <p style={{ fontSize: 15, color: "#4A5260", lineHeight: 1.6, margin: "0 0 16px" }}>Upload an image and choose up to two presets per batch. Review the transformed outputs and their reports before downloading.</p>
                  <button className="v-link" style={{ color: SPEC, fontWeight: 600 }} onClick={start}>Transform an image →</button>
                </div>
              </div>
              <div style={{ border: "1px solid #E3E6EB", borderRadius: 6, overflow: "hidden" }}>
                <div style={{ background: "#F6F7F9", padding: 24, display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ flex: 1, background: "#fff", border: "1px solid #C7CCD5", borderRadius: 4, padding: "12px 14px", fontSize: 14, lineHeight: 1.5, color: INK }}>
                    Spring shoe campaign, teal suede on peach, room for a headline
                    <div style={{ marginTop: 8, fontSize: 12, color: "#4A5260" }}>Format: Square</div>
                  </div>
                  <span aria-hidden style={{ fontSize: 22, color: "#6B7380" }}>→</span>
                  <div style={{ width: "34%", flex: "none" }}><FitCampaign c={CAMPAIGNS[2]} presetId="square" label={false} /></div>
                </div>
                <div style={{ padding: 24 }}>
                  <h3 style={{ fontSize: 22, fontWeight: 600, margin: "0 0 8px" }}>Creation Engine</h3>
                  <p style={{ fontSize: 15, color: "#4A5260", lineHeight: 1.6, margin: "0 0 16px" }}>Describe the image you want and pick a supported preset. Review the generated artwork before using it.</p>
                  <button className="v-link" style={{ color: INK, fontWeight: 600 }} onClick={start}>Create from a prompt →</button>
                </div>
              </div>
            </div>
            <p style={{ fontSize: 12, color: "#6B7380", marginTop: 14 }}>Illustrative examples with sample artwork.</p>
          </div>
        </section>

        {/* Close */}
        <section style={{ background: INK, color: "#fff", padding: "88px 0", overflow: "hidden" }}>
          <div className="v-wrap" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 48 }}>
            <div style={{ flex: "1 1 420px" }}>
              <h2 style={{ fontSize: "clamp(32px,4.6vw,58px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.0, margin: "0 0 14px" }}>
                Bring one image.
              </h2>
              <p style={{ fontSize: 17, color: "#C7CCD5", lineHeight: 1.6, margin: "0 0 24px" }}>Start with 2 free generations, then choose a plan. Cancel anytime.</p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button className="v-btn v-btn-light" onClick={start}>Get started free</button>
                <button className="v-btn" style={{ background: "transparent", color: "#fff", border: "1px solid #4A5260" }} onClick={() => router.push("/pricing")}>View pricing</button>
              </div>
            </div>
            <div aria-hidden style={{ flex: "1 1 380px", display: "flex", gap: 10, alignItems: "flex-end" }}>
              <div style={{ width: "40%" }}><CampaignTile id="story" /></div>
              <div style={{ width: "60%", display: "flex", flexDirection: "column", gap: 10 }}>
                <CampaignTile id="landscape" />
                <CampaignTile id="square" w="60%" />
              </div>
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

function CampaignTile({ id, w = "100%" }: { id: string; w?: string }) {
  return (
    <div style={{ width: w }}>
      <FitCampaign c={CAMPAIGNS[1]} presetId={id} label={false} />
    </div>
  );
}
