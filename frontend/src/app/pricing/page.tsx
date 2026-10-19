"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Pricing from "@/app/components/pricing/Pricing";
import { VersaLogo } from "@/components/brand/VersaLogo";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const P = "#2346D9";

export default function PricingPage() {
  const router = useRouter();

  return (
    <div style={{ minHeight: "100vh", background: "#F6F7F9" }}>
      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "#ffffff", borderBottom: "1px solid #E3E6EB", padding: "0 clamp(18px,4vw,52px)", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <VersaLogo height={28} />
        <button
          onClick={() => router.push("/")}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "1px solid #C7CCD5", borderRadius: 4, padding: "8px 14px", fontSize: 13, color: P, cursor: "pointer", fontFamily: "inherit" }}>
          <ArrowBackIcon sx={{ fontSize: 15 }} /> Back to Home
        </button>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "52px 20px 12px" }}>
        <h1 style={{ fontSize: "clamp(26px,5vw,48px)", fontWeight: 700, color: "#101418", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 14 }}>
          Plans & Pricing
        </h1>
        <p style={{ fontSize: 16, color: "#6b7380", maxWidth: 480, margin: "0 auto", lineHeight: 1.65 }}>
          Start with 2 free generations. No credit card required. Upgrade when you need more.
        </p>
      </div>

      {/* Pricing component */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px 80px" }}>
        <Pricing />
      </div>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #eef0f3", padding: "28px clamp(18px,4vw,52px)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <span style={{ fontSize: 13, color: "#6b7380" }}>Versa · Every size from one creative · 2026</span>
        <div style={{ display: "flex", gap: 20 }}>
          {["Privacy Policy", "Terms of Service", "Contact Sales"].map(l => (
            <span key={l} style={{ fontSize: 12, color: "#6b7380", cursor: "pointer" }}>{l}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}
