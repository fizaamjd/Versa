"use client";

import {
    Box,
    Typography,
    Chip,
    Button,
    CircularProgress,
    Alert,
    Container,
    Grid,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ToggleButtonGroup,
    ToggleButton,
    Stack,
} from "@mui/material";
import { useEffect, useState } from "react";
import { usePricingPlans, Plan } from "@/hooks/usePricingPlans";
import { useUser } from "@/app/context/AuthContext";
import AuthModal from "../auth/AuthModal";
import { useRouter } from "next/navigation";
import { Check as CheckIcon } from "@mui/icons-material";
import { redirectToCheckout } from "@/lib/stripe";
import type { EngineType } from "@/types/billing";
import {
    hasActiveSubscription,
    getEnginePlan,
    hasEngineActiveSubscription,
    isPlanActiveForEngine
} from "@/types/billing";
import { redirectToPortal } from "@/lib/stripe";
import SwitchPlanModal from '@/app/components/modals/SwitchPlanModal';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function PricingSection() {
    const { plans, loading, error } = usePricingPlans();
    const { user } = useUser();
    const router = useRouter();
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);
    const [selectedEngine, setSelectedEngine] = useState<EngineType>('transformation');
    const [processingPlan, setProcessingPlan] = useState<string | null>(null);
    const [checkoutError, setCheckoutError] = useState<string | null>(null);
    const [switchPlanModal, setSwitchPlanModal] = useState<{ open: boolean, newPlan: string }>({ open: false, newPlan: '' });

    const handleCheckout = async (pricePlan: string) => {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                setAuthModalOpen(true);
                return;
            }

            // Check if this specific plan is already active for the selected engine
            if (isPlanActiveForEngine(user, pricePlan, selectedEngine)) {
                return;
            }

            // Check if the selected engine has any active subscription
            if (hasEngineActiveSubscription(user, selectedEngine)) {
                setSwitchPlanModal({ open: true, newPlan: pricePlan });
                return;
            }

            setProcessingPlan(pricePlan);
            setCheckoutError(null);
            await redirectToCheckout(pricePlan, selectedEngine, 'subscription');
        } catch (error) {
            console.error("Checkout error:", error);
            setCheckoutError(error instanceof Error ? error.message : 'Failed to start checkout');
            setProcessingPlan(null);
        }
    };

    const handleOpenPortal = async () => {
        try {
            setCheckoutError(null);
            await redirectToPortal();
        } catch (e) {
            setCheckoutError(e instanceof Error ? e.message : 'Failed to open billing portal');
        }
    };

    const getPlanFeatures = (planName: string) => {
        const baseFeatures = [
            'AI image transformation',
            'Five supported preset formats',
            'Gemini-native output sizes',
            'Compliance report on every output',
        ];

        switch (planName.toLowerCase()) {
            case 'starter':
                return [...baseFeatures, 'Email support', 'Basic analytics'];
            case 'growth':
                return [...baseFeatures, 'Priority support', 'Advanced analytics', 'API access', 'Custom presets'];
            case 'scale':
                return [...baseFeatures, '24/7 Premium support', 'Advanced analytics', 'Full API access', 'Custom presets', 'Dedicated account manager'];
            default:
                return baseFeatures;
        }
    };

    return (
        <Box
            sx={{
                width: "100%",
                minHeight: "100vh",
                bgcolor: "#f9fafb",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                pt: { xs: 8, md: 12 },
                px: { xs: 2, md: 4 },
                pb: { xs: 12, md: 20 },
                position: 'relative',
                overflow: 'hidden'
            }}
        >

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                {/* Engine Type Selector - Re-engineered Toggle */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 8 }}>
                    <Box
                        sx={{
                            p: 0.8,
                            bgcolor: '#F6F7F9',
                            borderRadius: '4px',
                            display: 'flex',
                            position: 'relative',
                            border: '1px solid #E3E6EB',
                        }}
                    >
                        <Box
                            sx={{
                                position: 'absolute',
                                width: '160px',
                                height: 'calc(100% - 12.8px)',
                                bgcolor: 'white',
                                borderRadius: '3px',
                                border: '1px solid #C7CCD5',
                                transition: 'all 0.4s cubic-bezier(0.19, 1, 0.22, 1)',
                                transform: selectedEngine === 'transformation' ? 'translateX(0)' : 'translateX(160px)',
                                zIndex: 0,
                            }}
                        />
                        <Button
                            disableRipple
                            onClick={() => setSelectedEngine('transformation')}
                            sx={{
                                width: '160px',
                                py: 1.2,
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '14px',
                                color: selectedEngine === 'transformation' ? '#2346D9' : '#6b7280',
                                zIndex: 1,
                                transition: 'all 0.3s ease',
                                '&:hover': { bgcolor: 'transparent', color: '#2346D9' }

                            }}
                        >
                            Transformation
                        </Button>
                        <Button
                            disableRipple
                            onClick={() => setSelectedEngine('creation')}
                            sx={{
                                width: '160px',
                                py: 1.2,
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '14px',
                                color: selectedEngine === 'creation' ? '#2346D9' : '#6b7280',
                                zIndex: 1,
                                transition: 'all 0.3s ease',
                                '&:hover': { bgcolor: 'transparent', color: '#2346D9' }

                            }}
                        >
                            Creation
                        </Button>
                    </Box>
                </Box>

                {/* Pricing Cards */}
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
                        <CircularProgress size={48} thickness={2} sx={{ color: '#2346D9' }} />
                    </Box>
                ) : error || plans.length === 0 ? (
                    <Box
                        role="alert"
                        sx={{
                            maxWidth: 480,
                            mx: 'auto',
                            my: 8,
                            p: 4,
                            textAlign: 'center',
                            bgcolor: '#ffffff',
                            border: '1px solid #E3E6EB',
                            borderRadius: '6px',
                        }}
                    >
                        <Typography sx={{ fontSize: 18, fontWeight: 600, color: '#101418', mb: 1 }}>
                            {error ? "We couldn't load the plans" : 'No plans are available yet'}
                        </Typography>
                        <Typography sx={{ fontSize: 14, color: '#4A5260', mb: 3 }}>
                            {error
                                ? 'Check your connection and try again. If it keeps happening, contact sales.'
                                : 'Plans for this engine will appear here once they are published.'}
                        </Typography>
                        {error && (
                            <Button
                                variant="contained"
                                onClick={() => window.location.reload()}
                                sx={{ bgcolor: '#2346D9', '&:hover': { bgcolor: '#1B38B4' } }}
                            >
                                Try again
                            </Button>
                        )}
                    </Box>
                ) : (
                    <>
                        <SwitchPlanModal
                            open={switchPlanModal.open}
                            onClose={() => setSwitchPlanModal({ open: false, newPlan: '' })}
                            onCancel={async () => {
                                setSwitchPlanModal({ open: false, newPlan: '' });
                                await handleOpenPortal();
                            }}
                            currentPlan={getEnginePlan(user, selectedEngine) || 'Unknown'}
                            newPlan={switchPlanModal.newPlan}
                        />
                        <Grid container spacing={4} justifyContent="center" sx={{ alignItems: 'stretch' }}>
                            {plans.map((plan: Plan) => {
                                const features = getPlanFeatures(plan.name);
                                const isRecommended = plan.name.toLowerCase() === 'growth';

                                return (
                                    <Grid size={{ xs: 12, md: 4 }} key={plan._id}>
                                        <Box
                                            sx={{
                                                height: '100%',
                                                position: 'relative',
                                                transition: 'transform 0.2s ease-in-out',
                                                '&:hover': {
                                                    transform: 'none',
                                                }
                                            }}
                                        >
                                            <Card
                                                elevation={0}
                                                sx={{
                                                    height: '100%',
                                                    borderRadius: '8px',
                                                    bgcolor: 'white',
                                                    border: isRecommended ? '1px solid #2346D9' : '1px solid #E3E6EB',
                                                    position: 'relative',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    overflow: 'hidden',
                                                    boxShadow: '0 1px 2px rgba(16, 20, 24, 0.05)',
                                                }}
                                            >
                                                <CardContent sx={{ p: { xs: 3, md: 4 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                    {/* Plan Name & Tagline */}
                                                    <Box sx={{ mb: 3 }}>
                                                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                                            <Typography
                                                                variant="h4"
                                                                sx={{
                                                                    fontSize: '20px',
                                                                    color: '#101418',
                                                                    fontWeight: 600,
                                                                    letterSpacing: '-0.01em',
                                                                }}
                                                            >
                                                                {plan.name}
                                                            </Typography>
                                                            {isRecommended && (
                                                                <Chip
                                                                    label="Most Popular"
                                                                    sx={{
                                                                        bgcolor: '#2346D9',
                                                                        color: 'white',
                                                                        fontWeight: 600,
                                                                        fontSize: '9px',
                                                                        height: '20px',
                                                                        px: 0.5,
                                                                        borderRadius: '6px',
                                                                        boxShadow: '0 1px 2px rgba(16, 20, 24, 0.06)'
                                                                    }}
                                                                />
                                                            )}
                                                        </Stack>
                                                        <Typography
                                                            sx={{
                                                                color: '#4A5260',
                                                                fontWeight: 400,
                                                                fontSize: '14px',
                                                                lineHeight: 1.5
                                                            }}
                                                        >
                                                            {plan.bestFor}
                                                        </Typography>
                                                    </Box>

                                                    {/* Pricing Section */}
                                                    <Box sx={{ mb: 6 }}>
                                                        <Stack direction="row" alignItems="baseline" spacing={0.5}>
                                                            <Typography className="spec-figure" sx={{ fontSize: '44px', fontWeight: 600, color: '#101418' }}>
                                                                ${plan.price}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: '14px', color: '#9ca3af', fontWeight: 500 }}>
                                                                /mo
                                                            </Typography>
                                                        </Stack>
                                                        <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: isRecommended ? '#2346D9' : '#e5e7eb' }} />

                                                            <Typography className="spec-figure" sx={{ fontSize: '15px', color: '#4A5260', fontWeight: 500 }}>
                                                                {plan.volume} monthly credits
                                                            </Typography>
                                                        </Box>
                                                    </Box>

                                                    {/* CTA Button */}
                                                    <Button
                                                        fullWidth
                                                        variant="contained"
                                                        onClick={() => handleCheckout(plan.name)}
                                                        disabled={
                                                            !!processingPlan ||
                                                            isPlanActiveForEngine(user, plan.name, selectedEngine)
                                                        }
                                                        sx={{
                                                            py: 1.4,
                                                            borderRadius: '6px',
                                                            fontSize: '13px',
                                                            fontWeight: 600,
                                                            mb: 4,
                                                            textTransform: 'none',
                                                            transition: 'all 0.4s cubic-bezier(0.19, 1, 0.22, 1)',
                                                            bgcolor: isRecommended ? '#2346D9' : '#101418',
                                                            color: 'white',
                                                            boxShadow: 'none',
                                                            '&:hover': {
                                                                bgcolor: isRecommended ? '#1B38B4' : '#000000',
                                                                boxShadow: 'none',
                                                            },

                                                            '&:disabled': {
                                                                bgcolor: '#f3f4f6',
                                                                color: '#9ca3af'
                                                            }
                                                        }}
                                                    >
                                                        {isPlanActiveForEngine(user, plan.name, selectedEngine)
                                                            ? 'Active Subscription'
                                                            : hasEngineActiveSubscription(user, selectedEngine)
                                                                ? 'Switch Plan'
                                                                : (processingPlan === plan.name ? 'Preparing...' : 'Get Started')}
                                                    </Button>

                                                    {/* Features List */}
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography sx={{ color: '#101418', fontWeight: 700, fontSize: '14px', mb: 3 }}>
                                                            Platform Capabilities
                                                        </Typography>
                                                        <List sx={{ p: 0 }}>
                                                            {features.map((feature, idx) => (
                                                                <ListItem key={idx} sx={{ px: 0, py: 1 }}>
                                                                    <ListItemIcon sx={{ minWidth: 32 }}>
                                                                        <Box sx={{
                                                                            width: 20,
                                                                            height: 20,
                                                                            borderRadius: '6px',
                                                                            bgcolor: isRecommended ? 'rgba(35, 70, 217,0.1)' : '#f3f4f6',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center'
                                                                        }}>
                                                                            <CheckIcon sx={{ fontSize: 13, color: isRecommended ? '#2346D9' : '#101418' }} />

                                                                        </Box>
                                                                    </ListItemIcon>
                                                                    <ListItemText
                                                                        primary={feature}
                                                                        primaryTypographyProps={{
                                                                            sx: { fontSize: '13px', color: '#4b5563', fontWeight: 450 }
                                                                        }}
                                                                    />
                                                                </ListItem>
                                                            ))}
                                                        </List>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Box>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </>
                )}

            </Container>

            <AuthModal
                open={isAuthModalOpen}
                onClose={() => setAuthModalOpen(false)}
            />
        </Box>
    );
}
