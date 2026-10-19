"use client";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Paper,
  IconButton,
  Stack,
  Modal,
  CircularProgress,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { IMAGE_PRESETS } from "@/lib/presets";
import ComplianceBadge from "./compliance/ComplianceBadge";
import { useUser } from "../context/AuthContext";
import { usePageHeader } from "../context/PageHeaderContext";
import { toast } from "react-toastify";
import { extractApiErrorMessage } from "@/lib/errorMessage";
import {
  Tune as EnhanceIcon,
  Engineering as EngineeringIcon,
  Download as DownloadIcon,
  Fullscreen as FullscreenIcon,
  Close as CloseIcon,
  Image as ImageIcon,
  AspectRatio as SizeIcon,
  FactCheck as CheckIcon,
  CheckCircle as CheckCircleIcon,
  CloudUpload as CloudUploadIcon,
  WarningAmberRounded as WarningAmberIcon,
} from "@mui/icons-material";

interface ProcessedImage {
  id: string;
  preset: string;
  url: string;
  ratio: string;
  reportId?: string;
}

interface UploadedImageFile {
  id: string;
  file: File;
  url: string;
  name: string;
}

// Local theme removed to use global ThemeRegistry

// ── Client-side image compression to prevent 413 errors ──────────────────
const MAX_UPLOAD_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB target max
const MAX_DIMENSION = 2048; // Max width/height for the compressed image

/**
 * Compress an image file client-side so it fits within MAX_UPLOAD_SIZE_BYTES.
 * Uses canvas resize + JPEG compression with adaptive quality.
 * Returns the original file if it's already small enough.
 */
async function compressImage(file: File): Promise<File> {
  // Skip if already under limit
  if (file.size <= MAX_UPLOAD_SIZE_BYTES) {
    return file;
  }

  return new Promise<File>((resolve, reject) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      // Calculate new dimensions (scale down if needed)
      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const scale = MAX_DIMENSION / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      // Adaptive quality: start higher, reduce until under limit
      const tryQuality = (quality: number) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Canvas toBlob failed"));
              return;
            }
            if (blob.size <= MAX_UPLOAD_SIZE_BYTES || quality <= 0.3) {
              const compressedFile = new File(
                [blob],
                file.name.replace(/\.[^.]+$/, ".jpg"),
                { type: "image/jpeg" },
              );
              console.log(
                `🗜️ Compressed ${(file.size / 1024 / 1024).toFixed(1)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(1)}MB (q=${quality.toFixed(1)}, ${width}×${height})`,
              );
              resolve(compressedFile);
            } else {
              // Try again at lower quality
              tryQuality(quality - 0.1);
            }
          },
          "image/jpeg",
          quality,
        );
      };

      tryQuality(0.85);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // If we can't load it, return the original and let the server handle it
      resolve(file);
    };

    img.src = objectUrl;
  });
}

const STANDARD_PRESETS = IMAGE_PRESETS;

// Parses a supported ratio into [w, h] for the chip glyph.
function parseRatioDims(ratio: string): [number, number] {
  const parts = ratio.split(":").map(Number);
  if (parts.length === 2 && parts.every((n) => Number.isFinite(n) && n > 0)) {
    return [parts[0], parts[1]];
  }
  return [1, 1];
}

function RatioGlyph({ ratio, color, selected = false }: { ratio: string; color: string; selected?: boolean }) {
  const [rw, rh] = parseRatioDims(ratio);
  const maxDim = 24;
  const minDim = 9;
  const w = rw >= rh ? maxDim : Math.max(minDim, Math.round(maxDim * (rw / rh)));
  const h = rh >= rw ? maxDim : Math.max(minDim, Math.round(maxDim * (rh / rw)));
  return (
    <Box sx={{ width: 32, height: 36, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "3px" }}>
      {/* width dimension: ticks and a line, spec-sheet style */}
      <Box sx={{ width: w, height: 5, borderLeft: "1px solid #101418", borderRight: "1px solid #101418", position: "relative" }}>
        <Box sx={{ position: "absolute", left: 0, right: 0, top: 2, height: "1px", bgcolor: "#101418" }} />
      </Box>
      <Box
        className={selected ? "spec-hatch" : undefined}
        sx={{
          width: w,
          height: h,
          borderRadius: "1px",
          border: `1px solid ${color}`,
          bgcolor: selected ? undefined : `${color}14`,
          transition: "all 0.18s ease",
        }}
      />
    </Box>
  );
}

function specLabel(ratio: string): string {
  return ratio;
}

/* One output frame drawn as a dimensioned drawing with a hatched safe margin. */
function SpecFrame({ ratio, label, ghost = false }: { ratio: string; label: string; ghost?: boolean }) {
  const [rw, rh] = parseRatioDims(ratio);
  const k = Math.min(200 / rw, 150 / rh);
  const w = Math.max(28, Math.round(rw * k));
  const h = Math.max(18, Math.round(rh * k));
  const ink = ghost ? "#C7CCD5" : "#101418";
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.75 }}>
      <Box sx={{ width: w, height: 9, borderLeft: `1px solid ${ink}`, borderRight: `1px solid ${ink}`, position: "relative" }}>
        <Box sx={{ position: "absolute", left: 0, right: 0, top: 4, height: "1px", bgcolor: ink }} />
      </Box>
      <Box
        className={ghost ? undefined : "spec-hatch"}
        sx={{
          width: w,
          height: h,
          position: "relative",
          borderRadius: "2px",
          border: ghost ? "1px dashed #C7CCD5" : "1px solid #2346D9",
          bgcolor: ghost ? "transparent" : undefined,
        }}
      >
        {!ghost && <Box sx={{ position: "absolute", inset: "12%", bgcolor: "#E8EDFC" }} />}
      </Box>
      <Typography className="spec-figure" sx={{ fontSize: 12, fontWeight: 600, color: ghost ? "#6B7380" : "#101418" }}>
        {label}
      </Typography>
    </Box>
  );
}

const ImageProcessor = (props: { engineType?: string }) => {
  const engineType = props.engineType || "transformation";
  const { user, refreshUser } = useUser();
  const { setHeader } = usePageHeader();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const promptInputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(
    null,
  );
  const [selectedPresets, setSelectedPresets] = useState<string[]>([]);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [prompt, setPrompt] = useState("");
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImageFile[]>([]);
  const [idCounter, setIdCounter] = useState(0);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    preset: string;
    ratio: string;
    reportId?: string;
  } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLimitExceeded, setIsLimitExceeded] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [showPresetLimit, setShowPresetLimit] = useState(false);
  const presets = STANDARD_PRESETS;

  const getEngineRemainingCredits = () => {
    const engineCredits =
      (user?.engine_data?.[engineType as "transformation" | "creation"] as any)
        ?.credits || user?.credits;
    return Number(engineCredits?.remaining_units || 0);
  };

  const getEstimatedCreditsPerRequest = () => {
    const hasImage = Boolean(uploadedImage);
    const hasCustomPrompt = Boolean(prompt && prompt.trim()) && engineType === "creation";
    if (engineType === "creation" && hasImage && hasCustomPrompt) {
      return 6;
    }
    return 4;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('No image files found');
      return;
    }

    // Revoke previous URLs to prevent memory leaks
    uploadedImages.forEach(img => {
      if (img.url.startsWith('blob:')) {
        URL.revokeObjectURL(img.url);
      }
    });

    const newId = idCounter + 1;
    setIdCounter(newId);

    const newImage: UploadedImageFile = {
      id: `img-${newId}`,
      file,
      url: URL.createObjectURL(file),
      name: file.name,
    };

    setUploadedImages([newImage]);
    setUploadedImage(newImage.file);
    setPreviewUrl(newImage.url);
    setProcessedImages([]);

    // Reset file input so user can re-upload the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageSelect = (image: UploadedImageFile) => {
    setUploadedImage(image.file);
    setPreviewUrl(image.url);
    setProcessedImages([]);
  };

  const MAX_PRESETS = 2;
  const handleRemoveImage = (imageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === imageId);
      if (imageToRemove && imageToRemove.url.startsWith("blob:")) {
        URL.revokeObjectURL(imageToRemove.url);
      }
      return prev.filter((img) => img.id !== imageId);
    });

    // If the removed image was selected, clear the preview
    const removedImage = uploadedImages.find((img) => img.id === imageId);
    if (removedImage && previewUrl === removedImage.url) {
      setUploadedImage(null);
      setPreviewUrl("");
      setProcessedImages([]);
    }
  };

  const handlePresetChange = (presetId: string) => {
    // Deselect — always allowed
    if (selectedPresets.includes(presetId)) {
      setSelectedPresets(selectedPresets.filter((p) => p !== presetId));
      return;
    }
    // Block if at limit
    if (selectedPresets.length >= MAX_PRESETS) {
      setShowPresetLimit(true);
      return;
    }
    setSelectedPresets([...selectedPresets, presetId]);
  };

  // Helper: extract the image URL + compliance reportId from a response (handles binary and JSON)
  const extractResult = async (
    response: Response,
  ): Promise<{ url: string; reportId?: string }> => {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.startsWith("image/")) {
      const blob = await response.blob();
      return { url: URL.createObjectURL(blob) };
    }
    try {
      const text = await response.text();
      const data = JSON.parse(text);
      return {
        url: data.url || data.image_url || data.data?.url || previewUrl,
        reportId: data.reportId,
      };
    } catch {
      return { url: previewUrl };
    }
  };

  const extractResponseErrorMessage = async (
    response: Response,
    fallback: string,
  ): Promise<string> => {
    try {
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await response.json();
        return data?.detail || data?.message || data?.error || fallback;
      }

      const text = (await response.text())?.trim();
      return text || response.statusText || fallback;
    } catch {
      return response.statusText || fallback;
    }
  };

  const handleProcessImage = async () => {
    if (!user) {
      toast.error("Please login to process images");
      router.push("/auth");
      return;
    }

    // Validation
    const isImageMissing = !uploadedImage;
    const isPromptMissing = !prompt || !prompt.trim();
    const hasPresets = selectedPresets.length > 0;

    if (engineType === "transformation" && isImageMissing) {
      toast.error("Please upload an image for the Transformation engine");
      return;
    }

    if (engineType === "creation" && isImageMissing && isPromptMissing) {
      toast.error(
        "Please provide either an image or a prompt for the Creation engine",
      );
      return;
    }

    if (!hasPresets) {
      if (engineType === "creation" && prompt.trim()) {
        // Allow creation engine with prompt to default to square
      } else {
        toast.error("Please select at least one preset");
        return;
      }
    }

    const isPostpaid = Boolean((user as any).is_postpaid);
    const remainingCredits = getEngineRemainingCredits();
    const estimatedCreditsPerRequest = getEstimatedCreditsPerRequest();

    if (!isPostpaid && remainingCredits < estimatedCreditsPerRequest) {
      setIsLimitExceeded(true);
      toast.error(
        `Insufficient credits. Need ${estimatedCreditsPerRequest.toFixed(1)}, have ${remainingCredits.toFixed(1)}.`,
      );
      return;
    }

    setIsProcessing(true);
    setProcessedImages([]);
    const toastId = toast.loading(
      engineType === "transformation"
        ? "Processing transformation..."
        : "Processing creation request...",
    );

    const token = localStorage.getItem("auth_token");
    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

    // Compress the image once up front so every preset reuses the same blob
    let imageToUpload: File | null = null;
    if (uploadedImage) {
      try {
        imageToUpload = await compressImage(uploadedImage);
      } catch (err) {
        console.warn("Image compression failed, using original:", err);
        imageToUpload = uploadedImage;
      }
    }

    try {
      const results: ProcessedImage[] = [];
      const failedMessages: string[] = [];
      let insufficientCreditsMessage: string | null = null;

      // Helper: make a single resize request and parse the result
      const callResize = async (
        aspectRatio: string,
        label: string,
        id: string,
      ): Promise<ProcessedImage | null> => {
        const formData = new FormData();
        if (imageToUpload) formData.append("file", imageToUpload);
        formData.append("engine_type", engineType);
        if (prompt.trim()) formData.append("prompt", prompt);

        formData.append("aspect_ratio", aspectRatio);

        const response = await fetch(`${API_BASE_URL}/resize`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!response.ok) {
          // Surface the real error to the user for known status codes
          if (response.status === 413) {
            throw new Error(
              `Image is too large for ${label}. Please use a smaller image (under 2 MB).`,
            );
          }
          const errText = await extractResponseErrorMessage(
            response,
            `Failed to process ${label}`,
          );
          if (response.status === 429) {
            throw new Error(errText);
          }
          console.error(`Failed to process ${label}: ${response.status} ${errText}`);
          return null;
        }

        const { url: imageUrl, reportId } = await extractResult(response);
        return { id, preset: label, url: imageUrl, ratio: aspectRatio, reportId };
      };

      // Process selected presets
      const presetsToProcess = hasPresets
        ? selectedPresets
        : engineType === "creation" && prompt.trim()
          ? ["square"]
          : [];

      const failedLabels: string[] = [];

      const presetPromises = presetsToProcess.map(async (presetId, index) => {
        const preset = presets.find((p) => p.id === presetId);
        if (!preset) return;

        try {
          const result = await callResize(
            preset.ratio,
            preset.label,
            `res-${Date.now()}-${preset.id}-${index}`,
          );
          if (result) {
            results.push(result);
          } else {
            failedLabels.push(preset.label);
          }
        } catch (e) {
          const message = extractApiErrorMessage(e, `Failed to process ${preset.label}`);
          if (/insufficient credits/i.test(message)) {
            insufficientCreditsMessage = message;
          }
          failedLabels.push(preset.label);
        }
      });

      await Promise.all(presetPromises);

      setProcessedImages(results);

      const totalExpected = presetsToProcess.length;

      if (results.length === totalExpected && results.length > 0) {
        toast.update(toastId, {
          render: `Successfully generated ${results.length} images!`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      } else if (results.length > 0) {
        toast.update(toastId, {
          render: `Partial success: Generated ${results.length} images, but failed on: ${failedLabels.join(", ")}`,
          type: "warning",
          isLoading: false,
          autoClose: 5000,
        });
      } else {
        if (insufficientCreditsMessage) {
          setIsLimitExceeded(true);
        }
        toast.update(toastId, {
          render:
            insufficientCreditsMessage ||
            `Failed to process image(s). Ensure you have enough credits or try again.`,
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      }
    } catch (error: any) {
      console.error("Error processing image:", error);
      toast.update(toastId, {
        render: extractApiErrorMessage(error, "Failed to process image"),
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    } finally {
      setIsProcessing(false);
      refreshUser();
    }
  };

  const handleOpenModal = (image: {
    url: string;
    preset: string;
    ratio: string;
    reportId?: string;
  }) => {
    setSelectedImage(image);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedImage(null);
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error downloading image:", error);
      toast.error(extractApiErrorMessage(error, "Failed to download image"));
    }
  };

  const handleDownloadAll = async () => {
    if (processedImages.length === 0) return;
    for (const image of processedImages) {
      await handleDownload(image.url, `${image.preset}-${image.ratio}.png`);
      // Add a slight delay between downloads to prevent browser throttling
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  };

  // useEffect(() => {
  //   setHeader({
  //     actionLabel: "Download Output",
  //     actionDisabled: processedImages.length === 0,
  //     onAction: handleDownloadAll,
  //   });

  //   return () => {
  //     setHeader({
  //       actionLabel: undefined,
  //       actionDisabled: undefined,
  //       onAction: undefined,
  //     });
  //   };
  // }, [processedImages, setHeader]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f9fafb" }}>
      {/* Description Section */}
      <Box
        sx={{
          position: "relative",
          bgcolor: "#f9fafb",
          // borderBottom: '1px solid #e5e7eb',
          py: { xs: 1.5, md: 2 },
          // px: { xs: 1.5, sm: 2, md: 3, lg: 3 },
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            zIndex: 0,
          }}
        >
        </Box>
        <Container
          maxWidth={false}
          sx={{
            px: 0,
            position: "relative",
            zIndex: 1,
          }}
        >
          <Box
            sx={{
              maxWidth: "1200px",
              mx: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            {/* 
            <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' }, pt: { xs: 2, md: 4 } }}>
              <Typography
                variant="h4"
                sx={{
                  fontSize: { xs: '26px', md: '30px', lg: '32px' },
                  fontWeight: 500,
                  color: '#101418',
                  mb: 2.5,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                }}
              >
                Neural <br />
                <Box
                  component="span"
                  sx={{
                    color: 'rgba(35, 70, 217, 1)',
                  }}
                >
                  {engineType === 'transformation' ? 'Transformation Engine' : 'Creation Engine'}
                </Box>
              </Typography>
              <Typography
                sx={{
                  fontSize: '15px',
                  color: '#4b5563',
                  lineHeight: 1.6,
                  maxWidth: '600px',
                  mx: { xs: 'auto', md: 0 },
                  fontWeight: 450,
                }}
              >
                Provision, resize, and optimize high-density content in sub-seconds.
                The intelligent infrastructure layer for automated visual batch operations.
              </Typography>
            </Box>
            */}
            {/* Feature Cards and Usage Display Banner - Responsive Grid */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)",
                },
                gap: 2,
                width: "100%",
                maxWidth: "1200px",
                mx: "auto",
              }}
            >
              {[
                {
                  icon: <ImageIcon sx={{ fontSize: 20 }} />,
                  label: "Sizes",
                  value: `${STANDARD_PRESETS.length} standard ratios`,
                  sub: "Square, story, landscape, portrait and ultrawide",
                },
                {
                  icon: <SizeIcon sx={{ fontSize: 20 }} />,
                  label: "Output",
                  value: "Preset sizes",
                  sub: "Gemini-native output dimensions",
                },
                {
                  icon: <CheckIcon sx={{ fontSize: 20 }} />,
                  label: "Check",
                  value: "Compliance report",
                  sub: "On every output",
                },
              ].map((item, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    px: 2,
                    py: 1.5,
                    bgcolor: "#ffffff",
                    border: "1px solid #E3E6EB",
                    borderRadius: "6px",
                    boxShadow: "0 1px 2px rgba(16, 20, 24, 0.06)",
                    transition: "all 0.2s ease-in-out",
                    cursor: "default",
                    height: "100%",
                    "&:hover": {
                      transform: "translateY(0)",
                      bgcolor: "#ffffff",
                      borderColor: "#C7CCD5",
                      boxShadow: "0 1px 2px rgba(16, 20, 24, 0.06)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "4px",
                      background: engineType === "creation" ? "#101418" : "#2346D9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      flexShrink: 0,
                      boxShadow: "0 1px 2px rgba(16, 20, 24, 0.06)",
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "11px",
                        fontWeight: 500,
                        color: "#6B7380",
                        mb: 0.2,
                      }}
                    >
                      {item.label}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#101418",
                        lineHeight: 1.2,
                      }}
                    >
                      {item.value}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "11px",
                        color: "#6b7280",
                        fontWeight: 500,
                      }}
                    >
                      {item.sub}
                    </Typography>
                  </Box>
                </Box>
              ))}

            </Box>
          </Box>
        </Container>
      </Box>

      <Container
        maxWidth={false}
        sx={{
          py: { xs: 2, md: 3 },
          px: { xs: 1.5, sm: 2, md: 3, lg: 3 },
          width: "100%",
          maxWidth: "100%",
        }}
      >
        {/* Subheader: Credit Usage */}
        {/* <UsageDisplay horizontal engineType={engineType as any} /> */}

        {/* Main Grid - 3 Columns */}
        <Box
          sx={{
            display: "flex",
            gap: { xs: 2, lg: 3 },
            flexDirection: { xs: "column", lg: "row" },
            alignItems: "flex-start",
          }}
        >
          {/* Column 1 - Prompt + Upload/Presets (with sub-columns) + Button */}
          <Box
            sx={{
              width: { xs: "100%", lg: "calc(50% - 12px)" },
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            {/* Sub-columns container (row-wise) */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: 2,
                width: "100%",
                flexWrap: "wrap",
              }}
            >
              {/* Sub-column 1: Prompt Section - Show ONLY if Creation Engine */}
              {engineType === "creation" && (
                <Box sx={{ flex: "1 1 48%", minWidth: "250px" }}>
                  <Typography
                    sx={{
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "#101418",
                      mb: 1.5,
                    }}
                  >
                    Creative brief
                  </Typography>
                  <Paper
                    elevation={0}
                    onClick={() => promptInputRef.current?.focus()}
                    sx={{
                      border: "1px solid rgba(35, 70, 217, 0.08)",
                      borderRadius: "6px",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      height: { xs: "220px", lg: "260px" },
                      cursor: "text",
                      bgcolor: "white",
                      boxShadow: "0 1px 2px rgba(16, 20, 24, 0.06)",
                    }}
                  >
                    <Box
                      sx={{
                        flex: 1,
                        p: { xs: 2, md: 3 },
                        position: "relative",
                        bgcolor: "white",
                      }}
                    >
                      {!prompt && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 24,
                            left: 24,
                            pointerEvents: "none",
                            zIndex: 1,
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "14px",
                              color: "#9ca3af",
                              mb: 0.5,
                              lineHeight: 1.5,
                            }}
                          >
                            Describe the creative you want...
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "14px",
                              color: "#9ca3af",
                              lineHeight: 1.5,
                            }}
                          >
                            e.g. &apos;Create a clean campaign visual with a warm palette&apos;
                          </Typography>
                        </Box>
                      )}
                      <TextField
                        multiline
                        fullWidth
                        value={prompt}
                        inputProps={{ "aria-label": "Creative brief" }}
                        onChange={(e) => setPrompt(e.target.value)}
                        inputRef={promptInputRef}
                        variant="standard"
                        InputProps={{
                          disableUnderline: true,
                        }}
                        sx={{
                          "& .MuiInputBase-root": {
                            height: "100%",
                            alignItems: "flex-start",
                            p: 0,
                          },
                          "& .MuiInputBase-input": {
                            fontSize: "14px",
                            color: "#374151",
                            lineHeight: 1.6,
                            "&::placeholder": {
                              opacity: 0,
                            },
                          },
                        }}
                      />
                    </Box>

                    {/* Bottom Info */}
                    <Box
                      sx={{
                        borderTop: "1px solid #f3f4f6",
                        px: 3,
                        py: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        bgcolor: "#f9fafb",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "12px",
                          color: "#6b7280",
                          fontWeight: 500,
                        }}
                      >
                        Describe the result you want to create
                      </Typography>
                      <EnhanceIcon
                        sx={{ fontSize: 18, color: "rgba(35, 70, 217, 0.5)" }}
                      />
                    </Box>
                  </Paper>
                </Box>
              )}

              {/* Sub-column 2: Upload & Options Section */}
              <Box
                sx={{
                  flex:
                    engineType === "transformation" ? "1 1 48%" : "1 1 100%",
                  minWidth: "250px",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "#101418",
                    mb: 1.5,
                  }}
                >
                  Source and sizes
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Stack spacing={3}>
                    {/* Uploaded Images Folder View */}
                    {uploadedImages.length > 0 && (
                      <Paper
                        elevation={0}
                        sx={{
                          border: "1px solid rgba(35, 70, 217, 0.08)",
                          borderRadius: "6px",
                          p: 2,
                          boxShadow: "0 1px 2px rgba(16, 20, 24, 0.06)",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "14px",
                            fontWeight: 600,
                            color: "#101418",
                            mb: 2,
                          }}
                        >
                          Uploaded Images
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            overflowX: "auto",
                            gap: 2,
                            pt: 1.5,
                            pb: 1.5,
                            "&::-webkit-scrollbar": {
                              height: "6px",
                            },
                            "&::-webkit-scrollbar-track": {
                              background: "rgba(0,0,0,0.02)",
                              borderRadius: "4px",
                            },
                            "&::-webkit-scrollbar-thumb": {
                              background: "rgba(35, 70, 217, 0.15)",
                              borderRadius: "4px",
                              "&:hover": {
                                background: "rgba(35, 70, 217, 0.3)",
                              },
                            },
                          }}
                        >
                          {uploadedImages.map((img) => (
                            <Box
                              key={img.id}
                              sx={{ minWidth: "140px", flexShrink: 0 }}
                            >
                              <Paper
                                elevation={0}
                                onClick={() => handleImageSelect(img)}
                                sx={{
                                  border:
                                    previewUrl === img.url
                                      ? "1.5px solid rgba(35, 70, 217, 1)"
                                      : "1px solid #e5e7eb",
                                  borderRadius: "4px",
                                  p: 1.5,
                                  cursor: "pointer",
                                  textAlign: "center",
                                  transition: "all 0.2s ease",
                                  position: "relative",
                                  "&:hover": {
                                    bgcolor: "#f9fafb",
                                    borderColor: "rgba(35, 70, 217, 0.4)",
                                    transform: "translateY(0)",
                                  },
                                }}
                              >
                                <IconButton
                                  onClick={(e) => handleRemoveImage(img.id, e)}
                                  sx={{
                                    position: "absolute",
                                    top: 4,
                                    right: 4,
                                    bgcolor: "rgba(0, 0, 0, 0.5)",
                                    color: "white",
                                    width: 24,
                                    height: 24,
                                    "&:hover": {
                                      bgcolor: "rgba(0, 0, 0, 0.7)",
                                    },
                                  }}
                                  size="small"
                                >
                                  <CloseIcon sx={{ fontSize: "16px" }} />
                                </IconButton>
                                <Box
                                  sx={{
                                    width: "100%",
                                    height: 80,
                                    mb: 1,
                                    borderRadius: "4px",
                                    overflow: "hidden",
                                    bgcolor: "#f3f4f6",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Box
                                    component="img"
                                    src={img.url}
                                    alt={img.name}
                                    sx={{
                                      maxWidth: "100%",
                                      maxHeight: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                </Box>
                                <Typography
                                  sx={{
                                    fontSize: "11px",
                                    color: "#6b7280",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {img.name}
                                </Typography>
                              </Paper>
                            </Box>
                          ))}
                        </Box>
                      </Paper>
                    )}

                    {/* Upload & Presets Box */}
                    <Paper
                      elevation={0}
                      sx={{
                        border: "1px solid rgba(35, 70, 217, 0.08)",

                        borderRadius: "6px",
                        p: 2.5,
                        boxShadow: "0 1px 2px rgba(16, 20, 24, 0.06)",
                      }}
                    >
                      {/* Upload Area */}
                      <Box
                        component="label"
                        sx={{
                          display: "block",
                          cursor: "pointer",
                          mb: 3,
                        }}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          style={{ display: "none" }}
                        />
                        <Box
                          sx={{
                            border: "2px dashed rgba(35, 70, 217, 0.25)",
                            borderRadius: "6px",
                            py: 5,
                            textAlign: "center",
                            transition: "all 0.2s ease",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 1,
                            "&:hover": {
                              borderColor: "rgba(35, 70, 217, 0.55)",
                              bgcolor: "rgba(35, 70, 217, 0.04)",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              width: 44,
                              height: 44,
                              borderRadius: "6px",
                              background: "#F4F6FE",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "rgba(35, 70, 217, 1)",
                              mb: 0.5,
                            }}
                          >
                            <CloudUploadIcon sx={{ fontSize: 22 }} />
                          </Box>
                          <Typography
                            sx={{
                              fontSize: "14px",
                              fontWeight: 600,
                              color: "#374151",
                            }}
                          >
                            {engineType === "creation"
                              ? "Click to upload image (Optional)"
                              : "Click to upload image"}
                          </Typography>
                          <Typography sx={{ fontSize: "12px", color: "#9ca3af" }}>
                            PNG, JPG or WEBP
                          </Typography>
                        </Box>
                      </Box>

                      {/* Presets Section */}
                      <Typography
                        sx={{
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "#101418",
                          mb: 1.5,
                        }}
                      >
                        Select Presets
                      </Typography>
                      <Box sx={{ mb: 3 }}>
                        <Typography
                          sx={{
                            fontSize: "11px",
                            fontWeight: 600,
                            color: "#4A5260",
                            mb: 1,
                          }}
                        >
                          Standard ratios
                        </Typography>
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, 1fr)",
                            gap: 1,
                            mb: 0,
                          }}
                        >
                          {presets
                            .map((preset) => {
                              const selected = selectedPresets.includes(preset.id);
                              return (
                                <Paper
                                  key={preset.id}
                                  elevation={0}
                                  component="button"
                                  type="button"
                                  aria-pressed={selected}
                                  onClick={() => handlePresetChange(preset.id)}
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.25,
                                    px: 1.5,
                                    py: 1.25,
                                    position: "relative",
                                    border: `1.5px solid ${selected ? "rgba(35, 70, 217, 0.55)" : "#e5e7eb"}`,
                                    bgcolor: selected ? "rgba(35, 70, 217, 0.06)" : "#fff",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    transition: "all 0.18s ease",
                                    "&:hover": {
                                      borderColor: "rgba(35, 70, 217, 0.4)",
                                      bgcolor: selected ? "rgba(35, 70, 217, 0.08)" : "#f6f7f9",
                                    },
                                  }}
                                >
                                  <RatioGlyph ratio={preset.ratio} color="#2346D9" selected={selected} />
                                  <Box sx={{ minWidth: 0 }}>
                                    <Typography
                                      sx={{
                                        fontSize: "13px",
                                        color: selected ? "rgba(35, 70, 217, 1)" : "#374151",
                                        fontWeight: selected ? 600 : 500,
                                        lineHeight: 1.3,
                                      }}
                                    >
                                      {preset.label}
                                    </Typography>
                                    <Typography className="spec-figure" sx={{ fontSize: "12px", color: "#6B7380" }}>
                                      {preset.ratio}
                                    </Typography>
                                  </Box>
                                  {selected && (
                                    <CheckCircleIcon
                                      sx={{
                                        position: "absolute",
                                        top: 6,
                                        right: 6,
                                        fontSize: 15,
                                        color: "rgba(35, 70, 217, 1)",
                                      }}
                                    />
                                  )}
                                </Paper>
                              );
                            })}
                        </Box>


                      </Box>
                    </Paper>
                  </Stack>
                </Box>
              </Box>
            </Box>

            {/* Main Action Button */}
            <Button
              fullWidth
              variant="contained"
              onClick={handleProcessImage}
              disabled={
                isProcessing ||
                (engineType === "transformation" &&
                  (!uploadedImage || selectedPresets.length === 0)) ||
                (engineType === "creation" && !prompt.trim())
              }
              sx={{
                py: 1.2,
                borderRadius: "4px",
                textTransform: "none",
                fontSize: "14px",
                fontWeight: 600,
                bgcolor: "rgba(35, 70, 217, 1)",
                boxShadow: "0 1px 2px rgba(16, 20, 24, 0.06)",
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "rgba(35, 70, 217, 0.9)",
                  transform: "translateY(0)",
                  boxShadow: "0 1px 2px rgba(16, 20, 24, 0.06)",
                },
                "&.Mui-disabled": {
                  background: "#f3f4f6",
                  color: "#9ca3af",
                },
                flex: "1 1 100%",
              }}
            >
              {isProcessing ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <CircularProgress size={20} color="inherit" />
                  Processing {selectedPresets.length} items...
                </Box>
              ) : (
                engineType === "creation" ? "Generate selected sizes" : "Recompose to selected sizes"
              )}
            </Button>
          </Box>

          {/* Column 2 - Image Preview */}
          <Box
            sx={{
              flex: 1,
              width: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1.5,
              }}
            >
              <Typography
                sx={{
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "#101418",
                }}
              >
                Outputs
              </Typography>
              {previewUrl && processedImages.length > 0 && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setShowOriginal(!showOriginal)}
                  sx={{
                    textTransform: "none",
                    fontSize: "13px",
                    fontWeight: 500,
                    borderColor: "#e5e7eb",
                    color: "#6b7280",
                    py: 0.5,
                    px: 1.5,
                    borderRadius: "4px",
                    "&:hover": {
                      borderColor: "rgba(35, 70, 217, 0.4)",
                      bgcolor: "rgba(35, 70, 217, 0.04)",
                      color: "rgba(35, 70, 217, 1)",
                    },
                  }}
                >
                  {showOriginal ? "View Results" : "View Original"}
                </Button>
              )}
            </Box>
            <Paper
              elevation={0}
              sx={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                p: { xs: 2, md: 3 },
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                justifyContent: "flex-start",
                height: { xs: "390px", md: "520px", lg: "590px" },
                overflowY: "auto",
                position: "relative",
                boxShadow: "0 1px 2px rgba(16, 20, 24, 0.06)",
                "&::-webkit-scrollbar": {
                  width: "0px",
                  display: "none",
                },
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {isProcessing && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    bgcolor: "rgba(255, 255, 255, 0.9)",
                    zIndex: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                  }}
                >
                  <CircularProgress
                    size={40}
                    thickness={4}
                    sx={{ color: "rgba(35, 70, 217, 1)" }}
                  />
                  <Typography
                    sx={{
                      color: "rgba(35, 70, 217, 1)",
                      fontWeight: 600,
                      fontSize: "13px",
                    }}
                  >
                    Neural Inference in progress...
                  </Typography>
                </Box>
              )}
              {processedImages.length > 0 && !showOriginal ? (
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 0,
                    overflow: "hidden",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: { xs: "13px", md: "14px" },
                      fontWeight: 600,
                      color: "#101418",
                      mb: 2,
                      flexShrink: 0,
                    }}
                  >
                    Processed Images ({processedImages.length})
                  </Typography>
                  <Box
                    sx={{
                      flex: 1,
                      overflowX: "auto",
                      overflowY: "hidden",
                      minHeight: 0,
                      pb: 2,
                      "&::-webkit-scrollbar": {
                        height: "8px",
                      },
                      "&::-webkit-scrollbar-track": {
                        background: "#f1f1f1",
                        borderRadius: "4px",
                      },
                      "&::-webkit-scrollbar-thumb": {
                        background: "#c7ccd5",
                        borderRadius: "4px",
                        "&:hover": {
                          background: "#6b7380",
                        },
                      },
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={3}
                      sx={{ minWidth: "max-content", height: "100%" }}
                    >
                      {processedImages.map((image) => (
                        <Paper
                          key={image.id}
                          elevation={0}
                          sx={{
                            border: "1px solid #e5e7eb",
                            borderRadius: "6px",
                            overflow: "hidden",
                            width: "340px",
                            flexShrink: 0,
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <Box
                            sx={{
                              bgcolor: "#f9fafb",
                              px: { xs: 1.5, md: 2 },
                              py: 1,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: { xs: "13px", md: "14px" },
                                fontWeight: 500,
                                color: "#101418",
                              }}
                            >
                              {image.preset}
                              <Typography
                                component="span"
                                sx={{
                                  fontSize: { xs: "13px", md: "14px" },
                                  color: "#9ca3af",
                                  ml: 1,
                                }}
                              >
                                ({image.ratio})
                              </Typography>
                            </Typography>
                            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                              <ComplianceBadge reportId={image.reportId} />
                              <Box sx={{ display: "flex", gap: 0.5 }}>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleOpenModal({
                                    url: image.url,
                                    preset: image.preset,
                                    ratio: image.ratio,
                                    reportId: image.reportId,
                                  })
                                }
                                sx={{
                                  p: 0.75,
                                  "&:hover": {
                                    bgcolor: "#e5e7eb",
                                  },
                                }}
                              >
                                <FullscreenIcon
                                  sx={{ fontSize: 18, color: "#6b7280" }}
                                />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleDownload(
                                    image.url,
                                    `${image.preset}-${image.ratio}.png`,
                                  )
                                }
                                sx={{
                                  p: 0.75,
                                  "&:hover": {
                                    bgcolor: "#e5e7eb",
                                  },
                                }}
                              >
                                <DownloadIcon
                                  sx={{ fontSize: 18, color: "#6b7280" }}
                                />
                              </IconButton>
                              </Box>
                            </Box>
                          </Box>
                          <Box
                            sx={{
                              p: { xs: 1.5, md: 2 },
                              width: "100%",
                              flex: 1,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              bgcolor: "#f8f9fa",
                              position: "relative",
                            }}
                          >
                            <Box
                              component="img"
                              src={image.url}
                              alt={image.preset}
                              onClick={() =>
                                handleOpenModal({
                                  url: image.url,
                                  preset: image.preset,
                                  ratio: image.ratio,
                                  reportId: image.reportId,
                                })
                              }
                              sx={{
                                maxWidth: "100%",
                                maxHeight: "380px",
                                width: "auto",
                                height: "auto",
                                borderRadius: "4px",
                                objectFit: "contain",
                                display: "block",
                                cursor: "pointer",
                                transition: "transform 0.2s",
                                "&:hover": {
                                  transform: "scale(1.02)",
                                },
                              }}
                            />
                          </Box>
                        </Paper>
                      ))}
                    </Stack>
                  </Box>
                </Box>
              ) : previewUrl ? (
                <Box
                  sx={{
                    textAlign: "center",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Box
                    component="img"
                    src={previewUrl}
                    alt="Preview"
                    sx={{
                      maxWidth: "100%",
                      maxHeight: { xs: "300px", md: "500px" },
                      width: "auto",
                      height: "auto",
                      objectFit: "contain",
                      borderRadius: "4px",
                      mb: 2,
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: { xs: "13px", md: "14px" },
                      fontWeight: 600,
                      color: "#374151",
                    }}
                  >
                    Original image ready
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: "12px", md: "13px" },
                      color: "#9ca3af",
                      mt: 0.25,
                    }}
                  >
                    Select presets on the left to start processing.
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    minHeight: 320,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 3,
                    bgcolor: "#F6F7F9",
                    borderRadius: "4px",
                    position: "relative",
                    p: 3,
                  }}
                >
                  {/* Spec-sheet rulers along the top and left edges, not a full grid */}
                  <Box aria-hidden sx={{ position: "absolute", left: 0, right: 0, top: 0, height: 8, borderBottom: "1px solid #E3E6EB", backgroundImage: "repeating-linear-gradient(90deg,#C7CCD5 0 1px,transparent 1px 12px),repeating-linear-gradient(90deg,#9AA1AC 0 1px,transparent 1px 60px)", backgroundSize: "100% 4px, 100% 8px", backgroundRepeat: "no-repeat", backgroundPosition: "0 100%, 0 100%" }} />
                  <Box aria-hidden sx={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 8, borderRight: "1px solid #E3E6EB", backgroundImage: "repeating-linear-gradient(180deg,#C7CCD5 0 1px,transparent 1px 12px),repeating-linear-gradient(180deg,#9AA1AC 0 1px,transparent 1px 60px)", backgroundSize: "4px 100%, 8px 100%", backgroundRepeat: "no-repeat", backgroundPosition: "100% 0, 100% 0" }} />
                  {/* The outputs, drawn as a spec sheet before they exist */}
                  <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "center", gap: 4 }}>
                    {(selectedPresets.length > 0
                      ? selectedPresets.map((id) => presets.find((p) => p.id === id)).filter(Boolean).map((p) => ({ ratio: p!.ratio, label: specLabel(p!.ratio), ghost: false }))
                      : [{ ratio: "16:9", label: "16:9", ghost: true }, { ratio: "9:16", label: "9:16", ghost: true }, { ratio: "1:1", label: "1:1", ghost: true }]
                    ).map((f, i) => (
                      <SpecFrame key={`${f.ratio}-${i}`} ratio={f.ratio} label={f.label} ghost={f.ghost} />
                    ))}
                  </Box>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#101418" }}>
                      {selectedPresets.length > 0 ? "Sizes ready to recompose" : "No outputs yet"}
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: "#4A5260", maxWidth: 340, mt: 0.5 }}>
                      {selectedPresets.length > 0
                        ? "These frames illustrate your selected ratios. Generated outputs use native preset sizes; review the actual image and its report before use."
                        : engineType === "creation"
                          ? "Add edit instructions and choose sizes. Outlines above are examples."
                          : "Upload the approved artwork and choose sizes. Outlines above are examples."}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Paper>
          </Box>
        </Box>
      </Container>

      {/* Full Image Preview Modal */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Box
          sx={{
            position: "relative",
            bgcolor: "white",
            borderRadius: "6px",
            p: 3,
            maxWidth: "90vw",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            outline: "none",
          }}
        >
          {/* Modal Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#101418",
              }}
            >
              {selectedImage?.preset} ({selectedImage?.ratio})
            </Typography>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <ComplianceBadge reportId={selectedImage?.reportId} />
              <IconButton
                onClick={() =>
                  selectedImage &&
                  handleDownload(
                    selectedImage.url,
                    `${selectedImage.preset}-${selectedImage.ratio}.png`,
                  )
                }
                sx={{
                  bgcolor: "#f3f4f6",
                  "&:hover": {
                    bgcolor: "#e5e7eb",
                  },
                }}
              >
                <DownloadIcon sx={{ fontSize: 20, color: "#374151" }} />
              </IconButton>
              <IconButton
                onClick={handleCloseModal}
                sx={{
                  bgcolor: "#f3f4f6",
                  "&:hover": {
                    bgcolor: "#e5e7eb",
                  },
                }}
              >
                <CloseIcon sx={{ fontSize: 20, color: "#374151" }} />
              </IconButton>
            </Box>
          </Box>

          {/* Modal Image */}
          {selectedImage && (
            <Box
              sx={{
                width: "100%",
                height: "auto",
                maxHeight: "calc(90vh - 120px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "auto",
              }}
            >
              <Box
                component="img"
                src={selectedImage.url}
                alt={selectedImage.preset}
                sx={{
                  maxWidth: "100%",
                  maxHeight: "calc(90vh - 120px)",
                  width: "auto",
                  height: "auto",
                  objectFit: "contain",
                  borderRadius: "4px",
                }}
              />
            </Box>
          )}
        </Box>
      </Modal>

      {/* Credit Limit Exceeded Modal */}
      <Modal
        open={isLimitExceeded}
        onClose={() => setIsLimitExceeded(false)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Paper
          sx={{
            width: "100%",
            maxWidth: 450,
            borderRadius: "8px",
            p: 4,
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            outline: "none",
            boxShadow: "0 1px 2px rgba(16, 20, 24, 0.06)",
          }}
        >
          {/* Top Gradient Bar */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "8px",
              background: "#2346D9",
            }}
          />

          <Box
            sx={{
              mb: 3,
              display: "inline-flex",
              p: 2,
              bgcolor: "rgba(35, 70, 217, 0.06)",
              borderRadius: "6px",
            }}
          >
            <EngineeringIcon
              sx={{ fontSize: 32, color: "rgba(35, 70, 217, 1)" }}
            />
          </Box>

          <Typography
            sx={{ fontSize: "18px", fontWeight: 600, color: "#101418", mb: 1 }}
          >
            Infrastructure Upgrade Needed
          </Typography>

          <Typography
            variant="body2"
            sx={{ color: "#6b7280", mb: 4, lineHeight: 1.6 }}
          >
            Provision additional credits to continue high-density batch
            operations. Your current quota has been reached.
          </Typography>

          <Stack spacing={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                setIsLimitExceeded(false);
                window.location.href = "/pricing";
              }}
              sx={{
                py: 1.2,
                borderRadius: "4px",
                bgcolor: "rgba(35, 70, 217, 1)",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "14px",
                boxShadow: "0 1px 2px rgba(16, 20, 24, 0.06)",
                "&:hover": {
                  bgcolor: "rgba(35, 70, 217, 0.9)",
                },
              }}
            >
              Provision Credits
            </Button>

            <Button
              fullWidth
              variant="text"
              onClick={() => setIsLimitExceeded(false)}
              sx={{
                py: 1.5,
                borderRadius: "6px",
                textTransform: "none",
                color: "#6b7280",
                fontWeight: 600,
                "&:hover": { bgcolor: "#f9fafb" },
              }}
            >
              Maybe later
            </Button>
          </Stack>

          <Typography
            variant="caption"
            sx={{ display: "block", mt: 3, color: "#9ca3af", fontWeight: 500 }}
          >
            Questions?{" "}
            <Box
              component="span"
              sx={{ color: "rgba(35, 70, 217, 1)", cursor: "pointer" }}
            >
              Talk to support
            </Box>
          </Typography>
        </Paper>
      </Modal>
      {/* Preset Limit Modal */}
      <Modal open={showPresetLimit}>
        <Paper
          elevation={24}
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: 400 },
            borderRadius: "8px",
            p: 4,
            textAlign: "center",
            outline: "none",
            bgcolor: "white",
            overflow: "hidden",
          }}
        >
          {/* Warning icon */}
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "6px",
              bgcolor: "rgba(234, 88, 12, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
            }}
          >
            <WarningAmberIcon sx={{ fontSize: 28, color: "rgba(234, 88, 12, 1)" }} />
          </Box>

          <Typography
            sx={{
              fontSize: "18px",
              fontWeight: 500,
              color: "#101418",
              mb: 1,
            }}
          >
            Selection Limit Reached
          </Typography>
          <Typography
            sx={{
              fontSize: "14px",
              color: "#6b7280",
              mb: 3,
              lineHeight: 1.6,
            }}
          >
            You can select up to <strong>{MAX_PRESETS} ratios</strong> at a
            time. Deselect one first to choose a different ratio.
          </Typography>

          <Button
            onClick={() => setShowPresetLimit(false)}
            fullWidth
            sx={{
              py: 1.5,
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: 600,
              textTransform: "none",
              background:
                "#2346D9",
              color: "white",
              boxShadow: "0 1px 2px rgba(16, 20, 24, 0.06)",
              "&:hover": {
                background:
                  "#1B38B4",
              },
            }}
          >
            Got it
          </Button>
        </Paper>
      </Modal>
    </Box>
  );
};

export default ImageProcessor;
