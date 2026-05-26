import { useEffect } from "react";
import { useSiteSettings } from "./use-site-settings";

export function useThemeApplicator() {
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    if (!settings) return;
    const root = document.documentElement;

    // Colors — always apply; use brand defaults when DB value is empty/unset
    const gold   = settings.color_primary    || "#C9A96E";
    const bg     = settings.color_background || "#0e0804";
    const cream  = settings.color_text       || "#F5ECD7";
    const bronze = settings.color_accent     || "#8B6B3D";

    root.style.setProperty("--gold",       gold);
    root.style.setProperty("--primary",    gold);
    root.style.setProperty("--background", bg);
    root.style.setProperty("--espresso",   bg);
    root.style.setProperty("--cream",      cream);
    root.style.setProperty("--foreground", cream);
    root.style.setProperty("--bronze",     bronze);

    if (settings.color_card_bg) {
      root.style.setProperty("--card",     settings.color_card_bg);
      root.style.setProperty("--popover",  settings.color_card_bg);
    }

    // Fonts — override CSS variable + inject Google Fonts link tag
    const heading = settings.font_heading ?? "Cormorant Garamond";
    const body = settings.font_body ?? "DM Sans";

    root.style.setProperty("--font-display", `"${heading}", serif`);
    root.style.setProperty("--font-body", `"${body}", sans-serif`);

    // Remove previous injected font link to avoid stacking requests
    document.getElementById("gf-custom")?.remove();

    const link = document.createElement("link");
    link.id = "gf-custom";
    link.rel = "stylesheet";
    const families = [
      `family=${encodeURIComponent(heading)}:ital,wght@0,400;0,500;0,600;1,400`,
      `family=${encodeURIComponent(body)}:wght@300;400;500`,
    ].join("&");
    link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
    document.head.appendChild(link);
  }, [settings]);
}
