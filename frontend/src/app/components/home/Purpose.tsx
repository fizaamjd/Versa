'use client';

import { Box, Typography, Container, Grid, Paper } from '@mui/material';
import LayersIcon from '@mui/icons-material/Layers';
import SpeedIcon from '@mui/icons-material/Speed';
import AccessibilityIcon from '@mui/icons-material/Accessibility';

export default function PurposeSection() {
    const features = [
        {
            icon: <LayersIcon sx={{ fontSize: 40, color: 'rgba(35, 70, 217, 1)' }} />,
            title: "Image transformation",
            desc: "Upload an image and select one of five preset formats to request an AI-transformed output."
        },
        {
            icon: <SpeedIcon sx={{ fontSize: 40, color: 'rgba(35, 70, 217, 1)' }} />,
            title: "Prompt-based creation",
            desc: "Describe an image and choose a supported format. Generation time depends on the image service."
        },
        {
            icon: <AccessibilityIcon sx={{ fontSize: 40, color: 'rgba(35, 70, 217, 1)' }} />,
            title: "Review before use",
            desc: "Review generated artwork and its technical and AI image report. Check text, branding and accessibility before publishing."
        }
    ];

    return (
        <Box sx={{ py: 15, bgcolor: '#ffffff', borderTop: '1px solid #f3f4f6' }}>
            <Container maxWidth="lg">
                <Box textAlign="center" mb={10}>
                    <Typography
                        variant="overline"
                        sx={{ fontWeight: 800, color: 'rgba(35, 70, 217, 1)', letterSpacing: '0.2em' }}
                    >
                        OUR MISSION
                    </Typography>
                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 600,
                            color: '#101418',
                            mt: 2,
                            mb: 3,
                            letterSpacing: '-0.02em',
                            fontSize: { xs: '32px', md: '46px' }
                        }}
                    >
                        Democratizing Professional Design.
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{ color: '#6b7280', maxWidth: '700px', mx: 'auto', fontWeight: 400, lineHeight: 1.6, fontSize: { xs: '18px', md: '18px' } }}
                    >
                        Versa bridges the gap between complex AI capabilities and intuitive creative control, empowering every business to tell their story visually.
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    {features.map((f, i) => (
                        <Grid size={{ xs: 12, md: 4 }} key={i}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 5,
                                    height: '100%',
                                    borderRadius: '8px',
                                    border: '1px solid #f3f4f6',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(0)',
                                        boxShadow: '0 1px 2px rgba(16, 20, 24, 0.06)',
                                        borderColor: 'rgba(35, 70, 217, 0.2)'
                                    }
                                }}
                            >
                                <Box sx={{ mb: 3 }}>
                                    {f.icon}
                                </Box>
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#101418' }}>
                                    {f.title}
                                </Typography>
                                <Typography sx={{ color: '#6b7280', lineHeight: 1.7, fontSize: '0.95rem' }}>
                                    {f.desc}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}
