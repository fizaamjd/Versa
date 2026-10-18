"use client";
import { VersaLogo } from "@/components/brand/VersaLogo";
import React from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { extractApiErrorMessage } from '@/lib/errorMessage';

interface ProcessedImage {
  id: string;
  preset: string;
  url: string;
  ratio: string;
}

interface HeaderProps {
  processedImages?: ProcessedImage[];
}

const Header = ({ processedImages = [] }: HeaderProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleGoBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  const handleDownloadAll = async () => {
    if (processedImages.length === 0) {
      toast.error('No images to download');
      return;
    }

    try {
      for (let i = 0; i < processedImages.length; i++) {
        const image = processedImages[i];
        const response = await fetch(image.url);
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${image.preset}-${image.ratio}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        // Small delay between downloads to prevent browser blocking
        if (i < processedImages.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
    } catch (error) {
      console.error('Error downloading images:', error);
      toast.error(extractApiErrorMessage(error, 'Failed to download some images'));
    }
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: '#fff',
        minHeight: 80,
        boxShadow: 'none',
        color: 'text.primary',
        borderBottom: '1px solid #e5e7eb',
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: { xs: 2, sm: 3, md: 6, lg: 8 },
          minHeight: { xs: 64, md: 80 },
          gap: 1,
        }}
      >
        {/* Logo Section */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <VersaLogo height={30} />
        </Box>

        {/* Right Side Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            onClick={handleDownloadAll}
            disabled={processedImages.length === 0}
            startIcon={<DownloadIcon />}
            variant="contained"
            sx={{
              textTransform: 'none',
              bgcolor: 'rgba(35, 70, 217, 1)',
              color: 'white',
              fontSize: { xs: '13px', md: '14px' },
              fontWeight: 600,
              borderRadius: '4px',
              '&:hover': {
                bgcolor: 'rgba(35, 70, 217, 0.9)',
              },
              '&.Mui-disabled': {
                bgcolor: '#f3f4f6',
                color: '#9ca3af',
              },
              px: { xs: 1.5, md: 3 },
              py: { xs: 0.8, md: 1.2 },
              minWidth: { xs: 'auto', md: '140px' },
              '& .MuiButton-startIcon': {
                marginRight: { xs: 0, md: 1 },
                marginLeft: { xs: 0, md: -0.5 }
              }
            }}
          >
            <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>
              Download All
            </Box>
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;

