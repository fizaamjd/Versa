import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import ThemeRegistry from "./components/ThemeRegistry";
import ToastProvider from "./components/ToastProvider";

const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  axes: ["wdth"],
  variable: "--font-archivo",
});

const DIRECTION_CONTRACT = `<!--
THESIS: Versa speaks the media owner's spec language: every output is a dimensioned drawing that already passes. It refuses the AI-tool default of gradients, sparkles and glowing cards.
OWN-WORLD: Paper white and sheet gray, ink #101418, one spec blue #2346D9 for action and selection, hatch yellow only for safe zones and warnings. Archivo throughout, condensed tabular figures for every measurement. Hairline rules, 2-6px corners, dimension ticks, no glows.
STORY: An agency producer sees each frame measured and checked, trusts it, and downloads the whole set.
FIRST VIEWPORT: App: sidebar with the Versa mark; workspace shows source and output frames with dimension callouts and compliance marks; spec-blue primary action at the panel foot. Landing keeps its sections, reskinned.
FORM: Media Spec Sheet, rank 1 of 7, seed 330c6479.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
-->`;

export const metadata: Metadata = {
  title: "Versa",
  description: "Every size of your campaign from one creative, recomposed layer by layer and checked against each screen's spec.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={archivo.variable} suppressHydrationWarning>
        <template dangerouslySetInnerHTML={{ __html: DIRECTION_CONTRACT }} />
        <ThemeRegistry>
          <AuthProvider>
            {children}
            <ToastProvider />
          </AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
