"use client";

import React, { useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Button,
} from '@mui/material';
import {
    Cancel as CancelIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { usePageHeader } from '@/app/context/PageHeaderContext';

const BillingCancelPage = () => {
    const router = useRouter();
    const { setHeader, resetHeader } = usePageHeader();

    useEffect(() => {
        setHeader({ title: 'Payment Cancelled' });
        return () => resetHeader();
    }, [setHeader, resetHeader]);

    return (
        <Box>
            <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 4, md: 6 },
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        bgcolor: 'white',
                        textAlign: 'center',
                        boxShadow: '0 1px 2px rgba(16, 20, 24, 0.06)',
                    }}
                >
                    <Box
                        sx={{
                            width: 80, height: 80, borderRadius: '50%',
                            bgcolor: 'rgba(239, 68, 68, 0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            mx: 'auto', mb: 3,
                        }}
                    >
                        <CancelIcon sx={{ fontSize: 48, color: '#ef4444' }} />
                    </Box>

                    <Typography variant="h4" sx={{ fontSize: { xs: '24px', md: '32px' }, fontWeight: 600, color: '#101418', mb: 2 }}>
                        Payment Cancelled
                    </Typography>

                    <Typography sx={{ fontSize: '16px', color: '#6b7280', mb: 4, maxWidth: '500px', mx: 'auto' }}>
                        Your payment was cancelled and no charges were made to your account. You can try again whenever you're ready.
                    </Typography>

                    <Box sx={{ p: 3, borderRadius: '6px', bgcolor: '#fef3c7', border: '1px solid #fbbf24', mb: 4 }}>
                        <Typography sx={{ fontSize: '14px', color: '#92400e', fontWeight: 500 }}>
                            💡 Your current plan and credits remain unchanged
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Button variant="contained" onClick={() => router.push('/billing')}
                            sx={{ bgcolor: 'rgba(35, 70, 217, 1)', textTransform: 'none', fontWeight: 500, px: 4, py: 1.2, borderRadius: '4px', '&:hover': { bgcolor: 'rgba(35, 70, 217, 0.9)' } }}
                        >
                            Back to Billing
                        </Button>
                        <Button variant="outlined" onClick={() => router.push('/dashboard')}
                            sx={{ borderColor: '#e5e7eb', color: '#101418', textTransform: 'none', fontWeight: 500, px: 4, py: 1.2, borderRadius: '4px', '&:hover': { borderColor: 'rgba(35, 70, 217, 1)', bgcolor: 'rgba(35, 70, 217, 0.02)' } }}
                        >
                            Go to Dashboard
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default BillingCancelPage;
