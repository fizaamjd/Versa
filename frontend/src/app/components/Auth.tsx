"use client";

import React, { useState } from "react";
import SignupForm from "./auth/SignupForm";
import LoginForm from "./auth/LoginForm";
import ForgotPasswordForm from "./auth/ForgotPasswordForm";
import ResetPasswordForm from "./auth/ResetPasswordForm";
import { toast } from "react-toastify";
import {
  forgotPassword,
  orgSignin,
  orgSignup,
  resetPassword,
} from "@/lib/organisationApi";
import { extractApiErrorMessage } from "@/lib/errorMessage";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LayersIcon from "@mui/icons-material/Layers";
import { IMAGE_PRESETS } from "@/lib/presets";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import GridViewIcon from "@mui/icons-material/GridView";
import { useRouter } from "next/navigation";
import { VersaLogo } from "@/components/brand/VersaLogo";

interface AuthProps {
  onAuthSuccess?: (token: string, user: any) => void;
  initialTab?: ActiveForm;
  initialToken?: string;
  redirectTo?: string;
}

type FormData = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agree: boolean;
  token?: string;
  newPassword?: string;
};

export type ActiveForm = "signup" | "login" | "forgot" | "reset";

// Native output sizes of the supported presets.
const SPEC_ROWS = IMAGE_PRESETS;

const BRAND_FEATURES = [
  { icon: <GridViewIcon sx={{ fontSize: 16, color: "rgba(255,255,255,0.9)" }} />,    text: "Five supported image formats" },
  { icon: <LayersIcon sx={{ fontSize: 16, color: "rgba(255,255,255,0.9)" }} />,      text: "Image transformation and prompt-based creation" },
  { icon: <FactCheckIcon sx={{ fontSize: 16, color: "rgba(255,255,255,0.9)" }} />,   text: "Technical checks and AI image reports" },
  { icon: <CheckCircleIcon sx={{ fontSize: 16, color: "rgba(255,255,255,0.9)" }} />, text: "Review generated artwork before use" },
];

const Auth: React.FC<AuthProps> = ({ onAuthSuccess, initialTab, initialToken, redirectTo }) => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agree: false,
    token: initialToken || "",
    newPassword: "",
  });
  const [activeForm, setActiveForm] = useState<ActiveForm>(initialTab || "login");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const msgs: Record<ActiveForm, string> = { signup: "Creating your account...", login: "Signing you in...", forgot: "Sending reset instructions...", reset: "Updating password..." };
    const toastId = toast.loading(msgs[activeForm]);
    try {
      if (activeForm === "signup") {
        if (formData.password !== formData.confirmPassword) throw new Error("Passwords do not match");
        if (!formData.agree) throw new Error("Please agree to Terms of Service");
        const { token, user } = await orgSignup({ email: formData.email, password: formData.password, name: formData.fullName, org_name: `${formData.fullName}'s Organisation` });
        localStorage.setItem("auth_token", token);
        localStorage.setItem("user", JSON.stringify(user));
        toast.update(toastId, { render: "Account created! Redirecting...", type: "success", isLoading: false, autoClose: 1500 });
        onAuthSuccess?.(token, user);
        setTimeout(() => { window.location.href = redirectTo || "/dashboard"; }, 300);
      } else if (activeForm === "login") {
        const { token, user } = await orgSignin({ email: formData.email, password: formData.password });
        localStorage.setItem("auth_token", token);
        localStorage.setItem("user", JSON.stringify(user));
        toast.update(toastId, { render: "Login successful! Redirecting...", type: "success", isLoading: false, autoClose: 1500 });
        onAuthSuccess?.(token, user);
        setTimeout(() => { window.location.href = redirectTo || "/dashboard"; }, 300);
      } else if (activeForm === "forgot") {
        await forgotPassword({ email: formData.email });
        toast.update(toastId, { render: "Password reset link sent! Check your inbox.", type: "success", isLoading: false, autoClose: 5000 });
      } else if (activeForm === "reset") {
        if (!formData.newPassword || formData.newPassword.length < 6) throw new Error("Password must be at least 6 characters.");
        if (formData.newPassword !== formData.confirmPassword) throw new Error("Passwords do not match.");
        await resetPassword({ token: formData.token || "", newPassword: formData.newPassword || "" });
        toast.update(toastId, { render: "Password reset! Redirecting to login...", type: "success", isLoading: false, autoClose: 2000 });
        setTimeout(() => { window.location.href = "/auth"; }, 2000);
      }
    } catch (err: any) {
      toast.update(toastId, { render: extractApiErrorMessage(err, "Authentication failed. Please try again."), type: "error", isLoading: false, autoClose: 4500 });
    } finally {
      setLoading(false);
    }
  };

  const isB2C = !!redirectTo;

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "inherit" }}>
      <style>{`
        .auth-brand { display: none; }
        @media (min-width: 900px) { .auth-brand { display: flex; } }
        .auth-form-panel { flex: 1; }
        .auth-back-link { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: #6b7380; cursor: pointer; border: none; background: transparent; padding: 0; margin-bottom: 28px; transition: color 0.15s; }
        .auth-back-link:hover { color: #2346D9; }
        .auth-input { width: 100%; height: 46px; border: 1.5px solid #E3E6EB; border-radius: 4px; padding: 0 14px; font-size: 14px; font-family: inherit; color: #101418; background: #F6F7F9; outline: none; transition: border-color 0.18s, background 0.18s, box-shadow 0.18s; }
        .auth-input:focus { border-color: #2346D9; background: white; box-shadow: 0 1px 2px rgba(16, 20, 24, 0.06); }
        .auth-input::placeholder { color: #6b7380; }
        .auth-label { font-size: 13px; font-weight: 500; color: #4a5260; margin-bottom: 6px; display: block; }
        .auth-submit { width: 100%; height: 46px; background: #2346D9; color: white; border: none; border-radius: 4px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; transition: opacity 0.18s, box-shadow 0.18s; }
        .auth-submit:hover { background: #1B38B4; }
        .auth-submit:active { background: #162D8F; }
        .auth-link { color: #2346D9; cursor: pointer; font-weight: 500; }
        .auth-link:hover { text-decoration: underline; }
        .auth-divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; color: #6b7380; font-size: 12px; }
        .auth-divider::before, .auth-divider::after { content: ""; flex: 1; height: 1px; background: #E3E6EB; }
      `}</style>

      {/* ── LEFT: Brand panel ────────────────────────────── */}
      <div className="auth-brand" style={{ flex: "0 0 42%", background: "#101418", flexDirection: "column", padding: "52px 44px", position: "relative", overflow: "hidden" }}>
        {/* The Versa mark drawn large and faint: a frame with its width dimensioned */}
        <svg aria-hidden viewBox="0 0 64 64" style={{ position: "absolute", right: "-10%", top: "4%", width: "48%", pointerEvents: "none", opacity: 0.08 }} fill="none">
          <rect x="8" y="24" width="48" height="30" rx="1" stroke="#ffffff" strokeWidth="0.6" />
          <path d="M11 13H53M8 7V20M56 7V20" stroke="#ffffff" strokeWidth="0.6" />
          <path d="M8 13L11.5 11.6V14.4ZM56 13L52.5 11.6V14.4Z" fill="#ffffff" />
        </svg>

        {/* Logo mark */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40, position: "relative", zIndex: 1 }}>
          <VersaLogo height={30} tone="light" />
        </div>

        {/* Hero copy */}
        <div style={{ position: "relative", zIndex: 1, marginBottom: 36 }}>

          {isB2C && activeForm === "signup" ? (
            <>
              <h2 style={{ fontSize: "clamp(22px,2.8vw,32px)", fontWeight: 700, color: "white", letterSpacing: "-0.03em", lineHeight: 1.2, marginBottom: 14 }}>
                Almost there!<br />Your images are<br /><span style={{ color: "rgba(255,255,255,0.55)" }}>ready to unlock.</span>
              </h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.65, maxWidth: 320 }}>
                You've seen Versa in action. Create your free account and choose a plan to unlock every AI-adapted format at full resolution.
              </p>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: "clamp(22px,2.8vw,32px)", fontWeight: 700, color: "white", letterSpacing: "-0.03em", lineHeight: 1.2, marginBottom: 14 }}>
                One creative.<br />Every screen size.<br /><span style={{ color: "#7B92EA" }}>Checked to spec.</span>
              </h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.65, maxWidth: 320 }}>
                Upload an image or write a prompt, then choose one of five supported formats.
              </p>
            </>
          )}
        </div>

        {/* Features list */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 12, marginBottom: 40 }}>
          {isB2C && activeForm === "signup" ? (
            /* B2C: show step-by-step progress */
            [
              { n: "1", label: "Try the AI", done: true },
              { n: "2", label: "Create your account", done: false, active: true },
              { n: "3", label: "Choose your plan", done: false },
            ].map((step, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: step.done ? "rgba(16,185,129,0.25)" : step.active ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.07)", border: step.done ? "1px solid rgba(16,185,129,0.5)" : step.active ? "1px solid rgba(255,255,255,0.4)" : "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 12, fontWeight: 700, color: step.done ? "#34d399" : "rgba(255,255,255,0.9)" }}>
                  {step.done ? "✓" : step.n}
                </div>
                <span style={{ fontSize: 13, color: step.done ? "rgba(52,211,153,0.9)" : step.active ? "white" : "rgba(255,255,255,0.4)", fontWeight: step.active ? 600 : 400, lineHeight: 1.4 }}>{step.label}</span>
                {step.active && <div style={{ marginLeft: "auto", background: "rgba(255,255,255,0.15)", borderRadius: 100, padding: "2px 8px", fontSize: 9, color: "rgba(255,255,255,0.8)", fontWeight: 600, letterSpacing: "0.05em" }}>NOW</div>}
              </div>
            ))
          ) : (
            BRAND_FEATURES.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 4, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {f.icon}
                </div>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.4 }}>{f.text}</span>
              </div>
            ))
          )}
        </div>

        {/* Spec table: real media-site sizes */}
        <div style={{ position: "relative", zIndex: 1, marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.14)" }}>
          {SPEC_ROWS.map((row) => (
            <div key={row.label} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, padding: "11px 0", borderBottom: "1px solid rgba(255,255,255,0.14)" }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{row.label}</span>
              <span className="spec-figure" style={{ fontSize: 15, color: "white", fontWeight: 600 }}>
                {row.w} <span style={{ color: "#F2B705" }}>×</span> {row.h}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT: Form panel ────────────────────────────── */}
      <div className="auth-form-panel" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "clamp(32px, 5vw, 64px) clamp(20px, 5vw, 56px)", background: "white", overflowY: "auto" }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          {/* Back to home */}
          <button className="auth-back-link" onClick={() => router.push("/")}>
            <ArrowBackIcon sx={{ fontSize: 15 }} /> Back to home
          </button>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
            <VersaLogo height={28} />
          </div>

          {/* B2C anticipation banner */}
          {isB2C && activeForm === "signup" && (
            <div style={{ background: "#F0FDF4", border: "1px solid #86efac", borderRadius: 6, padding: "14px 16px", marginBottom: 24 }}>
              {/* Step progress */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", gap: 4, marginBottom: 10 }}>
                {[
                  { label: "Try AI", done: true },
                  { label: "Create Account", active: true },
                  { label: "Choose Plan", upcoming: true },
                ].map((step, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && (
                      <div style={{ flex: 1, height: 2, background: i === 1 ? "#86efac" : "#E3E6EB", margin: "10px 2px 0", minWidth: 16 }} />
                    )}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", background: step.done ? "#10b981" : step.active ? "#2346D9" : "#E3E6EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "white", fontWeight: 700, flexShrink: 0 }}>
                        {step.done ? "✓" : i + 1}
                      </div>
                      <span style={{ fontSize: 9, fontWeight: step.active ? 600 : 400, color: step.done ? "#10b981" : step.active ? "#2346D9" : "#6b7380", whiteSpace: "nowrap" }}>
                        {step.label}
                      </span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
              <p style={{ fontSize: 12, color: "#166534", fontWeight: 600, margin: 0, textAlign: "center" }}>
                Just one last step — you're one account away from unlocking your results
              </p>
            </div>
          )}

          {activeForm === "login"  && <LoginForm  formData={formData} handleChange={handleChange} handleSubmit={handleSubmit} switchForm={setActiveForm} />}
          {activeForm === "signup" && <SignupForm  formData={formData} handleChange={handleChange} handleSubmit={handleSubmit} switchForm={setActiveForm} />}
          {activeForm === "forgot" && <ForgotPasswordForm formData={formData} handleChange={handleChange} handleSubmit={handleSubmit} switchForm={setActiveForm} />}
          {activeForm === "reset"  && <ResetPasswordForm  formData={formData} handleChange={handleChange} handleSubmit={handleSubmit} switchForm={setActiveForm} />}
        </div>
      </div>
    </div>
  );
};

export default Auth;
