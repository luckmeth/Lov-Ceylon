import { useEffect } from "react";
import { useSiteSettings } from "./use-site-settings";

export function useThemeApplicator() {
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    if (!settings) return;
    const root = document.documentElement;

    // Resolve values — fall back to brand defaults when DB value is empty/unset
    const espresso = settings.color_background || "#0e0804";
    const gold     = settings.color_primary    || "#C9A96E";
    const cream    = settings.color_text       || "#F5ECD7";
    const bronze   = settings.color_accent     || "#8B6B3D";

    // ── Two-tone backgrounds ──────────────────────────────────────────────────
    // Darkest sections (hero, about, packages, footer) use --espresso
    root.style.setProperty("--espresso", espresso);
    // Lighter sections (work, services, contact) auto-derive ~22% lighter
    root.style.setProperty("--background", `color-mix(in oklch, ${espresso}, white 22%)`);
    // Cards and popovers follow the dark tone
    root.style.setProperty("--card",    espresso);
    root.style.setProperty("--popover", espresso);

    // ── Brand accent ─────────────────────────────────────────────────────────
    root.style.setProperty("--gold",    gold);
    root.style.setProperty("--primary", gold);
    root.style.setProperty("--ring",    gold);
    root.style.setProperty("--accent",  gold);  // shadcn accent token also follows gold

    // ── Text ─────────────────────────────────────────────────────────────────
    root.style.setProperty("--cream",      cream);
    root.style.setProperty("--foreground", cream);
    root.style.setProperty("--card-foreground",    cream);
    root.style.setProperty("--popover-foreground", cream);

    // ── Secondary accent (bronze) ─────────────────────────────────────────────
    root.style.setProperty("--bronze",            bronze);
    root.style.setProperty("--muted-foreground",  bronze);  // subtle text uses bronze

    // ── Fonts ─────────────────────────────────────────────────────────────────
    const heading = settings.font_heading ?? "Cormorant Garamond";
    const body    = settings.font_body    ?? "DM Sans";

    root.style.setProperty("--font-display", `"${heading}", serif`);
    root.style.setProperty("--font-body",    `"${body}", sans-serif`);

    document.getElementById("gf-custom")?.remove();
    const link = document.createElement("link");
    link.id  = "gf-custom";
    link.rel = "stylesheet";
    const families = [
      `family=${encodeURIComponent(heading)}:ital,wght@0,400;0,500;0,600;1,400`,
      `family=${encodeURIComponent(body)}:wght@300;400;500`,
    ].join("&");
    link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
    document.head.appendChild(link);
  }, [settings]);
}
