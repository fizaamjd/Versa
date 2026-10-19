// Names and native output sizes mirror backend/main.py's preset parser.
export const IMAGE_PRESETS = [
  { id: "square", label: "Square", ratio: "1:1", w: 1024, h: 1024 },
  { id: "story", label: "Story/Reel", ratio: "9:16", w: 768, h: 1344 },
  { id: "landscape", label: "Landscape", ratio: "16:9", w: 1344, h: 768 },
  { id: "portrait", label: "Portrait", ratio: "3:4", w: 896, h: 1152 },
  { id: "ultrawide", label: "Ultrawide", ratio: "21:9", w: 1536, h: 640 },
] as const;
