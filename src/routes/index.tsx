import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
  Aperture,
  ArrowDown,
  ArrowUpRight,
  Calendar,
  Camera,
  ChevronLeft,
  ChevronRight,
  Facebook,
  Heart,
  Instagram,
  Link2,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Play,
  Sparkles,
  Star,
  Youtube,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  categoriesQuery,
  heroSlidesQuery,
  photosQuery,
  publicPackagesQuery,
  publicTestimonialsQuery,
  socialLinksQuery,
  submitContactForm,
} from "@/lib/queries";
import type { Photo as DbPhoto, WorkCategory } from "@/lib/types";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { useSeoMeta } from "@/hooks/use-seo-meta";
import { useThemeApplicator } from "@/hooks/use-theme-applicator";

import portrait from "@/assets/portrait.png";
import uPortraitBw from "@/assets/work-portrait-bw.jpg";
import uHandsTattoo from "@/assets/work-hands-tattoo.jpg";
import uSaree from "@/assets/work-saree-portrait.jpg";
import uWeddingCouple from "@/assets/work-wedding-couple.jpg";
import uCoupleCar from "@/assets/work-couple-car.png";

export const Route = createFileRoute("/")({ component: Index });
export default Index;

// ─── Shared framer-motion variants ─────────────────────────────────────────
const cardContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};
const cardItem: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65 } },
};

const PHOTOS_PREVIEW_LIMIT = 10;

const services = [
  {
    icon: Heart,
    name: "Wedding Narratives",
    desc: "Emotion-first frames shaped around intimacy, gestures, and atmosphere instead of staged perfection.",
    price: "Ceremony / couple / detail work",
  },
  {
    icon: Camera,
    name: "Portrait Language",
    desc: "Portraits built on mood, posture, texture, and light so every image carries personality.",
    price: "Editorial / personal / studio",
  },
  {
    icon: Calendar,
    name: "Live Energy",
    desc: "Fast-moving scenes captured with rhythm and clarity while keeping the emotional pulse of the room.",
    price: "Events / performances / moments",
  },
];

const processSteps = [
  ["01", "See", "Every portfolio starts with observation: expression, stillness, space, and the exact moment light becomes part of the story."],
  ["02", "Shape", "The frame is directed with restraint so the subject still feels real while the image feels intentional and cinematic."],
  ["03", "Refine", "Color, contrast, and sequencing are polished so the final body of work feels cohesive, authored, and memorable."],
];

function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );

    const observe = (root: Element | Document) => {
      (root instanceof Element ? root.querySelectorAll(".reveal") : root.querySelectorAll(".reveal"))
        .forEach((el) => io.observe(el));
    };

    observe(document);

    // Watch for .reveal elements added after initial render (e.g. async data loading)
    const mo = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== Node.ELEMENT_NODE) return;
          const el = node as Element;
          if (el.classList?.contains("reveal")) io.observe(el);
          el.querySelectorAll?.(".reveal").forEach((child) => io.observe(child));
        });
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
}

function useLoader() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setProgress((value) => {
        if (value >= 100) return 100;
        const next = Math.min(100, value + (value < 60 ? 7 : value < 85 ? 4 : 2));
        return next;
      });
    }, 70);

    const finish = window.setTimeout(() => {
      window.clearInterval(timer);
      setProgress(100);
      window.setTimeout(() => setVisible(false), 650);
    }, 2100);

    return () => {
      window.clearInterval(timer);
      window.clearTimeout(finish);
    };
  }, []);

  return { progress, visible };
}

function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let rx = 0;
    let ry = 0;
    let x = 0;
    let y = 0;
    let raf = 0;

    const move = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (dot.current) {
        dot.current.style.transform = `translate3d(${x - 4}px, ${y - 4}px, 0)`;
      }
    };

    const tick = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      if (ring.current) {
        ring.current.style.transform = `translate3d(${rx - 18}px, ${ry - 18}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", move);
    tick();

    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div
        ref={dot}
        className="pointer-events-none fixed left-0 top-0 z-[100] hidden h-2 w-2 rounded-full md:block"
        style={{ background: "var(--gold)" }}
        aria-hidden
      />
      <div
        ref={ring}
        className="pointer-events-none fixed left-0 top-0 z-[99] hidden h-9 w-9 rounded-full border md:block"
        style={{ borderColor: "color-mix(in oklab, var(--gold) 60%, transparent)" }}
        aria-hidden
      />
    </>
  );
}

function Loader({ progress, visible, siteName }: { progress: number; visible: boolean; siteName?: string }) {
  const messages = useMemo(
    () => ["Calibrating light", "Framing emotion", "Building the experience"],
    [],
  );
  const step = Math.min(messages.length - 1, Math.floor(progress / 34));

  return (
    <div
      className={`fixed inset-0 z-[300] overflow-hidden bg-[var(--espresso)] transition-all duration-700 ${
        visible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!visible}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(234,196,121,0.16),transparent_38%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.1),transparent_22%),linear-gradient(180deg,rgba(14,9,5,0.4),rgba(14,9,5,0.96))]" />
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute left-1/2 top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/10 blur-3xl" />

      <div className="relative flex h-full flex-col justify-between px-6 py-8 md:px-10 md:py-10">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.45em] text-cream/55">
          <span className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-gold pulse-soft" />
            {siteName ?? "Dopamine"} loading
          </span>
          <span>Sri Lanka</span>
        </div>

        <div className="mx-auto flex max-w-4xl flex-1 flex-col items-center justify-center text-center">
          <div className="loader-aperture mb-10 flex h-28 w-28 items-center justify-center rounded-full border border-gold/30">
            <Aperture className="h-12 w-12 text-gold" strokeWidth={1} />
          </div>
          <p className="text-[10px] uppercase tracking-[0.6em] text-gold/80">Visual story in motion</p>
          <h1 className="mt-6 max-w-3xl font-display text-5xl leading-none text-cream md:text-7xl lg:text-[7.5rem]">
            {siteName ?? "Dopamine"},
            <br />
            <span className="italic text-gold/95">First impression matters most...</span>
          </h1>
          <p className="mt-8 text-sm tracking-[0.28em] uppercase text-cream/55">{messages[step]}</p>
        </div>

        <div className="mx-auto w-full max-w-5xl">
          <div className="flex items-end justify-between text-[10px] uppercase tracking-[0.35em] text-cream/55">
            <span>Loading portfolio experience</span>
            <span>{String(progress).padStart(2, "0")}%</span>
          </div>
          <div className="mt-3 h-[2px] overflow-hidden bg-cream/10">
            <div
              className="h-full bg-[linear-gradient(90deg,var(--gold),#fff0c7,var(--gold))] transition-[width] duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Nav() {
  const { data: settings } = useSiteSettings();
  const [scrolled, setScrolled] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const links = [
    ["About", "#about"],
    ["Work", "#work"],
    ["Story", "#story"],
    ["Strengths", "#services"],
    ["Packages", "#packages"],
    ["Contact", "#contact"],
  ];

  const siteName = settings?.site_name ?? "Dopamine";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled ? "border-b border-border bg-[var(--espresso)]/90 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a href="#top" className="group flex items-center gap-3 text-cream drop-shadow-[0_1px_8px_rgba(0,0,0,0.7)]">
            {settings?.logo_url && !logoError ? (
              <img
                src={settings.logo_url}
                alt={siteName}
                className="h-8 w-auto object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <>
                <Aperture className="h-5 w-5 text-gold transition-transform duration-700 group-hover:rotate-90" strokeWidth={1.4} />
                <span className="font-display text-2xl tracking-wide">{siteName}</span>
              </>
            )}
          </a>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {links.map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="story-link text-[11px] uppercase tracking-[0.34em] text-cream/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)] transition-colors hover:text-gold"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#contact"
              className="hidden border border-gold/60 bg-[rgba(14,8,4,0.35)] px-4 py-2 text-[10px] uppercase tracking-[0.32em] text-gold backdrop-blur-sm transition-all hover:bg-gold hover:text-[var(--espresso)] md:inline-flex"
            >
              Contact
            </a>
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-cream backdrop-blur-sm transition-colors hover:border-gold hover:text-gold md:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile full-screen overlay menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed inset-0 z-[200] flex flex-col bg-[var(--espresso)] px-8 py-10 md:hidden"
          >
            {/* Close + logo row */}
            <div className="flex items-center justify-between">
              <a
                href="#top"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 text-cream"
              >
                <Aperture className="h-5 w-5 text-gold" strokeWidth={1.4} />
                <span className="font-display text-xl tracking-wide">{siteName}</span>
              </a>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-cream"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="mt-14 flex flex-col gap-2">
              {links.map(([label, href], i) => (
                <motion.a
                  key={label}
                  href={href}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 + i * 0.06, duration: 0.4 }}
                  onClick={() => setMobileOpen(false)}
                  className="group flex items-center justify-between border-b border-white/8 py-5"
                >
                  <span className="font-display text-4xl text-cream transition-colors group-hover:text-gold">{label}</span>
                  <ArrowUpRight className="h-5 w-5 text-gold/50 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-gold" />
                </motion.a>
              ))}
            </nav>

            {/* Bottom CTA */}
            <div className="mt-auto">
              <a
                href="#contact"
                onClick={() => setMobileOpen(false)}
                className="block w-full bg-gold py-4 text-center text-[11px] uppercase tracking-[0.32em] text-[var(--espresso)]"
              >
                Get in touch
              </a>
              <p className="mt-6 text-center text-[10px] uppercase tracking-[0.4em] text-cream/30">{siteName} · Sri Lanka</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const WHATSAPP_NUMBER = "94716694353";

function Hero() {
  const { data: settings } = useSiteSettings();
  const { data: slides = [] } = useQuery(heroSlidesQuery());
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const siteName = settings?.site_name ?? "Dopamine";

  // Build slide image list — fall back to settings background if no DB slides
  const bgImages: string[] = slides.length > 0
    ? slides.map((s) => s.image_url)
    : [settings?.hero_background_url ?? uCoupleCar];

  // Auto-advance
  useEffect(() => {
    if (bgImages.length <= 1 || paused) return;
    timerRef.current = setInterval(() => setCurrent((i) => (i + 1) % bgImages.length), 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [bgImages.length, paused, current]);

  const goTo = (i: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCurrent(i);
  };

  const bookMsg = encodeURIComponent(
    `Hi ${siteName}! I found your portfolio and I'd like to book a photography session. Could you please share available dates, packages, and pricing? Thank you!`,
  );
  const waMsg = encodeURIComponent(
    `Hi ${siteName}! I'm interested in your photography services. Could you share more details about packages and availability?`,
  );

  return (
    <section
      id="top"
      className="relative min-h-screen overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides — crossfade */}
      {bgImages.map((url, i) => (
        <div
          key={url}
          className={`absolute inset-0 transition-opacity duration-[1200ms] ease-in-out ${i === current ? "opacity-100" : "opacity-0"}`}
        >
          <div
            className={`absolute inset-0 bg-cover bg-center ${i === current ? "ken-burns" : ""}`}
            style={{ backgroundImage: `url(${url})` }}
          />
        </div>
      ))}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,8,4,0.45)_0%,rgba(14,8,4,0.12)_25%,rgba(14,8,4,0.12)_60%,rgba(14,8,4,0.68)_82%,rgba(14,8,4,0.95)_100%)]" />

      {/* Frame border */}
      <div className="pointer-events-none absolute inset-x-4 bottom-4 top-22 z-[1] border border-[var(--bronze)]/55 md:inset-x-6 md:bottom-6 md:top-24 lg:inset-x-8 lg:bottom-8 lg:top-26" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-between px-6 pb-14 pt-24 md:pb-20">

        {/* Center block — logo + heading, floating over photo */}
        <div className="relative flex flex-1 flex-col items-center justify-center gap-5 text-center">
          {/* Soft radial vignette — not a box, just darkens behind text */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_65%_at_50%_50%,rgba(14,8,4,0.55)_0%,transparent_100%)]" />

          {/* Logo mark */}
          <div className="relative flex flex-col items-center gap-2">
            {settings?.logo_url ? (
              <img src={settings.logo_url} alt={siteName} className="h-14 w-auto object-contain drop-shadow-[0_2px_16px_rgba(0,0,0,0.8)]" />
            ) : (
              <>
                <Aperture className="h-12 w-12 text-gold" strokeWidth={1.2} style={{ filter: "drop-shadow(0 0 14px rgba(212,171,95,0.7)) drop-shadow(0 2px 8px rgba(0,0,0,0.8))" }} />
                <span className="font-display text-4xl tracking-wide text-cream drop-shadow-[0_2px_24px_rgba(0,0,0,0.9)] md:text-5xl">
                  {siteName}
                </span>
              </>
            )}
          </div>

          {/* Badge */}
          <div className="relative inline-flex items-center gap-2.5 rounded-full border border-gold/40 bg-[rgba(14,8,4,0.6)] px-4 py-2 text-[10px] uppercase tracking-[0.38em] text-gold backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-gold pulse-soft" />
            Portfolio of a Sri Lankan visual storyteller
          </div>

          {/* Heading */}
          <h1 className="relative max-w-xl font-display text-3xl leading-[0.96] text-cream drop-shadow-[0_2px_28px_rgba(0,0,0,0.95)] md:text-5xl lg:text-[3.4rem]">
            {settings?.hero_heading ?? "Frames that reveal how the photographer sees."}
          </h1>
          {settings?.hero_subtext && (
            <p className="relative max-w-md text-sm leading-relaxed text-cream/80 drop-shadow-[0_1px_10px_rgba(0,0,0,0.9)]">
              {settings.hero_subtext}
            </p>
          )}

          {/* CTA buttons */}
          <div className="relative mt-1 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#about"
              className="group inline-flex items-center gap-2.5 bg-gold px-6 py-3.5 text-[11px] uppercase tracking-[0.32em] text-[var(--espresso)] shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all hover:-translate-y-0.5 hover:brightness-110"
            >
              Discover the story
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>

            <a
              href={`tel:+${WHATSAPP_NUMBER}`}
              className="group inline-flex items-center gap-2 border border-white/50 bg-[rgba(14,8,4,0.55)] px-6 py-3.5 text-[11px] uppercase tracking-[0.32em] text-cream shadow-[0_4px_20px_rgba(0,0,0,0.4)] backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-gold/70 hover:text-gold"
            >
              <Phone className="h-3.5 w-3.5" />
              Call now
            </a>

            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${waMsg}`}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 border border-white/50 bg-[rgba(14,8,4,0.55)] px-6 py-3.5 text-[11px] uppercase tracking-[0.32em] text-cream shadow-[0_4px_20px_rgba(0,0,0,0.4)] backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-[#25d366]/70 hover:text-[#25d366]"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              WhatsApp
            </a>

            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${bookMsg}`}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 border border-gold/60 bg-[rgba(212,171,95,0.2)] px-6 py-3.5 text-[11px] uppercase tracking-[0.32em] text-gold shadow-[0_4px_20px_rgba(0,0,0,0.4)] backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-gold hover:text-[var(--espresso)]"
            >
              Book now
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>

        {/* Slide dots + scroll hint */}
        <div className="flex flex-col items-center gap-5">
          {bgImages.length > 1 && (
            <div className="flex items-center gap-2">
              {bgImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`rounded-full transition-all duration-300 ${
                    i === current
                      ? "h-2 w-6 bg-gold"
                      : "h-2 w-2 bg-white/30 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          )}
          <a href="#about" aria-label="Scroll down" className="flex flex-col items-center gap-1.5 text-gold/70 transition-colors hover:text-gold">
            <span className="text-[9px] uppercase tracking-[0.4em]">Scroll</span>
            <ArrowDown className="h-4 w-4 animate-bounce" />
          </a>
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const { data: settings } = useSiteSettings();
  const defaultWords = ["Portraits", "Weddings", "Events", "Editorial", "Mood", "Light"];
  const words = settings?.marquee_words
    ? settings.marquee_words.split(",").map((w) => w.trim()).filter(Boolean)
    : [settings?.site_name ?? "Dopamine", ...defaultWords];
  const items = [...words, ...words, ...words];

  return (
    <div className="overflow-hidden border-y border-border bg-[var(--espresso)] py-6">
      <div className="marquee-track gap-12">
        {items.map((word, index) => (
          <span key={`${word}-${index}`} className="flex items-center gap-12 font-display text-4xl italic text-cream md:text-6xl">
            <span className={index % 2 === 0 ? "text-stroke" : "text-cream"}>{word}</span>
            <Aperture className="h-6 w-6 shrink-0 text-gold" strokeWidth={1} />
          </span>
        ))}
      </div>
    </div>
  );
}

function About() {
  const { data: settings } = useSiteSettings();

  const stats = [
    [settings?.stat_1_value ?? "120+", settings?.stat_1_label ?? "Wedding stories told"],
    [settings?.stat_2_value ?? "5K+", settings?.stat_2_label ?? "Portraits and frames delivered"],
    [settings?.stat_3_value ?? "Island-wide", settings?.stat_3_label ?? "Available across Sri Lanka"],
  ];

  return (
    <section id="about" className="relative overflow-hidden border-b border-border bg-[var(--espresso)] px-6 py-28 md:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,171,95,0.07),transparent_32%)]" />
      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">

          <div className="reveal relative">
            <div className="overflow-hidden rounded-[2.4rem] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.45)]">
              <img
                src={settings?.about_portrait_url ?? portrait}
                alt={`${settings?.photographer_name ?? "Tharindu Viduranga"} — Founder, ${settings?.site_name ?? "Dopamine"}`}
                className="h-[46rem] w-full object-cover object-top"
                loading="eager"
              />
            </div>
            <div className="absolute -bottom-5 left-6 glass-panel px-6 py-4 shadow-xl">
              <p className="text-[10px] uppercase tracking-[0.35em] text-gold">Founder / Visual Storyteller</p>
              <p className="mt-1 font-display text-2xl text-cream">{settings?.photographer_name ?? "Tharindu Viduranga"}</p>
            </div>
          </div>

          <div className="reveal pt-8 lg:pt-0">
            <p className="mb-3 flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-gold">
              <span className="h-px w-10 bg-gold" /> About
            </p>
            <h2 className="font-display text-5xl leading-[0.94] text-cream md:text-6xl lg:text-7xl">
              The eye behind
              <br />
              <span className="italic text-gold">{settings?.site_name ?? "Dopamine"}.</span>
            </h2>
            <p className="mt-8 max-w-lg text-base leading-relaxed text-cream/72 md:text-lg">
              {settings?.about_text || "This portfolio is built to present the visual voice behind Dopamine: wedding stories, portraits, and event frames shaped with warmth, atmosphere, and a cinematic eye."}
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="#work"
                className="group inline-flex items-center gap-3 bg-gold px-7 py-4 text-[11px] uppercase tracking-[0.32em] text-[var(--espresso)] transition-transform duration-300 hover:-translate-y-0.5"
              >
                View portfolio
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </a>
              <a
                href="#story"
                className="inline-flex items-center gap-3 border border-cream/20 bg-[rgba(255,255,255,0.04)] px-7 py-4 text-[11px] uppercase tracking-[0.32em] text-cream backdrop-blur-md transition-colors hover:border-gold/50 hover:text-gold"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                Meet the eye
              </a>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {stats.map(([value, label]) => (
                <div key={label} className="glass-panel px-5 py-5">
                  <p className="font-display text-3xl text-gold">{value}</p>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.28em] text-cream/60">{label}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function Story() {
  const { data: settings } = useSiteSettings();
  return (
    <section id="story" className="relative mx-auto max-w-7xl px-6 py-28 md:py-32">
      <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="reveal">
          <p className="mb-3 flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-gold">
            <span className="h-px w-10 bg-gold" /> Story
          </p>
          <h2 className="font-display text-5xl leading-[0.94] text-cream md:text-7xl lg:text-8xl">
            A portfolio
            <br />
            <span className="italic text-gold">built around photographic identity.</span>
          </h2>
        </div>
        <p className="reveal max-w-md text-sm leading-relaxed text-cream/65 md:text-base">
          Instead of reading like a studio homepage, this now behaves more like a curated presentation of authorship, taste, and range.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="reveal relative overflow-hidden rounded-[2rem] border border-white/10 bg-[var(--espresso)] p-3">
          <img src={settings?.story_image_url ?? uSaree} alt="Saree portrait by lamplight" className="h-[32rem] w-full rounded-[1.5rem] object-cover md:h-[42rem]" loading="lazy" />
          <div className="absolute inset-x-8 bottom-8 rounded-[1.4rem] border border-white/10 bg-[rgba(18,10,6,0.62)] p-6 backdrop-blur-xl">
            <p className="text-[10px] uppercase tracking-[0.36em] text-gold">Signature mood</p>
            <p className="mt-3 max-w-md font-display text-3xl leading-tight text-cream md:text-4xl">
              Warm tones, patient composition, and frames that carry emotional gravity.
            </p>
          </div>
        </div>

        <div className="grid gap-5">
          <div className="reveal glass-panel p-7 md:p-8">
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.35em] text-gold">
              <Sparkles className="h-4 w-4" />
              Portfolio focus
            </div>
            <div className="mt-6 space-y-6">
              {[
                "The opening now introduces the photographer's point of view instead of pushing services first.",
                "The strongest personal images are given hero treatment so talent is visible immediately.",
                "The page rhythm feels curated, helping the viewer move through style, range, and signature mood.",
              ].map((line) => (
                <p key={line} className="border-b border-white/8 pb-6 text-sm leading-relaxed text-cream/72 last:border-b-0 last:pb-0">
                  {line}
                </p>
              ))}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="reveal overflow-hidden rounded-[1.7rem] border border-white/10">
              <img src={uPortraitBw} alt="Black and white portrait" className="h-[22rem] w-full object-cover" loading="lazy" />
            </div>
            <div className="reveal glass-panel flex flex-col justify-between p-7">
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-gold">Visual identity</p>
                <p className="mt-4 font-display text-3xl text-cream">Elegant, intimate, and shaped with clear authorship.</p>
              </div>
              <div className="mt-8 flex items-center gap-3 text-[10px] uppercase tracking-[0.35em] text-cream/50">
                <Star className="h-4 w-4 text-gold" />
                Built to present artistic voice
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Lightbox({
  photos,
  index,
  onClose,
  setIndex,
}: {
  photos: DbPhoto[];
  index: number;
  onClose: () => void;
  setIndex: (value: number) => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIndex((index + 1) % photos.length);
      if (e.key === "ArrowLeft") setIndex((index - 1 + photos.length) % photos.length);
    };

    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, onClose, photos.length, setIndex]);

  const photo = photos[index];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(8,5,3,0.92)] px-5 backdrop-blur-xl animate-[fade-in_0.35s_ease-out]">
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-cream transition-colors hover:border-gold hover:text-gold md:right-8 md:top-8"
      >
        <X className="h-4 w-4" />
      </button>
      <button
        onClick={() => setIndex((index - 1 + photos.length) % photos.length)}
        aria-label="Previous"
        className="absolute left-6 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 text-cream transition-colors hover:border-gold hover:text-gold md:flex"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => setIndex((index + 1) % photos.length)}
        aria-label="Next"
        className="absolute right-6 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 text-cream transition-colors hover:border-gold hover:text-gold md:flex"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
      <div className="max-h-[86vh] max-w-[92vw]">
        <img src={photo.url} alt={photo.title} className="max-h-[78vh] max-w-[92vw] rounded-[1.6rem] object-contain shadow-2xl shadow-black/40" />
        <div className="mt-4 flex flex-col gap-2 text-cream/75 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-2xl italic text-gold">{photo.title}</p>
            {photo.location ? (
              <p className="mt-1 flex items-center gap-2 text-[10px] uppercase tracking-[0.35em]">
                <MapPin className="h-3.5 w-3.5" />
                {photo.location}
              </p>
            ) : null}
          </div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-cream/55">
            {String(index + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
          </p>
        </div>
      </div>
    </div>
  );
}

function Work() {
  const [active, setActive] = useState<string>("");
  const [lightbox, setLightbox] = useState<number | null>(null);
  const { data: categories = [] } = useQuery(categoriesQuery());
  const { data: allPhotos = [] } = useQuery(photosQuery());

  // Set first category as default once loaded
  useEffect(() => {
    if (categories.length > 0 && !active) setActive(categories[0].slug);
  }, [categories, active]);

  const activeCategory: WorkCategory | undefined = categories.find((c) => c.slug === active);
  const categoryPhotos = useMemo(
    () => allPhotos.filter((p) => p.category === active),
    [allPhotos, active],
  );
  const previewPhotos = categoryPhotos.slice(0, PHOTOS_PREVIEW_LIMIT);
  const hasMore = categoryPhotos.length > PHOTOS_PREVIEW_LIMIT;

  if (categories.length === 0) return null;

  return (
    <section id="work" className="relative overflow-hidden border-y border-border bg-[var(--espresso)] px-6 py-28 md:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,171,95,0.08),transparent_28%)]" />
      <Aperture className="pointer-events-none absolute -right-24 top-10 hidden h-[30rem] w-[30rem] text-gold/[0.05] md:block aperture-spin" strokeWidth={0.5} />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-14 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="reveal">
            <p className="mb-3 flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-gold">
              <span className="h-px w-10 bg-gold" /> Work
            </p>
            <h2 className="font-display text-5xl leading-[0.94] text-cream md:text-7xl lg:text-8xl">
              Signature work,
              <br />
              <span className="italic text-gold">not just categories.</span>
            </h2>
          </div>
          <p className="reveal max-w-md text-sm leading-relaxed text-cream/60 md:text-base">
            A curated archive — visual range and consistency across every project.
          </p>
        </div>

        <div className="reveal mb-10 flex flex-wrap items-center gap-3">
          {categories.map((cat, index) => (
            <button
              key={cat.slug}
              onClick={() => setActive(cat.slug)}
              className={`group relative overflow-hidden rounded-full border px-5 py-3 text-[11px] uppercase tracking-[0.3em] transition-all ${
                cat.slug === active
                  ? "border-gold bg-gold text-[var(--espresso)]"
                  : "border-white/12 bg-white/3 text-cream/70 hover:border-gold/40 hover:text-gold"
              }`}
            >
              <span className="mr-3 text-[10px] opacity-60">{String(index + 1).padStart(2, "0")}</span>
              {cat.label}
            </button>
          ))}
        </div>

        <div className="mb-10 grid gap-5 lg:grid-cols-[0.74fr_1.26fr]">
          <div className="reveal glass-panel flex flex-col justify-between p-8">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-gold">Current selection</p>
              <h3 className="mt-4 font-display text-4xl text-cream md:text-5xl">{activeCategory?.label}</h3>
              <p className="mt-4 font-display text-2xl italic text-gold/90">{activeCategory?.tag}</p>
              <p className="mt-6 max-w-sm text-sm leading-relaxed text-cream/68">{activeCategory?.intro}</p>
            </div>
            <div className="mt-8 border-t border-white/10 pt-6 text-[10px] uppercase tracking-[0.35em] text-cream/45">
              Open any frame to view it as a portfolio piece
            </div>
          </div>

          <div className="reveal relative min-h-[22rem] overflow-hidden rounded-[2rem] border border-white/10 bg-black/20 md:min-h-[30rem]">
            <img
              src={categoryPhotos[0]?.url}
              alt={categoryPhotos[0]?.title}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>

        <div key={active} className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5" style={{ gridAutoRows: "clamp(160px, 22vw, 280px)" }}>
          {previewPhotos.map((photo, index) => (
            <button
              key={`${active}-${photo.id}`}
              onClick={() => setLightbox(index)}
              className={`group relative h-full overflow-hidden rounded-[1.5rem] text-left ${photo.tall ? "row-span-2" : ""} ${
                index === 0 ? "col-span-2" : ""
              }`}
              style={{ opacity: 0, animation: `fade-in 0.7s ease-out ${index * 0.08}s forwards` }}
            >
              <img
                src={photo.url}
                alt={photo.title}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,10,6,0.02),rgba(16,10,6,0.16)_40%,rgba(16,10,6,0.92)_100%)]" />
              <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: "linear-gradient(145deg, color-mix(in oklab, var(--gold) 22%, transparent), transparent 55%)" }} />
              <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-gold">
                    {String(index + 1).padStart(2, "0")} / {activeCategory?.label}
                  </p>
                  {photo.location ? (
                    <p className="mt-2 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.32em] text-cream/60">
                      <MapPin className="h-3 w-3" />
                      {photo.location}
                    </p>
                  ) : null}
                </div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/25 bg-black/15 text-cream transition-all group-hover:border-gold group-hover:bg-gold group-hover:text-[var(--espresso)]">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
            </button>
          ))}
        </div>

        {hasMore && (
          <div className="mt-10 flex justify-center">
            <Link
              to="/work/$category"
              params={{ category: active }}
              className="group flex items-center gap-3 rounded-full border border-gold/40 bg-gold/8 px-8 py-4 text-[11px] uppercase tracking-[0.3em] text-gold transition-all hover:bg-gold hover:text-[var(--espresso)]"
            >
              View all {categoryPhotos.length} photos
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        )}
      </div>

      {lightbox !== null ? (
        <Lightbox
          photos={previewPhotos}
          index={lightbox}
          onClose={() => setLightbox(null)}
          setIndex={(value) => setLightbox(value)}
        />
      ) : null}
    </section>
  );
}

function Process() {
  const { data: settings } = useSiteSettings();
  return (
    <section className="mx-auto max-w-7xl px-6 py-28 md:py-32">
      <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="reveal">
          <p className="mb-3 flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-gold">
            <span className="h-px w-10 bg-gold" /> Experience
          </p>
          <h2 className="font-display text-5xl leading-[0.94] text-cream md:text-7xl">
            The craft behind
            <br />
            <span className="italic text-gold">the final frame.</span>
          </h2>
        </div>
        <p className="reveal max-w-md text-sm leading-relaxed text-cream/62 md:text-base">
          This section now reads like artistic process, showing how observation, direction, and finishing shape the portfolio.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        <div className="reveal overflow-hidden rounded-[2rem] border border-white/10">
          <img src={settings?.process_image_url ?? uHandsTattoo} alt="Hands detail portrait" className="h-[28rem] w-full object-cover md:h-[38rem]" loading="lazy" />
        </div>
        <div className="grid gap-5">
          {processSteps.map(([number, title, copy]) => (
            <div key={number} className="reveal glass-panel p-7 md:p-8">
              <div className="flex items-start gap-5">
                <div className="font-display text-4xl text-gold/75">{number}</div>
                <div>
                  <h3 className="font-display text-3xl text-cream">{title}</h3>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-cream/68 md:text-base">{copy}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section id="services" className="relative overflow-hidden border-y border-border bg-[var(--espresso)] px-6 py-28 md:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(212,171,95,0.08),transparent_28%)]" />
      <div className="relative mx-auto max-w-7xl">
        <div className="reveal mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-gold">
              <span className="h-px w-10 bg-gold" /> Strengths
            </p>
            <h2 className="font-display text-5xl leading-[0.94] text-cream md:text-7xl">
              Where the work
              <br />
              <span className="italic text-gold">speaks strongest.</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-cream/60 md:text-base">
            These are presented less like packages and more like the photographer's strongest visual territories.
          </p>
        </div>

        <motion.div
          className="grid gap-5 md:grid-cols-3"
          variants={cardContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {services.map((service, index) => (
            <motion.div key={service.name} variants={cardItem} className="glass-panel group p-8 transition-transform duration-500 hover:-translate-y-2">
              <div className="flex items-start justify-between">
                <span className="font-display text-5xl text-gold/45">{String(index + 1).padStart(2, "0")}</span>
                <service.icon className="h-7 w-7 text-gold transition-transform duration-500 group-hover:rotate-12" strokeWidth={1.2} />
              </div>
              <h3 className="mt-12 font-display text-3xl text-cream">{service.name}</h3>
              <p className="mt-4 text-sm leading-relaxed text-cream/70">{service.desc}</p>
              <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-5">
                <span className="text-[10px] uppercase tracking-[0.32em] text-gold">{service.price}</span>
                <ArrowUpRight className="h-4 w-4 text-cream/45 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-gold" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Quote() {
  const { data: settings } = useSiteSettings();
  return (
    <section className="grain relative overflow-hidden px-6 py-28 md:py-36">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,171,95,0.08),transparent_40%)]" />
      <div className="reveal relative mx-auto max-w-5xl text-center">
        <span className="font-display text-6xl text-gold/35 md:text-7xl">"</span>
        <p className="font-display text-4xl italic leading-[1.08] text-cream md:text-6xl lg:text-7xl">
          {settings?.quote_text ?? "A strong portfolio should show not only the moment, but the mind behind it."}
        </p>
        <div className="mx-auto mt-10 h-px w-24 bg-gold" />
        <p className="mt-6 text-[10px] uppercase tracking-[0.5em] text-gold">
          {settings?.quote_author ?? "Dopamine portfolio / Sri Lanka"}
        </p>
      </div>
    </section>
  );
}

function Packages() {
  const { data: packages = [] } = useQuery(publicPackagesQuery());
  if (packages.length === 0) return null;

  return (
    <section id="packages" className="relative overflow-hidden border-y border-border bg-[var(--espresso)] px-6 py-28 md:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,171,95,0.07),transparent_35%)]" />
      <div className="relative mx-auto max-w-7xl">
        <div className="reveal mb-16 text-center">
          <p className="mb-3 flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.4em] text-gold">
            <span className="h-px w-10 bg-gold" /> Packages
          </p>
          <h2 className="font-display text-5xl leading-[0.94] text-cream md:text-7xl">
            Invest in images
            <br />
            <span className="italic text-gold">worth keeping forever.</span>
          </h2>
        </div>
        <motion.div
          className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
          variants={cardContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {packages.map((pkg) => (
            <motion.div
              key={pkg.id}
              variants={cardItem}
              className={`glass-panel flex flex-col p-8 transition-transform duration-500 hover:-translate-y-1 ${
                pkg.is_popular ? "border-[var(--gold)]/50 ring-1 ring-[var(--gold)]/20" : ""
              }`}
            >
              {pkg.is_popular && (
                <span className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-gold">
                  <Star className="h-3 w-3 fill-gold" /> Most Popular
                </span>
              )}
              <h3 className="font-display text-3xl text-cream">{pkg.name}</h3>
              <p className="mt-2 font-display text-4xl text-gold">{pkg.price}</p>
              {pkg.description && (
                <p className="mt-4 text-sm leading-relaxed text-cream/65">{pkg.description}</p>
              )}
              {pkg.features.length > 0 && (
                <ul className="mt-6 flex-1 space-y-3 border-t border-white/10 pt-6">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-cream/75">
                      <span className="mt-0.5 h-4 w-4 flex-shrink-0 rounded-full border border-gold/40 text-center text-[9px] leading-[14px] text-gold">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              )}
              <a
                href="#contact"
                className="mt-8 inline-flex items-center justify-center gap-2 bg-gold px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-[var(--espresso)] transition-transform hover:-translate-y-0.5"
              >
                Book this package
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Testimonials() {
  const { data: testimonials = [] } = useQuery(publicTestimonialsQuery());
  if (testimonials.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-28 md:py-32">
      <div className="reveal mb-14 text-center">
        <p className="mb-3 flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.4em] text-gold">
          <span className="h-px w-10 bg-gold" /> Testimonials
        </p>
        <h2 className="font-display text-5xl leading-[0.94] text-cream md:text-7xl">
          Stories from
          <br />
          <span className="italic text-gold">those who trusted the lens.</span>
        </h2>
      </div>
      <motion.div
        className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
        variants={cardContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
      >
        {testimonials.map((t) => (
          <motion.div key={t.id} variants={cardItem} className="glass-panel flex flex-col p-8">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < t.rating ? "fill-gold text-gold" : "text-cream/20"}`}
                />
              ))}
            </div>
            <p className="mt-5 flex-1 font-display text-xl italic leading-relaxed text-cream">
              "{t.review_text}"
            </p>
            <div className="mt-8 border-t border-white/10 pt-5">
              <p className="font-medium text-cream">{t.client_name}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-gold/70">{t.review_date}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

const SOCIAL_ICON_MAP: Record<string, React.ElementType> = {
  instagram: Instagram,
  facebook: Facebook,
  whatsapp: MessageCircle,
  youtube: Youtube,
  tiktok: Camera,
  twitter: Link2,
  custom: Link2,
};

function Contact() {
  const { data: settings } = useSiteSettings();
  const { data: socialLinks = [] } = useQuery(socialLinksQuery());
  const activeLinks = socialLinks.filter((l) => l.is_active);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    project_type: "Wedding",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitContactForm(formData);
      toast.success("Message sent! I'll be in touch soon.");
      setFormData({ name: "", email: "", project_type: "Wedding", message: "" });
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="mx-auto max-w-7xl px-6 py-28 md:py-32">
      <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="reveal overflow-hidden rounded-[2rem] border border-white/10">
          <img src={settings?.contact_image_url ?? uWeddingCouple} alt="Wedding couple smiling" className="h-[30rem] w-full object-cover md:h-[40rem]" loading="lazy" />
        </div>

        <div className="reveal">
          <p className="mb-3 flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-gold">
            <span className="h-px w-10 bg-gold" /> Contact
          </p>
          <h2 className="font-display text-5xl leading-[0.94] text-cream md:text-7xl lg:text-8xl">
            Want to work with
            <br />
            <span className="italic text-gold">this photographic style?</span>
          </h2>
          <p className="mt-8 max-w-lg text-sm leading-relaxed text-cream/68 md:text-base">
            The contact section stays available, but it now sits after the portfolio story so the talent leads and the inquiry comes second.
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            <div className="glass-panel p-5">
              <p className="text-[10px] uppercase tracking-[0.32em] text-cream/45">Email</p>
              <a
                href={`mailto:${settings?.contact_email ?? "hello@dopamine.lk"}`}
                className="mt-3 inline-block font-display text-2xl text-cream hover:text-gold"
              >
                {settings?.contact_email ?? "hello@dopamine.lk"}
              </a>
            </div>
            {settings?.contact_phone ? (
              <div className="glass-panel p-5">
                <p className="text-[10px] uppercase tracking-[0.32em] text-cream/45">Phone</p>
                <a
                  href={`tel:${settings.contact_phone}`}
                  className="mt-3 inline-block font-display text-2xl text-cream hover:text-gold"
                >
                  {settings.contact_phone}
                </a>
              </div>
            ) : (
              <div className="glass-panel p-5">
                <p className="text-[10px] uppercase tracking-[0.32em] text-cream/45">Based in</p>
                <p className="mt-3 font-display text-2xl text-cream">
                  {settings?.contact_location ?? "Colombo, Sri Lanka"}
                </p>
              </div>
            )}
          </div>
          {settings?.contact_phone && (
            <div className="mt-5 glass-panel p-5">
              <p className="text-[10px] uppercase tracking-[0.32em] text-cream/45">Based in</p>
              <p className="mt-3 font-display text-2xl text-cream">
                {settings?.contact_location ?? "Colombo, Sri Lanka"}
              </p>
            </div>
          )}

          <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
            {[
              { label: "Name", type: "text", key: "name" },
              { label: "Email", type: "email", key: "email" },
            ].map((field) => (
              <div key={field.label}>
                <label className="mb-2 block text-[10px] uppercase tracking-[0.32em] text-cream/52">{field.label}</label>
                <input
                  type={field.type}
                  required
                  value={formData[field.key as "name" | "email"]}
                  onChange={(e) => setFormData((p) => ({ ...p, [field.key]: e.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/4 px-5 py-4 text-cream outline-none backdrop-blur-sm transition-colors focus:border-gold"
                />
              </div>
            ))}

            <div>
              <label className="mb-2 block text-[10px] uppercase tracking-[0.32em] text-cream/52">Project Type</label>
              <select
                value={formData.project_type}
                onChange={(e) => setFormData((p) => ({ ...p, project_type: e.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-[var(--espresso)] px-5 py-4 text-cream outline-none transition-colors focus:border-gold"
              >
                <option>Wedding</option>
                <option>Portrait</option>
                <option>Event</option>
                <option>Brand / Commercial</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-[10px] uppercase tracking-[0.32em] text-cream/52">Message</label>
              <textarea
                rows={5}
                required
                value={formData.message}
                onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                className="w-full resize-none rounded-[1.6rem] border border-white/10 bg-white/4 px-5 py-4 text-cream outline-none backdrop-blur-sm transition-colors focus:border-gold"
              />
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="group inline-flex items-center gap-3 bg-gold px-8 py-4 text-[11px] uppercase tracking-[0.32em] text-[var(--espresso)] transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-60"
              >
                {submitting ? "Sending…" : "Send inquiry"}
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </button>

              {activeLinks.length > 0 && (
                <div className="flex gap-3">
                  {activeLinks.map((link) => {
                    const Icon = SOCIAL_ICON_MAP[link.platform] ?? Link2;
                    return (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={link.label}
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 text-cream/75 transition-all hover:-translate-y-0.5 hover:border-gold hover:text-gold"
                      >
                        <Icon className="h-4 w-4" strokeWidth={1.4} />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const { data: settings } = useSiteSettings();
  return (
    <footer className="border-t border-border bg-[var(--espresso)] px-6 py-14 text-center">
      <Aperture className="mx-auto h-6 w-6 text-gold" strokeWidth={1.2} />
      <p className="mt-4 font-display text-4xl text-cream">{settings?.site_name ?? "Dopamine"}</p>
      <div className="mx-auto mt-6 h-px w-16 bg-gold" />
      <p className="mt-6 text-[10px] uppercase tracking-[0.4em] text-cream/50">
        {settings?.footer_text ?? "Copyright 2026 Dopamine by Tharindu Viduranga"}
      </p>
    </footer>
  );
}

function Index() {
  useReveal();
  useThemeApplicator();
  useSeoMeta();
  const { data: settings } = useSiteSettings();
  const { progress, visible } = useLoader();

  return (
    <>
      <Toaster position="bottom-right" theme="dark" />
      <Loader progress={progress} visible={visible} siteName={settings?.site_name} />
      <main className="min-h-screen overflow-x-hidden bg-background text-cream">
        <CustomCursor />
        <Nav />
        <Hero />
        {settings?.show_marquee !== false && <Marquee />}
        <About />
        {settings?.show_story !== false && <Story />}
        {settings?.show_work !== false && <Work />}
        {settings?.show_process !== false && <Process />}
        {settings?.show_services !== false && <Services />}
        {settings?.show_packages !== false && <Packages />}
        <Quote />
        {settings?.show_testimonials !== false && <Testimonials />}
        <Contact />
        <Footer />
      </main>
    </>
  );
}
