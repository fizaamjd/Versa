"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, useInView, useScroll, useTransform, useSpring, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";
import LayersIcon from "@mui/icons-material/Layers";
import CropIcon from "@mui/icons-material/Crop";
import TimerOffIcon from "@mui/icons-material/TimerOff";
import VerifiedIcon from "@mui/icons-material/Verified";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AspectRatioIcon from "@mui/icons-material/AspectRatio";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import { VersaLogo, VersaMark } from "@/components/brand/VersaLogo";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import GridViewIcon from "@mui/icons-material/GridView";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import TransformIcon from "@mui/icons-material/Transform";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import TuneIcon from "@mui/icons-material/Tune";
import ImageSearchIcon from "@mui/icons-material/ImageSearch";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import LockIcon from "@mui/icons-material/Lock";

/* ─── Versa palette: the media owner's spec sheet ─── */
const P   = "#2346D9";  /* spec blue: action and selection */
const PL  = "#F4F6FE";  /* spec tint */
const PM  = "#E8EDFC";  /* selected chip */
const G1  = "#1B38B4";  /* spec blue, pressed */
const GA  = "#4F6CE1";  /* spec blue, light (icons on ink) */
const INK = "#101418";

const btnGrad = P;
const ctaBg   = INK;

/* ── useBreakpoint ──────────────────────────────────────────────── */
function useBreakpoint() {
  const [w, setW] = useState(1200);
  useEffect(() => {
    const upd = () => setW(window.innerWidth);
    upd();
    window.addEventListener("resize", upd);
    return () => window.removeEventListener("resize", upd);
  }, []);
  return { isMobile: w < 640, isTablet: w < 1024, w };
}

/* ── useRipple ──────────────────────────────────────────────────── */
function useRipple() {
  const [rs, setRs] = useState<{ x: number; y: number; id: number }[]>([]);
  const add = (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRs(p => [...p, { x: e.clientX - r.left, y: e.clientY - r.top, id }]);
    setTimeout(() => setRs(p => p.filter(x => x.id !== id)), 800);
  };
  return { rs, add };
}

/* ── ScrollBar ──────────────────────────────────────────────────── */
function ScrollBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });
  return <motion.div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, background: P, scaleX, transformOrigin: "left", zIndex: 9999, pointerEvents: "none" }} />;
}

/* ── MagBtn ─────────────────────────────────────────────────────── */
function MagBtn({ children, onClick, ghost, style: ex }: { children: React.ReactNode; onClick?: () => void; ghost?: boolean; style?: React.CSSProperties }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [off, setOff] = useState({ x: 0, y: 0 });
  const { rs, add } = useRipple();
  return (
    <motion.button ref={ref}
      animate={{ x: off.x, y: off.y }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      onMouseMove={e => { if (!ref.current) return; const rc = ref.current.getBoundingClientRect(); setOff({ x: (e.clientX - rc.left - rc.width / 2) * 0.08, y: (e.clientY - rc.top - rc.height / 2) * 0.08 }); }}
      onMouseLeave={() => setOff({ x: 0, y: 0 })}
      whileTap={{ scale: 0.98 }}
      onClick={e => { add(e); onClick?.(); }}
      className={ghost ? "btn-ghost" : "btn-primary"}
      style={{ position: "relative", overflow: "hidden", ...ex }}>
      {children}
      {rs.map(r => <span key={r.id} style={{ position: "absolute", left: r.x, top: r.y, width: 8, height: 8, borderRadius: "50%", background: ghost ? `${P}44` : "rgba(255,255,255,0.4)", transform: "translate(-50%,-50%)", animation: "ripple-out 0.75s ease-out forwards", pointerEvents: "none" }} />)}
    </motion.button>
  );
}


/* ── Demo Processor ─────────────────────────────────────────────── */
const LOAD_STEPS = [
  "Reading the source composition…",
  "Separating photo, logo and copy layers…",
  "Recomposing each target size…",
  "Checking every output against its spec…",
];

function DemoProcessor() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<"idle" | "loading" | "done">("idle");
  const [srcUrl, setSrcUrl] = useState("");
  const [loadStep, setLoadStep] = useState(0);
  const [selFmt, setSelFmt] = useState("story");
  const [dragging, setDragging] = useState(false);

  const FMTS = [
    { id: "story",     label: "OOH 504 × 1008"  },
    { id: "square",    label: "OOH 1344 × 432"  },
    { id: "landscape", label: "QMS 2640 × 288"  },
    { id: "portrait",  label: "OOH 768 × 1152"  },
  ];

  const runFake = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setSrcUrl(url);
    setPhase("loading");
    setLoadStep(0);
    let step = 0;
    const iv = setInterval(() => {
      step++;
      setLoadStep(step);
      if (step >= LOAD_STEPS.length - 1) { clearInterval(iv); setTimeout(() => setPhase("done"), 500); }
    }, 700);
  };

  const reset = () => { if (srcUrl) URL.revokeObjectURL(srcUrl); setSrcUrl(""); setPhase("idle"); setLoadStep(0); };

  return (
    <div style={{ background: "white", border: "1px solid #C7CCD5", borderRadius: 6, overflow: "hidden", boxShadow: "0 1px 2px rgba(16,20,24,0.06)" }}>
      {/* Panel header, drawn like a spec-sheet title block */}
      <div style={{ background: "#F6F7F9", borderBottom: "1px solid #E3E6EB", padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        <VersaMark size={18} />
        <span style={{ fontSize: 12, fontWeight: 600, color: INK }}>Transformation Engine</span>
        <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: "#4A5260" }}>
          <FactCheckIcon sx={{ fontSize: 13, color: P }} /> Spec check on
        </span>
      </div>

      <div style={{ padding: "18px 18px 16px" }}>
        {/* IDLE */}
        {phase === "idle" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div
              onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) runFake(f); }}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onClick={() => fileInputRef.current?.click()}
              style={{ height: 112, background: dragging ? PL : "#f6f7f9", border: `2px dashed ${dragging ? P : "#c7ccd5"}`, borderRadius: 6, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", gap: 5, transition: "all 0.2s" }}>
              <motion.div animate={{ y: dragging ? -5 : 0 }} transition={{ type: "spring", stiffness: 400 }}>
                <CloudUploadIcon sx={{ fontSize: 30, color: dragging ? P : "#6b7380" }} />
              </motion.div>
              <span style={{ fontSize: 12, color: dragging ? P : "#6b7380", fontWeight: 500 }}>{dragging ? "Release to upload" : "Drop your approved artwork or click to upload"}</span>
              <span style={{ fontSize: 10, color: "#6b7380" }}>PNG · JPG · WEBP — free to try</span>
            </div>

            <div style={{ marginTop: 10, display: "flex", gap: 5, flexWrap: "wrap" }}>
              {FMTS.map(f => (
                <button key={f.id} onClick={() => setSelFmt(f.id)}
                  style={{ background: selFmt === f.id ? PM : "white", border: `1.5px solid ${selFmt === f.id ? P : "#e3e6eb"}`, color: selFmt === f.id ? P : "#6b7380", borderRadius: 3, padding: "4px 10px", fontSize: 10, fontWeight: 500, cursor: "pointer", transition: "all 0.15s" }}>
                  {f.label}
                </button>
              ))}
            </div>

            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
              onClick={() => fileInputRef.current?.click()}
              style={{ marginTop: 10, width: "100%", background: btnGrad, color: "white", border: "none", borderRadius: 4, padding: "11px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <AspectRatioIcon sx={{ fontSize: 14 }} /> Recompose this image
            </motion.button>

            <div style={{ marginTop: 8, display: "flex", justifyContent: "center", gap: 18 }}>
              {[["Exact pixels",P],["Layer-aware",INK],["Free to try",P]].map(([t,c]) => (
                <span key={t} style={{ fontSize: 10, color: "#6b7380", display: "flex", alignItems: "center", gap: 3 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: c as string, flexShrink: 0, display: "inline-block" }} />{t}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* LOADING */}
        {phase === "loading" && (
          <div style={{ height: 190, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }}
              style={{ width: 36, height: 36, borderRadius: "50%", border: `3px solid ${PM}`, borderTopColor: P }} />
            <div style={{ textAlign: "center" }}>
              <AnimatePresence mode="wait">
                <motion.div key={loadStep} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.22 }}
                  style={{ fontSize: 12, color: P, fontWeight: 500 }}>
                  {LOAD_STEPS[Math.min(loadStep, LOAD_STEPS.length - 1)]}
                </motion.div>
              </AnimatePresence>
              <div style={{ fontSize: 10, color: "#6b7380", marginTop: 4 }}>Versa · Recomposing your creative</div>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {LOAD_STEPS.map((_, i) => (
                <motion.div key={i}
                  animate={{ background: i <= loadStep ? P : "#e3e6eb", width: i <= loadStep ? 20 : 12 }}
                  transition={{ duration: 0.3 }}
                  style={{ height: 3, borderRadius: 2 }} />
              ))}
            </div>
          </div>
        )}

        {/* DONE — blurred fake output */}
        {phase === "done" && srcUrl && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, delay: 0.12 }}>
                <DoneAllIcon sx={{ fontSize: 14, color: "#10b981" }} />
              </motion.div>
              <span style={{ fontSize: 11, fontWeight: 500, color: "#10b981" }}>3 sizes recomposed</span>
            </div>

            {/* 2 top thumbnails */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 6 }}>
              {[
                { label: "OOH 504 × 1008", pos: "center top" },
                { label: "OOH 768 × 1152", pos: "center center" },
              ].map((f, i) => (
                <div key={i} onClick={() => router.push("/auth?tab=signup&redirect=/pricing")}
                  style={{ height: 110, position: "relative", borderRadius: 4, overflow: "hidden", cursor: "pointer" }}>
                  <img src={srcUrl} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: f.pos, filter: "blur(12px) saturate(1.1)", transform: "scale(1.12)" }} />
                  <div style={{ position: "absolute", inset: 0, background: "rgba(35, 70, 217,0.25)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3 }}>
                    <LockIcon sx={{ fontSize: 18, color: "white", opacity: 0.9 }} />
                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>{f.label}</span>
                  </div>
                  <div style={{ position: "absolute", top: 5, right: 5, background: "rgba(16,185,129,0.88)", borderRadius: 4, padding: "1px 5px", fontSize: 7, color: "white", fontWeight: 600 }}>READY</div>
                </div>
              ))}
            </div>

            {/* Landscape full-width */}
            <div onClick={() => router.push("/auth?tab=signup&redirect=/pricing")}
              style={{ height: 65, position: "relative", borderRadius: 4, overflow: "hidden", cursor: "pointer", marginBottom: 10 }}>
              <img src={srcUrl} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%", filter: "blur(12px) saturate(1.1) brightness(1.04)", transform: "scale(1.12)" }} />
              <div style={{ position: "absolute", inset: 0, background: "rgba(35, 70, 217,0.25)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
                <LockIcon sx={{ fontSize: 15, color: "white", opacity: 0.9 }} />
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>OOH 1344 × 432</span>
              </div>
              <div style={{ position: "absolute", top: 5, right: 5, background: "rgba(16,185,129,0.88)", borderRadius: 4, padding: "1px 5px", fontSize: 7, color: "white", fontWeight: 600 }}>READY</div>
            </div>

            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/auth?tab=signup&redirect=/pricing")}
              style={{ width: "100%", background: btnGrad, color: "white", border: "none", borderRadius: 4, padding: "11px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <LockIcon sx={{ fontSize: 14 }} /> Unlock Full Quality — View Plans
            </motion.button>
            <button onClick={reset} style={{ width: "100%", background: "transparent", color: "#6b7380", border: "none", padding: "6px", fontSize: 11, cursor: "pointer", marginTop: 2 }}>
              Try another image
            </button>
          </motion.div>
        )}
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) runFake(f); if (e.target) e.target.value = ""; }} />
    </div>
  );
}

/* ── FlowSVG ────────────────────────────────────────────────────── */
function FlowSVG() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const fmts = [
    { x:272, y:20,  w:64,  h:64,  label:"Custom"    },
    { x:346, y:14,  w:40,  h:72,  label:"504×1008"  },
    { x:272, y:96,  w:114, h:46,  label:"1952×896"  },
    { x:272, y:154, w:108, h:36,  label:"1344×432"  },
    { x:346, y:96,  w:44,  h:44,  label:"Custom"    },
  ];
  return (
    <svg ref={ref} viewBox="0 0 460 242" style={{ width:"100%", height:"auto", overflow:"visible" }}>
      <motion.rect x="8" y="56" width="112" height="112" rx="3" fill={PL} stroke={P} strokeWidth="2" initial={{ opacity:0 }} animate={inView?{opacity:1}:{}} transition={{ duration:0.5 }} />
      <motion.rect x="20" y="68" width="88" height="88" rx="3" fill={PM} initial={{ opacity:0 }} animate={inView?{opacity:1}:{}} transition={{ delay:0.25 }} />
      <motion.text x="64" y="118" textAnchor="middle" fontSize="10" fontWeight="600" fill={P} initial={{ opacity:0 }} animate={inView?{opacity:1}:{}} transition={{ delay:0.35 }}>Source</motion.text>
      <motion.path d="M 124 112 C 152 112 152 112 180 112" fill="none" stroke={P} strokeWidth="2.5" strokeLinecap="round" initial={{ pathLength:0 }} animate={inView?{pathLength:1}:{}} transition={{ delay:0.6, duration:0.45 }} />
      <motion.path d="M 176 107 L 183 112 L 176 117" fill="none" stroke={P} strokeWidth="2.5" strokeLinecap="round" initial={{ opacity:0 }} animate={inView?{opacity:1}:{}} transition={{ delay:1.0 }} />
            <motion.rect x="186" y="99" width="48" height="26" rx="2" fill={P} initial={{ scale:0, opacity:0 }} animate={inView?{scale:1,opacity:1}:{}} transition={{ delay:0.85, type:"spring", stiffness:280 }} style={{ transformOrigin:"210px 112px" }} />
      <motion.text x="210" y="116" textAnchor="middle" fontSize="9" fontWeight="700" fill="white" initial={{ opacity:0 }} animate={inView?{opacity:1}:{}} transition={{ delay:1.05 }}>Versa</motion.text>
      <motion.path d="M 234 112 L 250 112" fill="none" stroke={P} strokeWidth="2.5" strokeLinecap="round" initial={{ pathLength:0 }} animate={inView?{pathLength:1}:{}} transition={{ delay:1.2, duration:0.28 }} />
      {fmts.map((f,i) => { const fy=f.y+f.h/2; return <motion.path key={i} d={`M 252 112 Q 252 ${fy} ${f.x} ${fy}`} fill="none" stroke={`${P}50`} strokeWidth="1.5" strokeDasharray="4 3" initial={{ pathLength:0 }} animate={inView?{pathLength:1}:{}} transition={{ delay:1.35+i*0.1, duration:0.4 }} />; })}
      {fmts.map((f,i) => (
        <motion.g key={`f${i}`} initial={{ opacity:0 }} animate={inView?{opacity:1}:{}} transition={{ delay:1.5+i*0.1, duration:0.4 }}>
          <rect x={f.x} y={f.y} width={f.w} height={f.h} rx="3" fill={PL} stroke={P} strokeWidth="1.5" />
          <rect x={f.x+5} y={f.y+5} width={f.w-10} height={f.h-10} rx="3" fill={PM} />
          <text x={f.x+f.w/2} y={f.y+f.h/2+4} textAnchor="middle" fontSize="7.5" fontWeight="600" fill={P} style={{ fontStretch:"78%", fontVariantNumeric:"tabular-nums" }}>{f.label}</text>
          <motion.circle cx={f.x+f.w-5} cy={f.y+5} r="7" fill="#10b981" initial={{ scale:0 }} animate={inView?{scale:1}:{}} transition={{ delay:1.95+i*0.08, type:"spring", stiffness:300 }} style={{ transformOrigin:`${f.x+f.w-5}px ${f.y+5}px` }} />
          <motion.text x={f.x+f.w-5} y={f.y+9} textAnchor="middle" fontSize="7" fontWeight="700" fill="white" initial={{ opacity:0 }} animate={inView?{opacity:1}:{}} transition={{ delay:2.05+i*0.08 }}>✓</motion.text>
        </motion.g>
      ))}
    </svg>
  );
}

/* ── CompareBar ─────────────────────────────────────────────────── */
function CompareBar({ label, manual, ai }: { label:string; manual:string; ai:string }) {
  return (
    <motion.div initial={{ opacity:0, x:-30 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.5 }}
      style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, alignItems:"center", padding:"14px 0", borderBottom:"1px solid #eef0f3" }}>
      <span style={{ fontSize:13, fontWeight:400, color:"#2b313a" }}>{label}</span>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <CancelIcon sx={{ fontSize:14, color:"#ef4444", flexShrink:0 }} />
        <span style={{ fontSize:13, color:"#B91C1C" }}>{manual}</span>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <CheckCircleIcon sx={{ fontSize:14, color:"#10b981", flexShrink:0 }} />
        <span style={{ fontSize:13, color:"#047857", fontWeight:500 }}>{ai}</span>
      </div>
    </motion.div>
  );
}

/* ── BASlider ───────────────────────────────────────────────────── */
function BASlider() {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef(false);
  const [active, setActive] = useState(0);
  const platforms = ["OOH 1344 × 432","OOH 504 × 1008","OOH 768 × 1152","OOH 1952 × 896","QMS 2640 × 288"];
  const move = (cx: number) => {
    if (!drag.current || !ref.current) return;
    const rc = ref.current.getBoundingClientRect();
    setPos(Math.max(5, Math.min(95, ((cx - rc.left) / rc.width) * 100)));
  };
  return (
    <div>
      <div ref={ref} className="ba-slider"
        onPointerDown={e => { drag.current=true; (e.target as Element).setPointerCapture?.(e.pointerId); }}
        onPointerUp={() => { drag.current=false; }}
        onPointerMove={e => move(e.clientX)}>
        <div style={{ position:"absolute", inset:0, background:"#F6F7F9", display:"flex", alignItems:"center", justifyContent:"center", flexWrap:"wrap", gap:10, padding:24 }}>
          {[{w:1344,h:432},{w:504,h:1008},{w:768,h:1152},{w:1952,h:896},{w:2640,h:288}].map((f,i) => {
            const k = Math.min(132 / f.w, 96 / f.h);
            const fw = Math.round(f.w * k), fh = Math.round(f.h * k);
            return (
            <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
              {/* width dimension: extension ticks and an arrowed line, spec-sheet style */}
              <div aria-hidden style={{ position:"relative", width:fw, height:9, borderLeft:`1px solid ${INK}`, borderRight:`1px solid ${INK}` }}>
                <div style={{ position:"absolute", left:0, right:0, top:4, height:1, background:INK }} />
              </div>
              <motion.div initial={{ scaleY:0 }} whileInView={{ scaleY:1 }} viewport={{ once:true }} transition={{ delay:i*0.1, duration:0.5, ease:[0.22,1,0.36,1] }}
                className="spec-hatch"
                style={{ width:fw, height:fh, borderRadius:2, border:`1px solid ${P}`, position:"relative", transformOrigin:"bottom" }}>
                {/* safe area inside the hatched margin */}
                <div style={{ position:"absolute", inset:"12%", background:PM, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <div style={{ width:"50%", height:"50%", background:`${P}55`, borderRadius:1 }} />
                </div>
              </motion.div>
              <span className="spec-figure" style={{ fontSize:11, fontWeight:600, color:INK }}>{f.w} × {f.h}</span>
            </div>
            );
          })}
          <div style={{ position:"absolute", bottom:16, background:INK, borderRadius:3, padding:"7px 14px", display:"flex", alignItems:"center", gap:6 }}>
            <DoneAllIcon sx={{ fontSize:14, color:"#ffffff" }} />
            <span style={{ fontSize:12, fontWeight:500, color:"white" }}>Recomposed to spec</span>
          </div>
        </div>
        <div style={{ position:"absolute", inset:0, clipPath:`inset(0 ${100-pos}% 0 0)`, background:"#F6F7F9", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ width:170, height:170, margin:"0 auto 14px", background:"#ffffff", border:"1px solid #101418", borderRadius:3, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
              <CropIcon sx={{ fontSize:44, color:"#6B7380" }} />
              <div style={{ position:"absolute", top:8, left:8, background:"#ffffff", border:"1px solid #B91C1C", borderRadius:2, padding:"2px 7px", fontSize:10, color:"#B91C1C", fontWeight:600 }}>Cropped</div>
              <div style={{ position:"absolute", bottom:8, right:8, background:"#ffffff", border:"1px solid #B91C1C", borderRadius:2, padding:"2px 7px", fontSize:10, color:"#B91C1C", fontWeight:600 }}>Distorted</div>
            </div>
            <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"#ffffff", border:"1px solid #E3E6EB", borderRadius:3, padding:"6px 14px" }}>
              <CancelIcon sx={{ fontSize:14, color:"#B91C1C" }} />
              <span style={{ fontSize:12, fontWeight:500, color:"#B91C1C" }}>Resized by hand</span>
            </div>
          </div>
        </div>
        <div style={{ position:"absolute", top:0, bottom:0, left:`${pos}%`, width:3, background:"white", transform:"translateX(-50%)", zIndex:10, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 1px 2px rgba(16, 20, 24, 0.06)" }}>
          <motion.div whileHover={{ scale:1.12 }} style={{ width:42, height:42, borderRadius:"50%", background:"white", boxShadow:`0 1px 2px rgba(16, 20, 24, 0.06)`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"ew-resize" }}>
            <TuneIcon sx={{ fontSize:20, color:P }} />
          </motion.div>
        </div>
        <div style={{ position:"absolute", top:12, left:12, background:INK, borderRadius:2, padding:"3px 10px", fontSize:11, fontWeight:600, color:"white", zIndex:5 }}>Before</div>
        <div style={{ position:"absolute", top:12, right:12, background:P, borderRadius:2, padding:"3px 10px", fontSize:11, fontWeight:600, color:"white", zIndex:5 }}>After</div>
      </div>
      <div style={{ display:"flex", gap:7, justifyContent:"center", marginTop:14, flexWrap:"wrap" }}>
        {platforms.map((pl,i) => (
          <motion.button key={i} whileTap={{ scale:0.93 }} onClick={() => setActive(i)}
            style={{ background:active===i?PM:"white", border:`1.5px solid ${active===i?P:"#e3e6eb"}`, color:active===i?P:"#6b7380", borderRadius:4, padding:"6px 12px", fontSize:11, fontWeight:400, cursor:"pointer", transition:"all 0.18s" }}>
            {pl}
          </motion.button>
        ))}
      </div>
    </div>
  );
}


/* ── Platform Ticker ────────────────────────────────────────────── */
const TICKER = ["QMS 2640 × 288","OOH 1344 × 432","OOH 504 × 1008","QMS 1824 × 432","OOH 1952 × 896","QMS 1440 × 360","OOH 768 × 1152","OOH 3924 × 972","QMS 760 × 240","OOH 800 × 400","QMS 1120 × 320","OOH 1060 × 360"];

function PlatformTicker() {
  const items = [...TICKER, ...TICKER];
  return (
    <div style={{ position:"absolute", bottom:0, left:0, right:0, borderTop:"1px solid rgba(255,255,255,0.1)", overflow:"hidden", background:"rgba(16, 20, 24,0.82)", padding:"9px 0", zIndex:10 }}>
      <motion.div animate={{ x:["0%","-50%"] }} transition={{ duration:28, repeat:Infinity, ease:"linear" }}
        style={{ display:"flex", gap:0, whiteSpace:"nowrap", width:"max-content" }}>
        {items.map((t,i) => (
          <span key={i} style={{ fontSize:12, color:"rgba(255,255,255,0.55)", fontWeight:500, fontStretch:"78%", fontVariantNumeric:"tabular-nums", letterSpacing:"0.02em", padding:"0 26px", borderRight:i<items.length-1?"1px solid rgba(255,255,255,0.1)":"none" }}>{t}</span>
        ))}
      </motion.div>
    </div>
  );
}

/* ── Trust Strip ────────────────────────────────────────────────── */
function TrustStrip() {
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.1 }}
      style={{ display:"flex", alignItems:"center", gap:16, marginTop:28, flexWrap:"wrap" }}>
      <div>
        <span style={{ fontSize:12, color:"#6b7380", lineHeight:1 }}>
          In pilot with <strong style={{ color:"#101418" }}>agency creative teams</strong>
        </span>
      </div>
      <div style={{ width:1, height:28, background:"#e3e6eb", flexShrink:0 }} />
      <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:PL, border:`1px solid ${P}22`, borderRadius:3, padding:"5px 12px" }}>
        <CheckCircleIcon sx={{ fontSize:12, color:P }} />
        <span style={{ fontSize:11, fontWeight:400, color:P }}>No card needed</span>
      </div>
    </motion.div>
  );
}

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
          Every size from one creative
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

/* ════════════════════════════════════════════════════════════════
   MAIN LANDING PAGE
════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const router = useRouter();
  const { loading } = useAuth();
  const { isMobile, isTablet } = useBreakpoint();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeEngine, setActiveEngine] = useState(0);
  /* intro — only once per session */
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("ve_intro") !== "1";
  });
  const handleIntroDone = useCallback(() => {
    sessionStorage.setItem("ve_intro", "1");
    setShowIntro(false);
  }, []);
    const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0,500], [0,-40]);

  if (loading) return null;

  const handleCTA = () => router.push("/auth?tab=signup&redirect=/pricing");

  const PROBLEMS = [
    { Icon:CropIcon,        color:"#ef4444", bg:"#ffffff", border:"#E3E6EB", title:"Format Chaos",         short:"One creative → dozens of manual resizes every campaign.",      detail:"Your team spends days per campaign rebuilding the artwork for every screen on the media plan. Each size is a fresh battle with aspect ratios and composition." },
    { Icon:ImageSearchIcon, color:"#B7791F", bg:"#ffffff", border:"#E3E6EB", title:"Compromised Quality",  short:"Cropped faces. Stretched logos. Broken layouts.",          detail:"Manual resizing destroys your creative. Subjects get cut off, logos distort, text overlaps. Every bad output damages brand perception." },
    { Icon:TimerOffIcon,    color:"#ef4444", bg:"#ffffff", border:"#E3E6EB", title:"Lost Creative Hours",  short:"Designers stuck resizing instead of creating.",           detail:"When your best designers burn hours on mechanical resizing, they're not doing strategy or ideation." },
  ];
  const SOLUTIONS = [
    { Icon:LayersIcon,      title:"Layer-aware Recomposition",  desc:"Versa separates your creative into its layers (photo, logo, copy, background) and rebuilds the layout for each target size instead of stretching or cropping it." },
    { Icon:VerifiedIcon,    title:"Brand Integrity",       desc:"Logos stay crisp. Faces stay framed. Copy stays readable. Each layer is placed for the target size, so every output looks designed rather than cropped." },
    { Icon:FactCheckIcon,   title:"Checked Before Download",       desc:"Every output comes with a compliance report: dimensions, file size, safe zone, contrast and text readability, marked pass, warn or fail." },
  ];
  const STEPS = [
    { Icon:CloudUploadIcon,  n:"01", title:"Upload Master Image",  desc:"Drop your highest-quality creative. PNG, JPG, or WEBP. Any dimensions accepted." },
    { Icon:LayersIcon,       n:"02", title:"Layers Recomposed",    desc:"Versa separates photo, logo and copy, then rebuilds the layout for every target size in one run." },
    { Icon:FileDownloadIcon, n:"03", title:"Download Everything",  desc:"Every requested size at exact pixel dimensions, each with its compliance report. Download individually or as a set." },
  ];
  const ENGINES = [
    { icon:<TransformIcon sx={{ fontSize:20 }} />,       name:"Transformation Engine", desc:"Adapt any existing image to any format. Versa extends backgrounds, recomposes layouts and keeps subjects intact.", features:["Background extension","Subject-safe placement","Layout recomposition","OOH and QMS size profiles"] },
    { icon:<AddPhotoAlternateIcon sx={{ fontSize:20 }} />,name:"Creation Engine",       desc:"Generate new format variations from scratch. Each variant is sized for its channel and laid out from your brand template.",  features:["Template-based generation","Brand layout rules","Batch creation","Custom dimensions"] },
  ];
  const COMPARE = [
    { label:"Each new size",       manual:"Rebuilt by hand",     ai:"Recomposed automatically" },
    { label:"Whole media plan",    manual:"One size at a time",  ai:"Every size in one run"    },
    { label:"Subject preservation",manual:"Manual crop",         ai:"Layer-aware placement"    },
    { label:"Spec compliance",     manual:"Manual checklist",    ai:"Report on every output"   },
    { label:"Exact dimensions",    manual:"Checked by eye",      ai:"Guaranteed to the pixel"  },
  ];

  return (
    <>
      {/* Dot-to-text intro — only on first visit per session */}
      <AnimatePresence>
        {showIntro && <IntroAnimation key="intro" onDone={handleIntroDone} />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showIntro ? 0 : 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ background:"#fff", color:"#101418", overflowX:"hidden" }}>
      <ScrollBar />

      <style>{`
        *{box-sizing:border-box;}
        .btn-primary{background:${btnGrad};color:white;border:none;border-radius:4px;padding:14px 32px;font-size:15px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:8px;}
        .btn-ghost{background:transparent;color:${P};border:1px solid #C7CCD5;border-radius:4px;padding:13px 28px;font-size:14px;font-weight:400;cursor:pointer;display:inline-flex;align-items:center;gap:8px;}
        .btn-primary:hover{background:${G1};}
        .btn-ghost:hover{background:${PL};border-color:${P};}
        .nav-link{font-size:13px;font-weight:400;color:#6b7380;cursor:pointer;padding:4px 0;border-bottom:2px solid transparent;transition:all 0.15s;}
        .nav-link:hover{color:${P};border-bottom-color:${P};}
        @keyframes ripple-out{from{transform:translate(-50%,-50%) scale(0);opacity:0.5}to{transform:translate(-50%,-50%) scale(5);opacity:0}}
        @keyframes hca{0%,100%{transform:translateY(0) translateX(0)}30%{transform:translateY(-18px) translateX(7px)}70%{transform:translateY(-10px) translateX(-5px)}}
        @keyframes hcb{0%,100%{transform:translateY(0) translateX(0)}40%{transform:translateY(-24px) translateX(-10px)}80%{transform:translateY(0) translateX(11px)}}
        @keyframes hcc{0%,100%{transform:translateY(0) translateX(0)}50%{transform:translateY(-16px) translateX(5px)}}
        @keyframes hcd{0%,100%{transform:translateY(0) translateX(0)}25%{transform:translateY(-20px) translateX(-7px)}75%{transform:translateY(0) translateX(3px)}}
        @keyframes aurora-drift{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(50px,-35px) scale(1.07)}66%{transform:translate(-30px,25px) scale(0.95)}}
        @keyframes rise-p{0%{transform:translateY(0);opacity:0}8%{opacity:0.15}85%{opacity:0.08}100%{transform:translateY(-300px);opacity:0}}
        @keyframes twinkle{0%,100%{opacity:0;transform:scale(0) rotate(0deg)}50%{opacity:0.5;transform:scale(1) rotate(135deg)}}
        @keyframes spin-slow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes pulse-badge{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.25);opacity:0.6}}
        @keyframes orb-1{0%,100%{transform:translate(0,0) scale(1)}30%{transform:translate(-80px,60px) scale(1.1)}70%{transform:translate(50px,-40px) scale(0.9)}}
        @keyframes orb-2{0%,100%{transform:translate(0,0) scale(1)}40%{transform:translate(70px,-80px) scale(1.08)}75%{transform:translate(-50px,50px) scale(0.94)}}
        @keyframes orb-3{0%,100%{transform:translate(0,0)}50%{transform:translate(-30px,-60px)}}
        /* Mobile specifics */
        @media(max-width:639px){
          .engine-cards{grid-template-columns:1fr !important;}
          .hero-badge{flex-wrap:wrap;}
          .demo-processor-wrap{padding:0 !important;}
        }
        .ba-slider{position:relative;height:360px;border-radius:4px;overflow:hidden;cursor:ew-resize;user-select:none;border:1px solid #E3E6EB;touch-action:none;}
        /* ── Mobile ── */
        @media(max-width:639px){
          .ba-slider{height:240px;}
          .hero-grid{grid-template-columns:1fr !important;gap:28px !important;}
          .stat-grid{grid-template-columns:1fr 1fr !important;}
          .three-grid{grid-template-columns:1fr !important;}
          .engine-grid{grid-template-columns:1fr !important;}
          .engine-cards{grid-template-columns:1fr !important;}
          .compare-grid{grid-template-columns:1fr 1fr 1fr !important;}
          .section-pad{padding:48px 16px !important;}
          .hero-pad{padding:44px 16px 52px !important;}
          .nav-pad{padding:0 16px !important;}
          .footer-pad{padding:24px 16px !important;flex-direction:column !important;gap:10px !important;}
          .cta-pad{padding:40px 18px !important;}
          .tab-row{flex-direction:column !important;}
          .spec-table-row{grid-template-columns:1fr !important;gap:6px !important;}
        }
        @media(min-width:640px) and (max-width:1023px){
          .hero-grid{grid-template-columns:1fr !important;}
          .stat-grid{grid-template-columns:repeat(2,1fr) !important;}
          .section-pad{padding:72px 32px !important;}
          .hero-pad{padding:72px 32px 64px !important;}
          .nav-pad{padding:0 32px !important;}
        }
        @media(max-width:1023px){.hide-tablet{display:none !important;}}
        .mobile-nav-overlay{position:fixed;inset:0;background:white;z-index:200;display:flex;flex-direction:column;padding:20px;}
      `}</style>

      {/* ── MOBILE NAV ──────────────────────────────────────── */}
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div className="mobile-nav-overlay" initial={{ x:"100%" }} animate={{ x:0 }} exit={{ x:"100%" }} transition={{ duration:0.3, ease:[0.22,1,0.36,1] }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:48 }}>
              <VersaLogo height={26} />
              <motion.button whileTap={{ scale:0.9 }} onClick={() => setMobileNavOpen(false)} style={{ background:PL, border:"none", borderRadius:4, width:40, height:40, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                <CloseIcon sx={{ color:P }} />
              </motion.button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8, flex:1 }}>
              {["Pricing","Features","About"].map(l => (
                <button key={l} onClick={() => { setMobileNavOpen(false); if(l==="Pricing")router.push("/auth?tab=signup&redirect=/pricing"); }} style={{ background:"transparent", border:"none", borderBottom:"1px solid #eef0f3", padding:"16px 0", fontSize:20, fontWeight:500, color:"#101418", textAlign:"left", cursor:"pointer" }}>{l}</button>
              ))}
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <MagBtn ghost onClick={() => { setMobileNavOpen(false); router.push("/auth?tab=login"); }} style={{ justifyContent:"center", borderRadius:6, padding:"14px" }}>Sign In</MagBtn>
              <MagBtn onClick={() => { setMobileNavOpen(false); router.push("/auth?tab=signup&redirect=/pricing"); }} style={{ justifyContent:"center", borderRadius:6, padding:"14px" }}>Get Started <ArrowForwardIcon sx={{ fontSize:16 }} /></MagBtn>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── NAV ─────────────────────────────────────────────── */}
      <motion.nav initial={{ y:-20, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ duration:0.5 }}
        className="nav-pad"
        style={{ position:"sticky", top:0, zIndex:100, background:"#ffffff", borderBottom:"1px solid #E3E6EB", padding:"0 52px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <VersaLogo height={28} />
        </div>
        <div className="hide-tablet" style={{ display:"flex", gap:28 }}>
          {["Pricing","Features","About"].map(l => <span key={l} className="nav-link" onClick={() => l==="Pricing"&&router.push("/auth?tab=signup&redirect=/pricing")}>{l}</span>)}
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <div className="hide-tablet" style={{ display:"flex", gap:10 }}>
            <MagBtn ghost onClick={() => router.push("/auth?tab=login")} style={{ padding:"9px 18px", fontSize:13, borderRadius:4 }}>Sign In</MagBtn>
            <MagBtn onClick={() => router.push("/auth?tab=signup&redirect=/pricing")} style={{ padding:"9px 20px", fontSize:13, borderRadius:4 }}>Get Started <ArrowForwardIcon sx={{ fontSize:15 }} /></MagBtn>
          </div>
          <motion.button
            style={{ background:PL, border:"none", borderRadius:4, width:40, height:40, display:"none", alignItems:"center", justifyContent:"center", cursor:"pointer" }}
            className="show-mobile-btn"
            whileTap={{ scale:0.9 }} onClick={() => setMobileNavOpen(true)}>
            <MenuIcon sx={{ color:P }} />
          </motion.button>
          <style>{`.show-mobile-btn{display:none!important;}@media(max-width:1023px){.show-mobile-btn{display:flex!important;}}`}</style>
        </div>
      </motion.nav>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section style={{ position:"relative", overflow:"hidden", minHeight:"calc(100vh - 64px)", display:"flex", alignItems:"center", background:"#ffffff" }}>
        {/* Drawing-sheet grid: the spec sheet the whole page is printed on */}
        <div aria-hidden style={{ position:"absolute", inset:0, zIndex:0, pointerEvents:"none", backgroundImage:"linear-gradient(#EEF0F3 1px,transparent 1px),linear-gradient(90deg,#EEF0F3 1px,transparent 1px)", backgroundSize:"32px 32px" }} />

        <motion.div style={{ y:heroY, position:"relative", zIndex:10, width:"100%", maxWidth:1280, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"clamp(28px,4vw,60px)", alignItems:"center", padding:"clamp(48px,6vh,80px) clamp(18px,4vw,52px)" }}
          className="hero-grid hero-pad">

          {/* LEFT — copy */}
          <div>
            <div style={{ marginBottom:18 }}>
              {[
                { text:"One creative.",      grad:false },
                { text:"Every screen size.", grad:false },
                { text:"Checked to spec.",   grad:true  },
              ].map((line,i) => (
                <motion.div key={i}
                  initial={{ opacity:0, filter:"blur(12px)", y:22 }}
                  animate={{ opacity:1, filter:"blur(0px)", y:0 }}
                  transition={{ delay:0.16+i*0.16, duration:0.68, ease:[0.22,1,0.36,1] }}>
                  <span style={{ display:"block", fontSize:"clamp(28px,3.8vw,54px)", fontWeight:600, letterSpacing:"-0.03em", lineHeight:1.08,
                    ...(line.grad
                      ? { color:P }
                      : { color:INK }) }}>
                    {line.text}
                  </span>
                </motion.div>
              ))}
            </div>

            <motion.p initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.68 }}
              style={{ fontSize:"clamp(14px,1.2vw,16px)", color:"#4A5260", lineHeight:1.7, maxWidth:440, marginBottom:28 }}>
              Upload the approved artwork and get{" "}
              <span style={{ color:INK, fontWeight:500 }}>every billboard and digital-screen size on your media plan</span>,
              recomposed layer by layer. Try it free.
            </motion.p>

            <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.8 }}
              style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:20 }}>
              <MagBtn onClick={handleCTA} style={{ fontSize:14, padding:"13px 28px", borderRadius:6 }}>
                Get Started Free <ArrowForwardIcon sx={{ fontSize:15 }} />
              </MagBtn>
              <motion.button whileTap={{ scale:0.98 }}
                onClick={() => router.push("/auth?tab=signup&redirect=/pricing")}
                style={{ fontSize:13, padding:"12px 24px", borderRadius:4, background:"#ffffff", border:"1px solid #C7CCD5", color:INK, cursor:"pointer", fontFamily:"inherit", fontWeight:400, display:"inline-flex", alignItems:"center", gap:8 }}>
                View Pricing
              </motion.button>
            </motion.div>

            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.0 }}
              style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:20 }}>
              {[
                { icon:<LayersIcon sx={{ fontSize:12 }} />,      label:"Layer-aware" },
                { icon:<GridViewIcon sx={{ fontSize:12 }} />,    label:"Exact pixels" },
                { icon:<FactCheckIcon sx={{ fontSize:12 }} />,   label:"Spec report" },
              ].map((s,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:4, background:"#ffffff", border:"1px solid #E3E6EB", borderRadius:3, padding:"4px 11px", fontSize:12, color:"#4A5260", fontWeight:400 }}>
                  <span style={{ display:"flex", color:P }}>{s.icon}</span>{s.label}
                </div>
              ))}
            </motion.div>

            <TrustStrip />
          </div>

          {/* RIGHT — Demo Processor (visible on all screen sizes) */}
          <motion.div
            initial={{ opacity:0, x:isMobile?0:44, y:isMobile?24:0, scale:0.97 }}
            animate={{ opacity:1, x:0, y:0, scale:1 }}
            transition={{ delay:0.28, duration:0.85, ease:[0.22,1,0.36,1] }}
            style={{ display:"flex", justifyContent:"center", alignItems:"center" }}>
            <div style={{ width:"100%", maxWidth:460 }}>
              <DemoProcessor />
            </div>
          </motion.div>
        </motion.div>

        <PlatformTicker />
      </section>

      {/* ── SPEC ROW: verifiable product facts as a ruled table ── */}
      <section className="section-pad" style={{ background:"#ffffff", borderTop:"1px solid #E3E6EB", borderBottom:"1px solid #E3E6EB", padding:"0 52px" }}>
        <div className="stat-grid" style={{ maxWidth:1120, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(4,1fr)" }}>
          {[
            ["15", "OOH media sizes built in, from 792 × 216 to 1952 × 896"],
            ["3", "check groups on every output: technical, visual, content"],
            ["Pass / Warn / Fail", "a verdict on each size before you download"],
            ["W × H", "exact pixel dimensions, guaranteed"],
          ].map(([v,l],i) => (
            <div key={l} style={{ padding:"28px 24px", borderLeft: i===0 ? "none" : "1px solid #E3E6EB" }}>
              <div className="spec-figure" style={{ fontSize: v.length > 6 ? 26 : 40, fontWeight:600, color:INK, lineHeight:1, minHeight:40, display:"flex", alignItems:"flex-end" }}>{v}</div>
              <div style={{ fontSize:13, color:"#4A5260", marginTop:8 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROBLEMS: a ruled table, not a card grid ── */}
      <section className="section-pad" style={{ padding:"90px 52px" }}>
        <div style={{ maxWidth:1120, margin:"0 auto" }}>
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} style={{ marginBottom:36, maxWidth:640 }}>
            <h2 style={{ fontSize:"clamp(24px,4.5vw,44px)", fontWeight:600, letterSpacing:"-0.025em", lineHeight:1.15, marginBottom:12, color:INK }}>
              One design. Too many formats.
            </h2>
            <p style={{ fontSize:15, color:"#4A5260", lineHeight:1.65 }}>Every media plan multiplies one approved artwork into dozens of screens, and each one is rebuilt by hand.</p>
          </motion.div>
          <div style={{ borderTop:`1px solid ${INK}` }}>
            {PROBLEMS.map((p) => (
              <div key={p.title} className="spec-table-row" style={{ display:"grid", gridTemplateColumns:"220px 1fr 1.4fr", gap:24, padding:"22px 0", borderBottom:"1px solid #E3E6EB", alignItems:"baseline" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <p.Icon sx={{ fontSize:18, color:INK }} />
                  <span style={{ fontSize:16, fontWeight:600, color:INK }}>{p.title}</span>
                </div>
                <span style={{ fontSize:14, color:INK }}>{p.short}</span>
                <span style={{ fontSize:14, color:"#4A5260", lineHeight:1.65 }}>{p.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BEFORE / AFTER ──────────────────────────────────── */}
      <section className="section-pad" style={{ background:"#F6F7F9", padding:"60px 52px 80px" }}>
        <div style={{ maxWidth:980, margin:"0 auto" }}>
          <motion.div initial={{ opacity:0, y:28 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} style={{ textAlign:"center", marginBottom:36 }}>
            <h2 style={{ fontSize:"clamp(22px,4vw,42px)", fontWeight:600, letterSpacing:"-0.04em", color:"#101418" }}>Before vs After</h2>
            <p style={{ fontSize:14, color:"#6b7380", marginTop:8 }}>Drag the handle to compare.</p>
          </motion.div>
          <motion.div initial={{ opacity:0, scale:0.97 }} whileInView={{ opacity:1, scale:1 }} viewport={{ once:true }} transition={{ duration:0.65 }}>
            <BASlider />
          </motion.div>
        </div>
      </section>

      {/* ── FLOW DIAGRAM ────────────────────────────────────── */}
      <section className="section-pad" style={{ padding:"60px 52px 80px", maxWidth:1200, margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:isTablet?"1fr":"1fr 1fr", gap:60, alignItems:"center" }}>
          <motion.div initial={{ opacity:0, x:-40 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.7 }}>
            <h2 style={{ fontSize:"clamp(22px,3.5vw,40px)", fontWeight:600, letterSpacing:"-0.04em", lineHeight:1.12, marginBottom:16, color:"#101418" }}>
              One upload.<br /><span style={{ color:P }}>Every size.</span>
            </h2>
            <p style={{ fontSize:15, color:"#6b7380", lineHeight:1.72, marginBottom:28 }}>Versa separates your creative into its layers, then rebuilds the layout for every size on your media plan, keeping subjects framed, logos intact and copy legible.</p>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {[["Layer separation","Splits photo, logo, copy and background"],["Background extension","Fills new canvas areas to match"],["Layout recomposition","Rebuilds the hierarchy for each size"]].map(([t,d]) => (
                <motion.div key={t} whileHover={{ x:4 }} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"10px 14px", background:PL, borderRadius:4, border:`1px solid ${P}14` }}>
                  <CheckCircleIcon sx={{ fontSize:18, color:P, flexShrink:0, mt:0.2 }} />
                  <div><div style={{ fontSize:13, fontWeight:500, color:"#101418" }}>{t}</div><div style={{ fontSize:12, color:"#6b7380" }}>{d}</div></div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          <motion.div initial={{ opacity:0, x:40 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.7, delay:0.1 }}>
            <div style={{ background:"white", border:`1px solid ${P}14`, borderRadius:8, padding:"28px 24px", boxShadow:"0 1px 2px rgba(16,20,24,0.05)", overflow:"visible" }}>
              <FlowSVG />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SOLUTIONS: three ruled columns ── */}
      <section className="section-pad" style={{ padding:"60px 52px 80px" }}>
        <div style={{ maxWidth:1120, margin:"0 auto" }}>
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} style={{ marginBottom:36 }}>
            <h2 style={{ fontSize:"clamp(24px,4.5vw,44px)", fontWeight:600, letterSpacing:"-0.025em", lineHeight:1.15, color:INK }}>
              Recomposed layer by layer
            </h2>
          </motion.div>
          <div className="three-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", borderTop:`1px solid ${INK}` }}>
            {SOLUTIONS.map((sol,i) => (
              <div key={sol.title} style={{ padding:"24px 24px 8px", paddingLeft: i===0 ? 0 : 24, borderLeft: i===0 ? "none" : "1px solid #E3E6EB" }}>
                <sol.Icon sx={{ fontSize:20, color:P, mb:1.5 }} />
                <h3 style={{ fontSize:17, fontWeight:600, color:INK, marginBottom:8 }}>{sol.title}</h3>
                <p style={{ fontSize:14, color:"#4A5260", lineHeight:1.7 }}>{sol.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS: a ruled sequence ── */}
      <section className="section-pad" style={{ background:"#F6F7F9", padding:"80px 52px", borderTop:"1px solid #E3E6EB", borderBottom:"1px solid #E3E6EB" }}>
        <div style={{ maxWidth:1120, margin:"0 auto" }}>
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} style={{ marginBottom:36 }}>
            <h2 style={{ fontSize:"clamp(22px,4vw,40px)", fontWeight:600, letterSpacing:"-0.03em", color:INK }}>How it works</h2>
            <p style={{ fontSize:15, color:"#4A5260", marginTop:8 }}>Three steps. One upload.</p>
          </motion.div>
          <div className="three-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)" }}>
            {STEPS.map((st,i) => (
              <div key={st.title} style={{ position:"relative", paddingTop:28, paddingRight:24 }}>
                {/* the track: ink rule with an arrowhead into the next step */}
                <div aria-hidden style={{ position:"absolute", top:8, left:0, right:0, height:1, background:INK }} />
                <div aria-hidden style={{ position:"absolute", top:3, left:0, width:11, height:11, background:i===0 ? P : "#ffffff", border:`1px solid ${i===0 ? P : INK}`, borderRadius:1 }} />
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                  <st.Icon sx={{ fontSize:18, color:INK }} />
                  <span style={{ fontSize:16, fontWeight:600, color:INK }}>{st.title}</span>
                </div>
                <p style={{ fontSize:14, color:"#4A5260", lineHeight:1.65, maxWidth:320 }}>{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TWO ENGINES ─────────────────────────────────────── */}
      <section className="section-pad" style={{ padding:"80px 52px", maxWidth:1120, margin:"0 auto" }}>
        <motion.div initial={{ opacity:0, y:28 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} style={{ textAlign:"center", marginBottom:44 }}>
          <h2 style={{ fontSize:"clamp(22px,3.5vw,40px)", fontWeight:600, letterSpacing:"-0.04em", marginBottom:10, color:"#101418" }}>Two Powerful Engines</h2>
          <p style={{ fontSize:15, color:"#6b7380" }}>Recompose existing artwork, or generate new artwork from a template.</p>
        </motion.div>

        <div className="engine-cards" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:22 }}>
          {/* Transformation Engine */}
          <motion.div initial={{ opacity:0, x:-30 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.65 }}>
            <div style={{ background:"white", border:`1.5px solid ${P}22`, borderRadius:8, padding:"32px", height:"100%", position:"relative", overflow:"hidden", boxShadow:"0 1px 2px rgba(16,20,24,0.05)", display:"flex", flexDirection:"column" }}>
              {/* Header */}
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18 }}>
                <div style={{ width:52, height:52, borderRadius:6, background:PL, border:`1.5px solid ${P}28`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <TransformIcon sx={{ fontSize:26, color:P }} />
                </div>
                <div>
                  <h3 style={{ fontSize:18, fontWeight:600, color:"#101418", lineHeight:1.2 }}>Transformation Engine</h3>
                </div>
              </div>
              <p style={{ fontSize:13, color:"#6b7380", lineHeight:1.72, marginBottom:22 }}>
                Adapt <strong style={{ color:"#2b313a", fontWeight:500 }}>your approved artwork</strong> to every size on the media plan. Versa extends backgrounds, recomposes layouts and keeps subjects intact, without reinventing the creative.
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:9, flex:1, marginBottom:24 }}>
                {["Background extension","Subject-safe placement","Layout recomposition","OOH and QMS size profiles"].map(f => (
                  <div key={f} style={{ display:"flex", alignItems:"center", gap:9, background:PL, borderRadius:4, padding:"9px 13px" }}>
                    <CheckCircleIcon sx={{ fontSize:15, color:P, flexShrink:0 }} />
                    <span style={{ fontSize:12, color:"#2b313a" }}>{f}</span>
                  </div>
                ))}
              </div>
              <MagBtn onClick={() => router.push("/auth?tab=signup&redirect=/pricing")} style={{ fontSize:13, padding:"11px 22px", borderRadius:4, justifyContent:"center" }}>
                Try Transform Engine <ArrowForwardIcon sx={{ fontSize:14 }} />
              </MagBtn>
            </div>
          </motion.div>

          {/* Creation Engine */}
          <motion.div initial={{ opacity:0, x:30 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.65, delay:0.1 }}>
            <div style={{ background:"white", border:"1.5px solid #10141822", borderRadius:8, padding:"32px", height:"100%", position:"relative", overflow:"hidden", boxShadow:"0 1px 2px rgba(16, 20, 24, 0.06)", display:"flex", flexDirection:"column" }}>
              {/* Header */}
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18 }}>
                <div style={{ width:52, height:52, borderRadius:6, background:"#F6F7F9", border:"1.5px solid #10141828", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <AddPhotoAlternateIcon sx={{ fontSize:26, color:"#101418" }} />
                </div>
                <div>
                  <h3 style={{ fontSize:18, fontWeight:600, color:"#101418", lineHeight:1.2 }}>Creation Engine</h3>
                </div>
              </div>
              <p style={{ fontSize:13, color:"#6b7380", lineHeight:1.72, marginBottom:22 }}>
                Generate <strong style={{ color:"#2b313a", fontWeight:500 }}>new format variations</strong> from scratch. Each variant is sized for the channel it ships to and laid out from your brand template.
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:9, flex:1, marginBottom:24 }}>
                {["Template-based generation","Brand layout rules","Batch creation","Custom dimensions"].map(f => (
                  <div key={f} style={{ display:"flex", alignItems:"center", gap:9, background:"#F6F7F9", borderRadius:4, padding:"9px 13px" }}>
                    <CheckCircleIcon sx={{ fontSize:15, color:"#101418", flexShrink:0 }} />
                    <span style={{ fontSize:12, color:"#2b313a" }}>{f}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => router.push("/auth?tab=signup&redirect=/pricing")}
                style={{ width:"100%", background:INK, color:"white", border:"none", borderRadius:4, padding:"12px 22px", fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6, fontFamily:"inherit" }}>
                Try Creation Engine <ArrowForwardIcon sx={{ fontSize:14 }} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── COMPARISON ──────────────────────────────────────── */}
      <section className="section-pad" style={{ padding:"20px 52px 80px", maxWidth:860, margin:"0 auto" }}>
        <motion.div initial={{ opacity:0, y:28 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} style={{ marginBottom:28 }}>
          <h2 style={{ fontSize:"clamp(20px,3.5vw,36px)", fontWeight:600, letterSpacing:"-0.04em", textAlign:"center", marginBottom:8, color:"#101418" }}>Manual vs Versa</h2>
        </motion.div>
        <div style={{ background:"white", border:"1px solid #e3e6eb", borderRadius:8, overflow:"hidden", boxShadow:"0 1px 2px rgba(16, 20, 24, 0.06)" }}>
          <div className="compare-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", background:"#f6f7f9", padding:"12px 20px", borderBottom:"1px solid #e3e6eb" }}>
            {["Metric","Manual Workflow","Versa"].map((h,i) => (
              <span key={h} style={{ fontSize:11, fontWeight:600, color:i===1?"#ef4444":i===2?P:"#4a5260", letterSpacing:"0.06em", textTransform:"uppercase" }}>{h}</span>
            ))}
          </div>
          <div style={{ padding:"0 8px" }}>{COMPARE.map((row,i) => <CompareBar key={i} {...row} />)}</div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="section-pad" style={{ padding:"40px 52px 100px" }}>
        <motion.div initial={{ opacity:0, y:48 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.8, ease:[0.22,1,0.36,1] }}
          className="cta-pad"
          style={{ maxWidth:780, margin:"0 auto", background:ctaBg, borderRadius:8, padding:"68px 52px", textAlign:"center", position:"relative", overflow:"hidden", boxShadow:"0 1px 2px rgba(16, 20, 24, 0.06)" }}>
          <h2 style={{ fontSize:"clamp(22px,4vw,42px)", fontWeight:600, color:"white", letterSpacing:"-0.04em", lineHeight:1.1, marginBottom:14 }}>
            Start With 2 Free Generations
          </h2>
          <p style={{ fontSize:"clamp(14px,1.4vw,16px)", color:"rgba(255,255,255,0.68)", maxWidth:400, margin:"0 auto 36px", lineHeight:1.65 }}>
            Upload your approved artwork and see it recomposed for real screen sizes, with a spec check on every output.
          </p>
          <MagBtn onClick={handleCTA} style={{ background:"white", color:P, fontSize:"clamp(14px,1.3vw,16px)", padding:"16px 44px", borderRadius:6, fontWeight:600, boxShadow:"0 1px 2px rgba(16, 20, 24, 0.06)", border:"none" }}>
            Try Free Now <ArrowForwardIcon sx={{ fontSize:16 }} />
          </MagBtn>
          <div style={{ marginTop:16, fontSize:12, color:"rgba(255,255,255,0.55)" }}>Then choose a plan · Cancel anytime</div>
          <div style={{ display:"flex", gap:8, justifyContent:"center", marginTop:22, flexWrap:"wrap" }}>
            {["Every screen size","Both engines","Full resolution","Compliance reports"].map(t => (
              <div key={t} style={{ background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.16)", borderRadius:3, padding:"5px 12px", fontSize:11, fontWeight:400, color:"rgba(255,255,255,0.78)", display:"flex", alignItems:"center", gap:4 }}>
                <CheckCircleIcon sx={{ fontSize:11 }} />{t}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="section-pad footer-pad" style={{ borderTop:"1px solid #eef0f3", padding:"32px 52px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:14 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <VersaMark size={22} />
          <span style={{ fontSize:13, color:"#6b7380" }}>Versa · Every size from one creative · 2026</span>
        </div>
        <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
          {["Privacy Policy","Terms of Service","Contact Sales"].map(l => (
            <span key={l} style={{ fontSize:12, color:"#6b7380", cursor:"pointer", transition:"color 0.15s" }}
              onMouseEnter={e => { (e.target as HTMLSpanElement).style.color=P; }}
              onMouseLeave={e => { (e.target as HTMLSpanElement).style.color="#6b7380"; }}>{l}</span>
          ))}
        </div>
      </footer>
      </motion.div>
    </>
  );
}
