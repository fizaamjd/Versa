'use client';

import React from 'react';
import { Box, Container, Typography, Paper, Stack, Avatar, Divider, Button, Chip, Alert } from '@mui/material';
import { useUser } from '@/app/context/AuthContext';
import { usePageHeader } from '@/app/context/PageHeaderContext';
import { PersonOutline as PersonIcon, MailOutline as EmailIcon, BadgeOutlined as BadgeIcon, ShieldOutlined as SecurityIcon } from '@mui/icons-material';
import { getPlanLabel } from '@/types/billing';
import { cancelSubscription, redirectToPortal } from '@/lib/stripe';

export default function SettingsPage() {
    const { user, refreshUser } = useUser();
    const { setHeader, resetHeader } = usePageHeader();
    const [processing, setProcessing] = React.useState<'portal' | 'cancel' | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [success, setSuccess] = React.useState<string | null>(null);

    React.useEffect(() => {
        setHeader({ title: 'Account Settings' });
        return () => resetHeader();
    }, [setHeader, resetHeader]);

    if (!user) return null;

    const hasSubscription = Boolean(user.stripeSubscriptionId);
    const isPostpaid = Boolean(user.is_postpaid);

    const handleOpenPortal = async () => {
        setProcessing('portal');
        setError(null);
        setSuccess(null);
        try {
            await redirectToPortal();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to open billing portal');
        } finally {
            setProcessing(null);
        }
    };

    const handleCancelNow = async () => {
        if (!user.stripeSubscriptionId) return;
        if (!window.confirm('Cancel your subscription immediately? You will lose included monthly credits.')) return;
        setProcessing('cancel');
        setError(null);
        setSuccess(null);
        try {
            await cancelSubscription(false);
            await refreshUser();
            setSuccess('Subscription cancelled successfully.');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to cancel subscription');
        } finally {
            setProcessing(null);
        }
    };

    return (
        <Box>
            <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>


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

                <Stack spacing={4}>
                    {/* Profile Section */}
                    <Paper elevation={0} sx={{ p: 4, borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                            <Avatar
                                src={user.avatar}
                                variant="rounded"
                                sx={{ width: 72, height: 72, borderRadius: '6px', bgcolor: '#101418', color: '#ffffff', fontSize: 28, fontWeight: 600 }}
                            >
                                {user.fullName?.charAt(0)}
                            </Avatar>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>{user.fullName}</Typography>
                                <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ mb: 4 }} />

                        <Stack spacing={3}>
                            <Box>
                                <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PersonIcon fontSize="small" /> Full Name
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>{user.fullName}</Typography>
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <EmailIcon fontSize="small" /> Email Address
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>{user.email}</Typography>
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <BadgeIcon fontSize="small" /> Account ID
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#9ca3af', fontSize: '14px' }}>{user.id}</Typography>
                            </Box>
                        </Stack>
                    </Paper>

                    {/* Subscription Section */}
                    {!isPostpaid && (
                    <Paper elevation={0} sx={{ p: 4, borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Subscription & Usage</Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3, bgcolor: '#f6f7f9', borderRadius: '6px', border: '1px solid #eef0f3' }}>
                            <Box>
                                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#4a5260', mb: 0.5 }}>Current Plan</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Typography variant="h5" sx={{ fontWeight: 800, color: 'rgba(35, 70, 217, 1)' }}>
                                        {getPlanLabel(user.plan)}
                                    </Typography>
                                    <Chip
                                        label={hasSubscription ? "Active" : "Inactive"}
                                        size="small"
                                        sx={{
                                            bgcolor: hasSubscription ? 'rgba(34, 197, 94, 0.1)' : 'rgba(148, 163, 184, 0.15)',
                                            color: hasSubscription ? '#16a34a' : '#6b7380',
                                            fontWeight: 600,
                                            fontSize: '11px'
                                        }}
                                    />
                                </Box>
                            </Box>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} sx={{ alignItems: { sm: 'center' } }}>
                                {/* <Button
                                    variant="outlined"
                                    href="/pricing"
                                    sx={{
                                        borderRadius: '4px',
                                        textTransform: 'none',
                                        borderColor: '#e3e6eb',
                                        color: '#4a5260',
                                        '&:hover': { borderColor: 'rgba(35, 70, 217, 1)', bgcolor: 'rgba(35, 70, 217, 0.02)' }
                                    }}
                                >
                                    Change Plan
                                </Button> */}
                                {hasSubscription && (
                                    <>
                                        <Button
                                            variant="outlined"
                                            onClick={handleOpenPortal}
                                            disabled={processing !== null}
                                            sx={{
                                                borderRadius: '4px',
                                                textTransform: 'none',
                                                borderColor: '#e3e6eb',
                                                color: '#4a5260',
                                            }}
                                        >
                                            {processing === 'portal' ? 'Opening…' : 'Manage Billing'}
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="error"
                                            onClick={handleCancelNow}
                                            disabled={processing !== null}
                                            sx={{
                                                borderRadius: '4px',
                                                textTransform: 'none',
                                                fontWeight: 800,
                                            }}
                                        >
                                            {processing === 'cancel' ? 'Cancelling…' : 'Cancel Plan'}
                                        </Button>
                                    </>
                                )}
                            </Stack>
                        </Box>

                        <Box sx={{ mt: 3, display: 'flex', gap: 4 }}>
                            <Box>
                                <Typography variant="caption" sx={{ color: '#6b7380', fontWeight: 600 }}>Available Credits</Typography>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>{(user.maxUnits - user.units).toLocaleString()}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" sx={{ color: '#6b7380', fontWeight: 600 }}>Total Capacity</Typography>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>{user.maxUnits.toLocaleString()}</Typography>
                            </Box>
                        </Box>
                    </Paper>
                    )}

                    {/* Security Section (Placeholder) */}
                    <Paper elevation={0} sx={{ p: 4, borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Security</Typography>
                        <Button
                            startIcon={<SecurityIcon />}
                            variant="contained"
                            disabled
                            sx={{
                                borderRadius: '6px',
                                textTransform: 'none',
                                bgcolor: '#eef0f3',
                                color: '#6b7380',
                                boxShadow: 'none'
                            }}
                        >
                            Password reset is managed by your organisation admin
                        </Button>
                    </Paper>
                </Stack>
            </Container>
        </Box>
    );
}
