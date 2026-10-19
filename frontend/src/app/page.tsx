"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, ImagePlus, LayoutPanelTop, FolderClock } from "lucide-react";
import { VersaLogo } from "@/components/brand/VersaLogo";
import { IMAGE_PRESETS } from "@/lib/presets";
import styles from "./landing.module.css";

const formats = ["square", "landscape", "story", "portrait", "ultrawide"];
const signup = "/auth?tab=signup&redirect=/pricing";

function Formats() {
  const [selected, setSelected] = useState("landscape");
  return (
    <div className={styles.formats} role="radiogroup" aria-label="Supported image formats">
      {formats.map((id, index) => {
        const preset = IMAGE_PRESETS.find((item) => item.id === id)!;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={selected === id}
            tabIndex={selected === id ? 0 : -1}
            className={selected === id ? styles.formatSelected : styles.format}
            onClick={() => setSelected(id)}
            onKeyDown={(event) => {
              if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
              event.preventDefault();
              const next = event.key === "Home" ? 0 : event.key === "End" ? formats.length - 1 : (index + (["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1) + formats.length) % formats.length;
              setSelected(formats[next]);
              event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("button")[next]?.focus();
            }}
          >
            <div className={styles.formatDrawing} aria-hidden="true">
              <span style={{ width: `${preset.w * Math.min(76 / preset.w, 68 / preset.h)}px`, height: `${preset.h * Math.min(76 / preset.w, 68 / preset.h)}px` }} />
            </div>
            <div className={styles.formatName}><strong>{preset.id === "story" ? "Story" : preset.label}</strong>{selected === id && <Check size={14} aria-hidden="true" />}</div>
            <span className={styles.formatSize}>{preset.ratio}<span>{preset.w} × {preset.h}</span></span>
          </button>
        );
      })}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <nav className={styles.nav} aria-label="Main navigation">
          <Link href="/" aria-label="Versa home"><VersaLogo height={25} /></Link>
          <div className={styles.navLinks}>
            <a href="#workspace">Workspace</a>
            <a href="#formats">Formats</a>
            <Link href="/pricing">Pricing</Link>
          </div>
          <div className={styles.navActions}>
            <Link href="/auth?tab=login" className={styles.signin}>Sign in</Link>
            <Link href={signup} className={styles.primary}>Get started<ArrowUpRight size={15} aria-hidden="true" /></Link>
          </div>
        </nav>
      </header>

      <main>
        <section className={`${styles.container} ${styles.hero}`} aria-labelledby="hero-title">
          <div className={styles.heroTop}>
            <h1 id="hero-title">One creative.<br />More possibilities.</h1>
            <div className={styles.heroCopy}>
              <p>Adapt images for five campaign formats. Create new visuals, review the results, and keep your team’s work in one place.</p>
              <div className={styles.actions}>
                <Link href={signup} className={styles.primary}>Open your workspace<ArrowUpRight size={16} aria-hidden="true" /></Link>
                <Link href="/pricing" className={styles.textLink}>Explore plans</Link>
              </div>
            </div>
          </div>
          <figure className={styles.productPreview} id="workspace">
            <div className={styles.previewBar}><span>Transformation Engine</span><span>Workspace preview · sample account</span></div>
            <div className={styles.previewImage}>
              <Image src="/product/workspace-bc40b1cc.jpg" alt="The Versa workspace with an image upload area, five format presets and a Landscape selection." width={1440} height={1100} priority sizes="(max-width: 760px) 100vw, 1120px" />
            </div>
            <figcaption>Upload an image, choose your formats, then review the output.</figcaption>
          </figure>
        </section>

        <section className={`${styles.container} ${styles.section}`} id="formats" aria-labelledby="formats-title">
          <div className={styles.sectionHead}>
            <h2 id="formats-title">The formats your campaign needs.</h2>
            <p>Five standard presets, each with a defined output size.</p>
          </div>
          <Formats />
          <p className={styles.caption}>Preset names describe the format; pixel dimensions show the native output size.</p>
        </section>

        <section className={styles.workflowSection} aria-labelledby="workflow-title">
          <div className={`${styles.container} ${styles.workflow}`}>
            <div className={styles.workflowIntro}>
              <h2 id="workflow-title">A clear path from<br />source to output.</h2>
              <p>Spend less time moving between tools. Transformation, creation and review share the same workspace.</p>
              <Link href={signup} className={styles.textLink}>Try the workflow<ArrowUpRight size={15} aria-hidden="true" /></Link>
            </div>
            <div className={styles.workflowList}>
              <article><ImagePlus size={21} aria-hidden="true" /><div><h3>Start with your creative</h3><p>Upload an image to transform, or use the Creation Engine to begin with a prompt.</p></div></article>
              <article><LayoutPanelTop size={21} aria-hidden="true" /><div><h3>Choose the right format</h3><p>Select square, landscape, story, portrait or ultrawide. Add instructions for the result you need.</p></div></article>
              <article><FolderClock size={21} aria-hidden="true" /><div><h3>Review, export and return</h3><p>Check the image and its compliance report before download. Revisit previous work in your archive.</p></div></article>
            </div>
          </div>
        </section>

        <section className={`${styles.container} ${styles.section} ${styles.details}`} aria-label="Review and teamwork">
          <article>
            <h2>Review before you publish.</h2>
            <p>Technical checks, visual heuristics and model-assisted content analysis give you more context for each output. The final decision stays with you.</p>
            <div className={styles.checks}><span><i className={styles.pass} />Pass</span><span><i className={styles.warn} />Warn</span><span><i className={styles.fail} />Fail</span></div>
            <p className={styles.caption}>AI judgments can be wrong. Review generated content before use.</p>
          </article>
          <article>
            <h2>Keep the team in the loop.</h2>
            <p>Organizations, user roles, shared plans and credit tracking support the people around the creative. Continue the workflow on web or in the mobile app.</p>
            <ul className={styles.teamFeatures}><li>Organizations & roles</li><li>Shared credits & billing</li><li>History & reports</li></ul>
          </article>
        </section>

        <section className={styles.close} aria-labelledby="close-title">
          <div className={styles.container}><div><h2 id="close-title">Your next creative starts here.</h2><p>One workspace for creating, adapting and reviewing.</p></div><Link href={signup} className={styles.primary}>Get started<ArrowUpRight size={16} aria-hidden="true" /></Link></div>
        </section>
      </main>
      <footer className={`${styles.container} ${styles.footer}`}><VersaLogo height={22} /><span>Creative workflows, in focus.</span><Link href="/pricing">Plans & pricing</Link></footer>
    </div>
  );
}
