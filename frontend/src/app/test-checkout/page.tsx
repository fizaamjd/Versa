"use client";

import React from 'react';
import { Box, Button, Container, Typography, Alert, CircularProgress, Paper } from '@mui/material';
import Header from '@/app/components/Header';
import { useUser } from '@/app/context/AuthContext';
import { redirectToTestCheckout } from '@/lib/stripe';

const TestCheckoutPage = () => {
  const { user } = useUser();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (!user) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f9fafb' }}>
      <Header />
      <Container maxWidth="sm" sx={{ py: { xs: 4, md: 6 } }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            bgcolor: 'white',
            boxShadow: '0 1px 2px rgba(16, 20, 24, 0.06)',
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontSize: { xs: '24px', md: '28px' },
              fontWeight: 700,
              color: '#101418',
              mb: 1,
            }}
          >
            $1 Tester Checkout
          </Typography>
          <Typography sx={{ fontSize: '14px', color: '#6b7280', mb: 3 }}>
            This private page lets you run a one-time $1 Stripe payment to confirm that live billing is configured
            correctly. It does not change your subscription or credits.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Button
            fullWidth
            variant="contained"
            onClick={async () => {
              setLoading(true);
              setError(null);
              try {
                await redirectToTestCheckout();
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to start test checkout');
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            sx={{
              height: '48px',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '6px',
              bgcolor: 'rgba(35, 70, 217, 1)',
              '&:hover': {
                bgcolor: 'rgba(35, 70, 217, 0.9)',
              },
            }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Start $1 Test Payment'}
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default TestCheckoutPage;

