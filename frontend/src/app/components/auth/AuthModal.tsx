'use client';

import { Modal, Box, Typography, Button } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function AuthModal({ open, onClose }: { open: boolean, onClose: () => void }) {
    const router = useRouter();

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400,
                bgcolor: 'background.paper',
                borderRadius: '6px',
                boxShadow: 24,
                p: 4,
                textAlign: 'center'
            }}>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                    Account Required
                </Typography>
                <Typography sx={{ mb: 4, color: 'text.secondary' }}>
                    Please log in or sign up to continue with your purchase.
                </Typography>
                <Button
                    fullWidth
                    variant="contained"
                    sx={{ mb: 2, bgcolor: '#2346D9', borderRadius: '4px' }}
                    onClick={() => router.push('/auth')}
                >
                    Go to Login/Signup
                </Button>
                <Button
                    fullWidth
                    variant="outlined"
                    sx={{ borderRadius: '4px' }}
                    onClick={onClose}
                >
                    Cancel
                </Button>
            </Box>
        </Modal>
    );
}
