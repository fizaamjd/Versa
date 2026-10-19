"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Grid,
  Button,
  Typography,
  Alert,
} from "@mui/material";
import { useUser } from "@/app/context/AuthContext";
import { usePageHeader } from "@/app/context/PageHeaderContext";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AspectRatioIcon from "@mui/icons-material/AspectRatio";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import UsageDisplay from "@/app/components/dashboard/UsageDisplay";
import CancelSubscriptionModal from "@/app/components/modals/CancelSubscriptionModal";
import {
  redirectToPortal,
  cancelSubscription,
  refreshSubscriptionStatus,
} from "@/lib/stripe";
import type { EngineType } from "@/types/billing";
import { getPlanLabel } from "@/types/billing";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, refreshUser } = useUser();
  const { setHeader, resetHeader } = usePageHeader();
  const [selectedEngine, setSelectedEngine] =
    useState<EngineType>("transformation");
  const [processingItem, setProcessingItem] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  useEffect(() => {
    setHeader({ title: "Dashboard" });
    return () => resetHeader();
  }, [setHeader, resetHeader]);

  const handleManageSubscription = useCallback(async () => {
    setProcessingItem("portal");
    setError(null);
    setSuccess(null);
    try {
      await redirectToPortal();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to open billing portal",
      );
      setProcessingItem(null);
    }
  }, []);

  const handleCancelSubscription = useCallback(async () => {
    setProcessingItem("cancel");
    setError(null);
    setSuccess(null);
    setCancelModalOpen(false);
    try {
      const result = await cancelSubscription(true, selectedEngine);
      if (result.cancelled) {
        await refreshUser();
        setSuccess("Plan cancelled successfully.");
      } else {
        setError("Cancellation failed.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel plan");
    } finally {
      setProcessingItem(null);
    }
  }, [selectedEngine, refreshUser]);

  if (loading || !user) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress size={32} sx={{ color: "rgba(35, 70, 217, 1)" }} />
      </Box>
    );
  }

  const engineInfo = user.engine_data?.[selectedEngine];
  const isPostpaid = Boolean(user.is_postpaid);
  const availableEngines =
    user.available_engines && user.available_engines.length > 0
      ? user.available_engines
      : ["transformation", "creation"];
  const perEngineUsage = availableEngines.map((etype) => {
    const credits = user.engine_data?.[etype as EngineType]?.credits || user.credits;
    return {
      engine: etype,
      used:
        (credits?.monthly_units_used || 0) + (credits?.addon_units_used || 0),
    };
  });
  const totalUsage = perEngineUsage.reduce((sum, item) => sum + item.used, 0);
  const isPendingCancellation = Boolean(
    engineInfo?.credits?.is_pending_cancellation,
  );
  const currentPlanRaw = engineInfo?.plan || "";
  const currentPlanLabel = getPlanLabel(currentPlanRaw);
  const selectedEngineLabel = selectedEngine === "creation" ? "Creation" : "Transformation";
  const currentCredits = engineInfo?.credits || user.credits;
  const totalCreditsUsed = ((currentCredits?.monthly_units_used || 0) + (currentCredits?.addon_units_used || 0));
  const totalCreditsMax = ((currentCredits?.monthly_units_max || 0) + (currentCredits?.addon_units_max || 0));
  const remainingCredits = Math.max(0, totalCreditsMax - totalCreditsUsed);
  const dashboardStats = [
    {
      label: "Credits used",
      value: totalCreditsUsed.toLocaleString(),
      hint: isPostpaid ? "Billed by usage" : "This period, all add-ons included",
    },
    {
      label: "Credits remaining",
      value: isPostpaid ? "No limit" : remainingCredits.toLocaleString(),
      hint: isPostpaid ? "Pay as you go" : "Before your plan limit",
    },
    {
      label: "Active engine",
      value: selectedEngineLabel,
      hint: isPostpaid ? "Pay as you go" : currentPlanLabel,
    },
  ];

  const engineCards = [
    {
      key: "transformation" as EngineType,
      title: "Transformation Engine",
      description: "Transform an uploaded image into a supported format, then review the result and its image report.",
      accent: "#2346D9",
      icon: <AspectRatioIcon sx={{ fontSize: 20 }} />,
      chips: ["Image transformation", "Five preset formats", "Image reports"],
    },
    {
      key: "creation" as EngineType,
      title: "Creation Engine",
      description: "Generate artwork from a text prompt in one of five supported formats.",
      accent: "#101418",
      icon: <AddPhotoAlternateIcon sx={{ fontSize: 20 }} />,
      chips: ["Prompt-based generation", "Five preset formats", "Image reports"],
    },
  ];

  const ply = "0 1px 2px rgba(16, 20, 24, 0.06)";

  return (
    <Box sx={{ minHeight: "100vh", background: "#F6F7F9" }}>
      <Container maxWidth="xl" sx={{ py: { xs: 2.5, md: 4 } }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Title block and figures, ruled like the head of a spec sheet */}
        <Paper
          elevation={0}
          sx={{ mb: 3, borderRadius: "6px", border: "1px solid #E3E6EB", bgcolor: "#ffffff", boxShadow: ply, overflow: "hidden" }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between"
            spacing={2}
            sx={{ p: { xs: 2.5, md: 3.5 } }}
          >
            <Box>
              <Typography sx={{ fontSize: { xs: "28px", md: "34px" }, lineHeight: 1.1, fontWeight: 600, letterSpacing: "-0.03em", color: "#101418", mb: 0.75 }}>
                This period
              </Typography>
              <Typography sx={{ color: "#4A5260", fontSize: 15, lineHeight: 1.6 }}>
                {isPostpaid ? "Pay as you go" : <>Plan: <Box component="span" sx={{ color: "#101418", fontWeight: 600 }}>{currentPlanLabel}</Box></>}
                {" · "}Usage, plan and engines for your organisation.
              </Typography>
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
              <Button
                variant="outlined"
                onClick={() => router.push("/pricing")}
                sx={{ textTransform: "none", borderRadius: "4px", px: 2.2, py: 1, fontWeight: 500, borderColor: "#C7CCD5", color: "#101418" }}
              >
                View pricing
              </Button>
              <Button
                variant="contained"
                onClick={() => router.push("/billing")}
                sx={{ textTransform: "none", borderRadius: "4px", px: 2.4, py: 1, fontWeight: 500, bgcolor: "#2346D9", boxShadow: "none", "&:hover": { bgcolor: "#1B38B4", boxShadow: "none" } }}
              >
                Billing
              </Button>
            </Stack>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              borderTop: "1px solid #E3E6EB",
            }}
          >
            {dashboardStats.map((stat, i) => (
              <Box
                key={stat.label}
                sx={{
                  p: { xs: 2.25, md: 3 },
                  borderLeft: { xs: "none", md: i === 0 ? "none" : "1px solid #E3E6EB" },
                  borderTop: { xs: i === 0 ? "none" : "1px solid #E3E6EB", md: "none" },
                }}
              >
                <Typography sx={{ fontSize: 13, color: "#4A5260", fontWeight: 500, mb: 1 }}>
                  {stat.label}
                </Typography>
                <Typography className="spec-figure" sx={{ fontSize: { xs: 30, md: 36 }, fontWeight: 600, color: "#101418", lineHeight: 1 }}>
                  {stat.value}
                </Typography>
                <Typography sx={{ fontSize: 13, color: "#6B7380", mt: 1 }}>
                  {stat.hint}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        <Box sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="flex-end" justifyContent="space-between" sx={{ mb: 1.5 }}>
            <Box>
              <Typography sx={{ fontSize: 18, fontWeight: 600, color: "#101418", letterSpacing: "-0.01em" }}>
                Engines
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#4A5260" }}>
                Choose the engine to bill and report against, or open it to start a job.
              </Typography>
            </Box>
            <Button
              variant="outlined"
              onClick={() => router.push("/reports")}
              sx={{ textTransform: "none", borderRadius: "4px", px: 2, fontWeight: 500, borderColor: "#C7CCD5", color: "#101418", whiteSpace: "nowrap", flexShrink: 0 }}
            >
              Design analytics
            </Button>
          </Stack>

          <Grid container spacing={2}>
            {engineCards.map((engine) => {
              const selected = selectedEngine === engine.key;
              return (
                <Grid key={engine.key} size={{ xs: 12, md: 6 }}>
                  <Paper
                    elevation={0}
                    onClick={() => setSelectedEngine(engine.key)}
                    sx={{
                      height: "100%",
                      p: 2.5,
                      borderRadius: "6px",
                      border: selected ? `1px solid ${engine.accent}` : "1px solid #E3E6EB",
                      bgcolor: "#ffffff",
                      boxShadow: ply,
                      cursor: "pointer",
                      transition: "border-color 0.18s ease",
                      "&:hover": { borderColor: selected ? engine.accent : "#C7CCD5" },
                    }}
                  >
                    <Stack spacing={1.8}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: "4px",
                              flexShrink: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#fff",
                              background: engine.accent,
                            }}
                          >
                            {engine.icon}
                          </Box>
                          <Typography sx={{ fontSize: 20, fontWeight: 600, color: "#101418", letterSpacing: "-0.02em" }}>
                            {engine.title}
                          </Typography>
                        </Stack>
                        {/* Selection is a mark in a fixed cell, never colour alone */}
                        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ fontSize: 12, fontWeight: 600, color: selected ? engine.accent : "#6B7380" }}>
                          <Box sx={{ width: 10, height: 10, borderRadius: "50%", border: `2px solid ${selected ? engine.accent : "#C7CCD5"}`, bgcolor: selected ? engine.accent : "transparent" }} />
                          <span>{selected ? "Active" : "Available"}</span>
                        </Stack>
                      </Stack>

                      <Typography sx={{ fontSize: 14, color: "#4A5260", lineHeight: 1.65, maxWidth: 560 }}>
                        {engine.description}
                      </Typography>

                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                        {engine.chips.map((chip) => (
                          <Box
                            key={chip}
                            sx={{ fontSize: 12, fontWeight: 500, color: "#4A5260", border: "1px solid #E3E6EB", borderRadius: "3px", px: 1, py: 0.4, bgcolor: "#F6F7F9" }}
                          >
                            {chip}
                          </Box>
                        ))}
                      </Stack>

                      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ pt: 1.5, borderTop: "1px solid #EEF0F3" }}>
                        <Box>
                          <Typography sx={{ fontSize: 12, color: "#6B7380" }}>Plan</Typography>
                          <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#101418" }}>{isPostpaid ? "Pay as you go" : currentPlanLabel}</Typography>
                        </Box>
                        <Stack direction="row" spacing={1}>
                          {!selected && (
                            <Button
                              variant="outlined"
                              onClick={(event) => {
                                event.stopPropagation();
                                setSelectedEngine(engine.key);
                              }}
                              sx={{ textTransform: "none", borderRadius: "4px", px: 2, fontWeight: 600, borderColor: "#C7CCD5", color: "#101418" }}
                            >
                              Make active
                            </Button>
                          )}
                          <Button
                            variant="contained"
                            onClick={(event) => {
                              event.stopPropagation();
                              router.push(`/${engine.key}-engine`);
                            }}
                            sx={{
                              textTransform: "none",
                              borderRadius: "4px",
                              px: 2.2,
                              fontWeight: 600,
                              bgcolor: engine.accent,
                              color: "white",
                              boxShadow: "none",
                              "&:hover": { bgcolor: engine.key === "creation" ? "#000000" : "#1B38B4", boxShadow: "none" },
                            }}
                          >
                            Open engine
                          </Button>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {isPostpaid ? (
          <Box
            sx={{
              p: { xs: 2, md: 3 },
              borderRadius: "6px",
              border: "1px solid #E3E6EB",
              bgcolor: "#ffffff",
              boxShadow: "0 1px 2px rgba(16, 20, 24, 0.06)",
            }}
          >
            <Stack spacing={2.5}>
              <Box>
                <Typography sx={{ fontSize: "18px", fontWeight: 600, color: "#101418", mb: 1 }}>
                  Pay-as-you-go Dashboard
                </Typography>
                <Typography sx={{ color: "#6b7280", fontSize: "14px" }}>
                  This account is billed by actual usage only. No subscription plan is required.
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 2.5,
                  borderRadius: '6px',
                  background: '#F6F7F9',
                  border: '1px solid #E3E6EB',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 44, height: 44, borderRadius: '6px', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: '#2346D9', color: '#fff',
                    boxShadow: '0 1px 2px rgba(16, 20, 24, 0.06)',
                  }}
                >
                  <TrendingUpIcon sx={{ fontSize: 22 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '12px', color: '#6b7280', mb: 0.25 }}>Total Credits Used</Typography>
                  <Typography className="spec-figure" sx={{ fontSize: { xs: '30px', md: '36px' }, fontWeight: 600, color: '#101418', lineHeight: 1 }}>
                    {totalUsage.toLocaleString()}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: availableEngines.length === 1 ? '1fr' : '1fr 1fr' }, gap: 1.5 }}>
              {perEngineUsage.map((item) => {
                const engineAccent = item.engine === 'creation' ? '#101418' : '#2346D9';
                return (
                  <Box key={item.engine} sx={{ p: 2, borderRadius: '6px', border: '1px solid #E3E6EB', bgcolor: '#fff' }}>
                    <Typography sx={{ fontSize: '12px', color: '#6b7280', mb: 0.5 }}>
                      {item.engine === 'creation' ? 'Creation' : 'Transformation'} Engine
                    </Typography>
                    <Typography className="spec-figure" sx={{ fontSize: '22px', fontWeight: 600, color: engineAccent }}>
                      {item.used.toLocaleString()} credits
                    </Typography>
                  </Box>
                );
              })}
              </Box>

              <UsageDisplay horizontal engineType={selectedEngine} />
            </Stack>
          </Box>
        ) : (
          <Grid container spacing={3} alignItems="flex-start">
            <Grid size={{ xs: 12, lg: 8 }}>
              {/* Plan as one ruled row; full detail lives on the Billing page */}
              <Paper
                elevation={0}
                sx={{ p: 3, borderRadius: "6px", border: "1px solid #E3E6EB", bgcolor: "#ffffff", boxShadow: ply }}
              >
                <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between" spacing={2}>
                  <Box>
                    <Typography sx={{ fontSize: 13, color: "#4A5260", fontWeight: 500 }}>
                      {selectedEngineLabel} plan
                    </Typography>
                    <Typography sx={{ fontSize: 22, fontWeight: 600, color: "#101418", letterSpacing: "-0.01em" }}>
                      {currentPlanLabel}
                    </Typography>
                    {isPendingCancellation && (
                      <Typography sx={{ fontSize: 13, color: "#B91C1C", mt: 0.5 }}>
                        Cancels at the end of this period. You can resume it from Billing.
                      </Typography>
                    )}
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      onClick={handleManageSubscription}
                      disabled={processingItem === "portal"}
                      sx={{ textTransform: "none", borderRadius: "4px", fontWeight: 500, borderColor: "#C7CCD5", color: "#101418", whiteSpace: "nowrap" }}
                    >
                      {processingItem === "portal" ? "Opening..." : "Manage subscription"}
                    </Button>
                    <Button
                      variant="text"
                      onClick={() => router.push("/billing")}
                      sx={{ textTransform: "none", borderRadius: "4px", fontWeight: 500, color: "#2346D9", whiteSpace: "nowrap" }}
                    >
                      Plan details
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: "6px",
                  border: "1px solid #E3E6EB",
                  bgcolor: "#ffffff",
                  boxShadow: "0 1px 2px rgba(16, 20, 24, 0.06)",

                }}
              >
                <Stack spacing={2}>
                  <Box>
                    <Typography sx={{ fontSize: 18, fontWeight: 600, color: "#101418", mb: 1 }}>
                      Shortcuts
                    </Typography>
                    <Typography sx={{ color: "#4A5260", fontSize: 14, lineHeight: 1.6 }}>
                      Compare plans before your next campaign, or reopen past outputs and their compliance reports.
                    </Typography>
                  </Box>

                  <Stack direction="column" spacing={1.2}>
                    <Button
                      variant="contained"
                      onClick={() => router.push("/pricing")}
                      sx={{
                        textTransform: "none",
                        borderRadius: "4px",
                        py: 1.1,
                        fontWeight: 500,
                        bgcolor: "#2346D9",
                        boxShadow: "none",
                        '&:hover': { bgcolor: "#1B38B4", boxShadow: "none" },
                      }}
                    >
                      Review plans
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => router.push("/archive")}
                      sx={{
                        textTransform: "none",
                        borderRadius: "4px",
                        py: 1.1,
                        fontWeight: 500,
                        borderColor: "#C7CCD5",
                        color: "#101418",
                      }}
                    >
                      Open archive
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        )}

        {!isPostpaid && (
          <CancelSubscriptionModal
            open={cancelModalOpen}
            onClose={() => setCancelModalOpen(false)}
            onConfirm={handleCancelSubscription}
            planName={currentPlanLabel}
            loading={processingItem === "cancel"}
          />
        )}
      </Container>
    </Box>
  );
}
