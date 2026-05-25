import { useEffect } from "react";
import { useSiteSettings } from "./use-site-settings";

export function useThemeApplicator() {
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    if (!settings) return;
    const root = document.documentElement;

    // Colors — override the hardcoded CSS variables from styles.css
    if (settings.color_primary) {
      root.style.setProperty("--gold", settings.color_primary);
      root.style.setProperty("--primary", settings.color_primary);
    }
    if (settings.color_background) {
      root.style.setProperty("--background", settings.color_background);
      root.style.setProperty("--espresso", settings.color_background);
    }
    if (settings.color_text) {
      root.style.setProperty("--cream", settings.color_text);
      root.style.setProperty("--foreground", settings.color_text);
    }
    if (settings.color_accent) {
      root.style.setProperty("--bronze", settings.color_accent);
    }
    if (settings.color_card_bg) {
      root.style.setProperty("--card", settings.color_card_bg);
      root.style.setProperty("--popover", settings.color_card_bg);
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
