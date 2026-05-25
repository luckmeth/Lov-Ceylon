import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import {
  Aperture,
  ArrowDown,
  ArrowUpRight,
  Award,
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
  Star,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  categoriesQuery,
  heroSlidesQuery,
  photosQuery,
  publicPackagesQuery,
  publicProcessStepsQuery,
  publicServicesQuery,
  publicTestimonialsQuery,
  socialLinksQuery,
  submitContactForm,
} from "@/lib/queries";
import type { Photo, WorkCategory } from "@/lib/types";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { useSeoMeta } from "@/hooks/use-seo-meta";
import { useThemeApplicator } from "@/hooks/use-theme-applicator";


export const Route = createFileRoute("/")({ component: Index });
export default Index;

// ─── Motion variants ─────────────────────────────────────────────────────────
const ease = [0.16, 1, 0.3, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.85, ease } },
};
const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.7 } },
};
const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13, delayChildren: 0.05 } },
};
const slideRight: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 1, ease } },
};
const slideLeft: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 1, ease } },
};
const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.85, ease } },
};

const PHOTOS_PREVIEW_LIMIT = 9;

// ─── Split-text reveal (per-character stagger) ────────────────────────────────
function SplitText({
  text,
  delay = 0,
  duration = 0.78,
  gap = 0.048,
  className,
}: {
  text: string;
  delay?: number;
  duration?: number;
  gap?: number;
  className?: string;
}) {
  return (
    <span className={`inline-flex ${className ?? ""}`} aria-label={text}>
      {Array.from(text).map((char, i) => (
        <span key={i} style={{ overflow: "hidden", display: "inline-block", lineHeight: "inherit" }}>
          <motion.span
            style={{ display: "inline-block" }}
            className={char === "'" ? "text-gold" : ""}
            initial={{ y: "110%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration, delay: delay + i * gap, ease }}
          >
            {char === " " ? " " : char}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

// ─── Icon map for service icons stored as strings ─────────────────────────────
const ICON_MAP: Record<string, React.FC<{ className?: string; strokeWidth?: number }>> = {
  Heart, Camera, Calendar, Star, Aperture,
  Award: Star, Image: Camera, Film: Camera, Sun: Star, Flower2: Heart,
};

// ─── Animated stat counter ────────────────────────────────────────────────────
function StatItem({ num, suffix, label }: { num: number; suffix: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start: number | null = null;
    const dur = 1800;
    let raf: number;
    const tick = (now: number) => {
      if (!start) start = now;
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(eased * num));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, num]);

  return (
    <div ref={ref} className="flex flex-col items-center py-12 text-center">
      <span className="font-display text-6xl leading-none text-gold md:text-7xl">
        {display}{suffix}
      </span>
      <span className="mt-3 text-[9px] uppercase tracking-[0.5em] text-cream/45">{label}</span>
    </div>
  );
}

// ─── Custom cursor ────────────────────────────────────────────────────────────
function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    let rx = 0, ry = 0, x = 0, y = 0, raf = 0;
    const move = (e: MouseEvent) => {
      x = e.clientX; y = e.clientY;
      if (dot.current) dot.current.style.transform = `translate3d(${x - 4}px,${y - 4}px,0)`;
    };
    const tick = () => {
      rx += (x - rx) * 0.14; ry += (y - ry) * 0.14;
      if (ring.current) ring.current.style.transform = `translate3d(${rx - 16}px,${ry - 16}px,0)`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", move, { passive: true });
    tick();
    return () => { window.removeEventListener("mousemove", move); cancelAnimationFrame(raf); };
  }, []);

  return (
    <>
      <div ref={dot} className="pointer-events-none fixed left-0 top-0 z-[110] hidden h-2 w-2 rounded-full bg-[var(--gold)] md:block" aria-hidden />
      <div ref={ring} className="pointer-events-none fixed left-0 top-0 z-[109] hidden h-8 w-8 rounded-full border border-[rgba(201,169,110,0.55)] md:block" aria-hidden />
    </>
  );
}

// ─── Loader ───────────────────────────────────────────────────────────────────
function useLoader() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((v) => {
        if (v >= 100) return 100;
        return Math.min(100, v + (v < 60 ? 8 : v < 85 ? 4 : 2));
      });
    }, 65);
    const finish = setTimeout(() => {
      clearInterval(timer);
      setProgress(100);
      setTimeout(() => setVisible(false), 700);
    }, 2000);
    return () => { clearInterval(timer); clearTimeout(finish); };
  }, []);
  return { progress, visible };
}

function Loader({ progress, visible }: { progress: number; visible: boolean }) {
  const messages = ["Calibrating light…", "Framing emotion…", "Building the experience…"];
  const step = Math.min(messages.length - 1, Math.floor(progress / 34));

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          exit={{ opacity: 0, transition: { duration: 1.1, ease: "easeInOut" } }}
          className="fixed inset-0 z-[300] flex flex-col overflow-hidden bg-[var(--espresso)]"
        >
          {/* Ambient glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_65%_55%_at_50%_38%,rgba(201,169,110,0.18),transparent)]" />
          {/* Grid */}
          <div className="absolute inset-0 grid-pattern opacity-[0.11]" />

          {/* Film-strip sprocket holes — left */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 flex w-7 flex-col items-center justify-center gap-[14px] opacity-20">
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} className="h-[18px] w-[13px] rounded-sm border border-gold/50" />
            ))}
          </div>
          {/* Film-strip sprocket holes — right */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 flex w-7 flex-col items-center justify-center gap-[14px] opacity-20">
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} className="h-[18px] w-[13px] rounded-sm border border-gold/50" />
            ))}
          </div>

          {/* Corner marks */}
          {["left-10 top-10 border-l border-t", "right-10 top-10 border-r border-t",
            "bottom-10 left-10 border-b border-l", "bottom-10 right-10 border-b border-r"].map((cls, i) => (
            <div key={i} className={`pointer-events-none absolute h-7 w-7 border-gold/35 ${cls}`} />
          ))}

          {/* Main content */}
          <div className="relative flex flex-1 flex-col items-center justify-center gap-8">
            {/* Aperture with glow pulse */}
            <motion.div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                className="flex h-[72px] w-[72px] items-center justify-center rounded-full border border-gold/28"
              >
                <Aperture className="h-8 w-8 text-gold" strokeWidth={0.85} />
              </motion.div>
              {/* Outer glow ring */}
              <motion.div
                animate={{ scale: [1, 1.55, 1], opacity: [0.25, 0, 0.25] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-gold/18"
              />
            </motion.div>

            {/* Brand block */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.95 }}
              className="flex flex-col items-center gap-2 text-center"
            >
              <p className="text-[8.5px] uppercase tracking-[0.68em] text-gold/58">Visual story in motion</p>

              {/* Animated brand name with shimmer sweep */}
              <div className="relative overflow-hidden">
                <h1 className="font-display text-[clamp(4rem,11vw,8rem)] leading-none tracking-tight text-cream [text-shadow:0_4px_40px_rgba(0,0,0,0.7)]">
                  <SplitText text="Lov'Ceylon" delay={0.32} gap={0.058} duration={0.88} />
                </h1>
                {/* Gold shimmer sweep after letters settle */}
                <motion.span
                  aria-hidden
                  initial={{ x: "-115%", skewX: -10 }}
                  animate={{ x: "240%" }}
                  transition={{ duration: 1.1, delay: 1.15, ease }}
                  className="pointer-events-none absolute inset-0 block opacity-55"
                  style={{ background: "linear-gradient(90deg,transparent 8%,rgba(255,255,255,0.55) 50%,transparent 92%)" }}
                />
              </div>

              {/* Subtitle fade-in */}
              <motion.p
                initial={{ opacity: 0, letterSpacing: "0.2em" }}
                animate={{ opacity: 1, letterSpacing: "0.55em" }}
                transition={{ delay: 1.05, duration: 1.0 }}
                className="text-[7.5px] uppercase text-cream/28"
              >
                Photography · Sri Lanka · Japan
              </motion.p>
            </motion.div>

            {/* Cycling message */}
            <AnimatePresence mode="wait">
              <motion.p
                key={step}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.45 }}
                className="text-[8.5px] uppercase tracking-[0.48em] text-cream/33"
              >
                {messages[step]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Progress bar */}
          <div className="relative px-10 pb-11 md:px-16">
            <div className="mb-2.5 flex justify-between text-[7.5px] uppercase tracking-[0.42em] text-cream/22">
              <span>Loading portfolio</span>
              <span>{String(progress).padStart(2, "0")}%</span>
            </div>
            <div className="relative h-px overflow-hidden bg-white/[0.07]">
              <motion.div
                animate={{ scaleX: progress / 100 }}
                transition={{ ease: "easeOut", duration: 0.4 }}
                className="h-full origin-left bg-gradient-to-r from-gold/70 via-[#f2e0a0] to-gold"
              />
            </div>
            {/* Glow dot */}
            <motion.div
              animate={{ left: `${Math.min(progress, 99)}%` }}
              transition={{ ease: "easeOut", duration: 0.4 }}
              className="absolute top-[calc(100%-11px-3px)] h-[6px] w-[6px] -translate-x-1/2 rounded-full bg-gold shadow-[0_0_10px_3px_rgba(201,169,110,0.65)]"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav() {
  const { data: settings } = useSiteSettings();
  const whatsapp = settings?.contact_phone?.replace(/\D/g, "") ?? "94777807619";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const siteName = settings?.site_name ?? "Lov'Ceylon";
  const apoIdx = siteName.indexOf("'");
  const nameBefore = apoIdx >= 0 ? siteName.slice(0, apoIdx) : siteName;
  const fullAfter = apoIdx >= 0 ? siteName.slice(apoIdx + 1) : "";
  const nameAfter = fullAfter.includes(" ") ? fullAfter.slice(0, fullAfter.indexOf(" ")) : fullAfter;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const links = [["Story", "#about"], ["Gallery", "#work"], ["Packages", "#packages"], ["Services", "#services"], ["Contact", "#contact"]];

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.9, ease }}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "border-b border-white/[0.06] bg-[rgba(8,4,2,0.95)] backdrop-blur-2xl shadow-[0_4px_32px_rgba(0,0,0,0.5)]"
            : "bg-gradient-to-b from-[rgba(0,0,0,0.65)] to-transparent backdrop-blur-[3px]"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center px-6 py-4 md:py-5">

          {/* Desktop — left brand */}
          <motion.a
            href="#top"
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.55, duration: 0.9, ease }}
            className="hidden md:flex flex-col items-start leading-none select-none cursor-pointer group shrink-0"
          >
            <div className="flex items-baseline">
              <span className="font-display text-[1.45rem] tracking-tight text-cream [text-shadow:0_2px_20px_rgba(0,0,0,1),0_0_40px_rgba(0,0,0,0.8)]">
                {nameBefore}
              </span>
              <span className="relative font-display text-[1.45rem] tracking-tight text-gold overflow-hidden inline-block [text-shadow:0_0_18px_rgba(201,169,110,0.6)]">
                &#39;
                <motion.span
                  aria-hidden
                  animate={{ x: ["-300%", "400%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 4.5, ease: "easeInOut" }}
                  className="pointer-events-none absolute inset-y-0 w-5 block"
                  style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.95),transparent)" }}
                />
              </span>
              <span className="font-display text-[1.45rem] tracking-tight text-cream [text-shadow:0_2px_20px_rgba(0,0,0,1),0_0_40px_rgba(0,0,0,0.8)]">
                {nameAfter || "Ceylon"}
              </span>
            </div>
            <span className="text-[5.5px] uppercase tracking-[0.62em] text-gold/58 mt-0.5">Photography</span>
          </motion.a>

          {/* Desktop — center links */}
          <nav className="hidden md:flex flex-1 items-center justify-center gap-6">
            {links.map(([label, href]) => (
              <a
                key={label} href={href}
                className="text-[9px] uppercase tracking-[0.42em] text-cream/82 transition-colors hover:text-gold [text-shadow:0_1px_10px_rgba(0,0,0,1),0_0_28px_rgba(0,0,0,0.9)]"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Desktop — right Book Now */}
          <div className="hidden md:flex items-center shrink-0">
            <a
              href={`https://wa.me/${whatsapp}?text=${encodeURIComponent("Hi Lov'Ceylon! I'd like to book a photography session.")}`}
              target="_blank" rel="noreferrer"
              className="border border-gold/48 bg-[rgba(0,0,0,0.3)] px-5 py-2 text-[9px] uppercase tracking-[0.4em] text-gold backdrop-blur-sm transition-all hover:bg-gold hover:text-[var(--espresso)] hover:shadow-[0_0_20px_rgba(201,169,110,0.4)]"
            >
              Book Now
            </a>
          </div>

          {/* Mobile — brand + hamburger */}
          <div className="flex w-full items-center justify-between md:hidden">
            <div className="flex flex-col leading-none">
              <span className="font-display text-[1.25rem] text-cream [text-shadow:0_2px_12px_rgba(0,0,0,0.9)]">
                {nameBefore}<span className="text-gold">&#39;</span>{nameAfter || "Ceylon"}
              </span>
              <span className="text-[6px] uppercase tracking-[0.52em] text-gold/58 mt-0.5">Photography</span>
            </div>
            <button onClick={() => setOpen(true)} aria-label="Open menu" className="flex h-9 w-9 items-center justify-center border border-white/22 text-cream transition-colors hover:border-gold hover:text-gold">
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            className="fixed inset-0 z-[200] flex flex-col bg-[var(--espresso)] px-8 py-8 md:hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(201,169,110,0.1),transparent)]" />
            <div className="relative flex items-center justify-between">
              <div className="flex flex-col items-start leading-none">
                <span className="font-display text-xl text-cream">
                  {nameBefore}<span className="text-gold">&#39;</span>{nameAfter || "Ceylon"}
                </span>
                <span className="mt-0.5 text-[7px] uppercase tracking-[0.5em] text-gold/65">Photography</span>
              </div>
              <button onClick={() => setOpen(false)} className="flex h-9 w-9 items-center justify-center border border-white/20 text-cream">
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="relative mt-16 flex flex-col">
              {links.map(([label, href], i) => (
                <motion.a
                  key={label} href={href}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 + i * 0.07, duration: 0.5 }}
                  onClick={() => setOpen(false)}
                  className="group flex items-center justify-between border-b border-white/[0.06] py-6"
                >
                  <span className="font-display text-4xl text-cream transition-colors group-hover:text-gold">{label}</span>
                  <ArrowUpRight className="h-5 w-5 text-gold/35 transition-all group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-gold" />
                </motion.a>
              ))}
            </nav>

            <div className="relative mt-auto">
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank" rel="noreferrer"
                onClick={() => setOpen(false)}
                className="block w-full bg-gold py-4 text-center text-[10px] uppercase tracking-[0.4em] text-[var(--espresso)]"
              >
                Book a Session
              </a>
              <p className="mt-5 text-center text-[8px] uppercase tracking-[0.5em] text-cream/20">
                {nameBefore}<span className="text-gold/60">&#39;</span>{nameAfter || "Ceylon"} · Sri Lanka · Japan
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  const { data: settings } = useSiteSettings();
  const { data: slides = [] } = useQuery(heroSlidesQuery());
  const [current, setCurrent] = useState(0);
  const [ready, setReady] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);

  const bgImages = slides.length > 0
    ? slides.map((s) => s.image_url)
    : settings?.hero_background_url
      ? [settings.hero_background_url]
      : [];

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 2200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (bgImages.length <= 1) return;
    const t = setInterval(() => setCurrent((i) => (i + 1) % bgImages.length), 6000);
    return () => clearInterval(t);
  }, [bgImages.length]);

  return (
    <section id="top" ref={heroRef} className="relative min-h-screen overflow-hidden bg-[var(--espresso)]">
      {/* Parallax background */}
      <motion.div className="absolute inset-0 will-change-transform" style={{ y: bgY }}>
        {bgImages.map((url, i) => (
          <motion.div
            key={url}
            animate={{ opacity: i === current ? 1 : 0 }}
            transition={{ duration: 1.6, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <div
              className={`absolute inset-0 scale-110 bg-cover bg-center ${i === current ? "ken-burns" : ""}`}
              style={{ backgroundImage: `url(${url})` }}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Gradient */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,8,4,0.52)_0%,rgba(14,8,4,0.08)_28%,rgba(14,8,4,0.08)_52%,rgba(14,8,4,0.72)_78%,rgba(14,8,4,0.97)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_75%_at_50%_50%,rgba(14,8,4,0.5)_0%,transparent_100%)]" />

      {/* Frame */}
      <div className="pointer-events-none absolute inset-x-5 bottom-5 top-20 z-[1] border border-[rgba(139,107,61,0.4)] md:inset-x-10 md:bottom-10 md:top-24" />
      {/* Corner marks */}
      {[
        "left-5 top-20 border-l border-t md:left-10 md:top-24",
        "right-5 top-20 border-r border-t md:right-10 md:top-24",
        "bottom-5 left-5 border-b border-l md:bottom-10 md:left-10",
        "bottom-5 right-5 border-b border-r md:bottom-10 md:right-10",
      ].map((cls, i) => (
        <div key={i} className={`pointer-events-none absolute z-[2] h-6 w-6 border-gold/60 ${cls}`} />
      ))}

      {/* Hero content */}
      <motion.div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pb-20 pt-28" style={{ y: contentY }}>
        <AnimatePresence>
          {ready && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="flex flex-col items-center gap-0 text-center"
            >
              {/* Est line */}
              <motion.p
                variants={fadeIn}
                className="mb-7 text-[9px] uppercase tracking-[0.6em] text-gold/65"
              >
                Est. 2014 · Sri Lanka · Japan
              </motion.p>

              {/* Brand name — per-character stagger reveal */}
              <div className="relative">
                <h1 className="font-display text-[clamp(4.5rem,13vw,10rem)] leading-none tracking-tight text-cream drop-shadow-[0_4px_48px_rgba(0,0,0,0.9)]">
                  <SplitText text="Lov'Ceylon" delay={0.15} gap={0.055} duration={0.9} />
                </h1>
                {/* Gold shimmer sweep after text settles */}
                <motion.span
                  aria-hidden
                  initial={{ x: "-115%", skewX: -12 }}
                  animate={{ x: "230%" }}
                  transition={{ duration: 1.05, delay: 1.05, ease }}
                  className="pointer-events-none absolute inset-0 block"
                  style={{ background: "linear-gradient(90deg,transparent 10%,rgba(201,169,110,0.55) 50%,transparent 90%)" }}
                />
              </div>

              {/* Animated line */}
              <div className="relative my-5 w-full max-w-[280px] overflow-hidden">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1.1, delay: 0.55, ease }}
                  className="h-px origin-left bg-gradient-to-r from-transparent via-gold to-transparent"
                />
              </div>

              {/* Wedding Photography */}
              <div className="overflow-hidden">
                <motion.p
                  initial={{ y: "105%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, delay: 0.65, ease }}
                  className="text-[11px] uppercase tracking-[0.6em] text-cream/85"
                >
                  Wedding Photography
                </motion.p>
              </div>

              {/* Specialty separator */}
              <motion.div
                variants={fadeIn}
                transition={{ delay: 0.85 }}
                className="mt-5 flex w-full max-w-[340px] items-center gap-4"
              >
                <span className="h-px flex-1 bg-gold/28" />
                <span className="text-[9px] uppercase tracking-[0.42em] text-gold/65">Wedding · Fashion · Portrait</span>
                <span className="h-px flex-1 bg-gold/28" />
              </motion.div>

              {/* Location */}
              <motion.p
                variants={fadeIn}
                transition={{ delay: 1.0 }}
                className="mt-3 text-[8px] uppercase tracking-[0.58em] text-cream/40"
              >
                Sri Lanka · Japan
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2, ease }}
                className="mt-10 flex flex-wrap items-center justify-center gap-4"
              >
                <a
                  href={`https://wa.me/${settings?.contact_phone?.replace(/\D/g, "") ?? "94777807619"}?text=${encodeURIComponent("Hi Lov'Ceylon! I'd like to book a photography session.")}`}
                  target="_blank" rel="noreferrer"
                  className="group inline-flex items-center gap-2 bg-gold px-8 py-3.5 text-[10px] uppercase tracking-[0.42em] text-[var(--espresso)] shadow-[0_6px_30px_rgba(201,169,110,0.4)] transition-all hover:-translate-y-0.5 hover:brightness-110"
                >
                  Book Now
                  <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
                <Link
                  to="/work/$category"
                  params={{ category: "all" }}
                  className="group inline-flex items-center gap-2 border border-white/38 bg-[rgba(14,8,4,0.38)] px-8 py-3.5 text-[10px] uppercase tracking-[0.42em] text-cream backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-gold/55 hover:text-gold"
                >
                  Our Gallery
                  <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
                <a
                  href={`tel:${settings?.contact_phone ?? "+94777807619"}`}
                  className="group inline-flex items-center gap-2 border border-white/18 bg-[rgba(14,8,4,0.25)] px-6 py-3.5 text-[10px] uppercase tracking-[0.42em] text-cream/75 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-gold/40 hover:text-gold"
                >
                  <Phone className="h-3 w-3" />
                  Call Us
                </a>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Slide indicators */}
      {bgImages.length > 1 && (
        <div className="absolute bottom-12 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
          {bgImages.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} className={`rounded-full transition-all duration-500 ${i === current ? "h-1.5 w-8 bg-gold" : "h-1.5 w-1.5 bg-white/22 hover:bg-white/45"}`} />
          ))}
        </div>
      )}

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1 }}
        className="absolute bottom-10 right-8 z-10 flex flex-col items-center gap-2"
      >
        <span className="text-[7px] uppercase tracking-[0.6em] text-cream/30 [writing-mode:vertical-rl]">Scroll</span>
        <motion.div animate={{ y: [0, 7, 0] }} transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}>
          <ArrowDown className="h-3 w-3 text-gold/40" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Marquee ──────────────────────────────────────────────────────────────────
function Marquee({ words }: { words?: string[] }) {
  const base = words?.length ? words : ["Wedding", "Fashion", "Portrait", "Sri Lanka", "Japan", "Timeless", "Moments", "Love Stories"];
  const repeated = [...base, ...base, ...base, ...base];
  return (
    <div className="relative overflow-hidden border-y border-gold/15 bg-[rgba(14,8,4,0.6)] py-3.5 backdrop-blur-sm">
      <div className="marquee-track flex items-center">
        {repeated.map((w, i) => (
          <span key={i} className="flex shrink-0 items-center">
            <span className="px-5 text-[9px] uppercase tracking-[0.45em] text-cream/50">{w}</span>
            <span className="h-1 w-1 shrink-0 rounded-full bg-gold/40" />
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Philosophy / Stats ───────────────────────────────────────────────────────
function Philosophy() {
  const { data: settings } = useSiteSettings();

  const stats = [
    {
      raw: settings?.stat_1_value ?? "10+",
      label: settings?.stat_1_label ?? "Years of Craft",
    },
    {
      raw: settings?.stat_2_value ?? "500+",
      label: settings?.stat_2_label ?? "Weddings Captured",
    },
    {
      raw: settings?.stat_3_value ?? "2",
      label: settings?.stat_3_label ?? "Countries",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[var(--espresso)] py-28 md:py-44">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_50%_at_50%_65%,rgba(201,169,110,0.06),transparent)]" />

      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mb-20 max-w-4xl"
        >
          <motion.p variants={fadeUp} className="mb-5 text-[9px] uppercase tracking-[0.58em] text-gold/55">Our Philosophy</motion.p>
          <motion.h2 variants={fadeUp} className="font-display text-4xl leading-[1.12] text-cream md:text-5xl lg:text-6xl">
            {settings?.tagline ?? "We believe every love story deserves to be told with art — not just photographs, but frames that breathe, carry feeling, and endure time."}
          </motion.h2>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-3 divide-x divide-gold/12 border border-gold/12"
        >
          {stats.map((s, i) => {
            const num = parseInt(s.raw) || 0;
            const suffix = s.raw.replace(/[0-9]/g, "");
            return (
              <motion.div key={i} variants={scaleIn}>
                <StatItem num={num} suffix={suffix} label={s.label} />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Work / Gallery ───────────────────────────────────────────────────────────
function Work() {
  const { data: photos = [] } = useQuery(photosQuery());
  const { data: categories = [] } = useQuery(categoriesQuery());
  const [activeCat, setActiveCat] = useState("all");
  const [displayOffset, setDisplayOffset] = useState(0);

  const baseFiltered = activeCat === "all" ? photos : photos.filter((p) => p.category === activeCat);
  const filtered = baseFiltered.length <= PHOTOS_PREVIEW_LIMIT
    ? baseFiltered
    : Array.from({ length: PHOTOS_PREVIEW_LIMIT }, (_, i) => baseFiltered[(displayOffset + i) % baseFiltered.length]);

  useEffect(() => { setDisplayOffset(0); }, [activeCat]);

  useEffect(() => {
    if (baseFiltered.length <= PHOTOS_PREVIEW_LIMIT) return;
    const timer = setInterval(() => setDisplayOffset((p) => (p + 1) % baseFiltered.length), 3500);
    return () => clearInterval(timer);
  }, [baseFiltered.length, activeCat]);

  return (
    <section id="work" className="relative bg-[var(--background)] py-24 md:py-40">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mb-14 flex flex-col gap-5 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <motion.p variants={fadeUp} className="mb-2 text-[9px] uppercase tracking-[0.58em] text-gold/55">Portfolio</motion.p>
            <motion.h2 variants={fadeUp} className="font-display text-4xl text-cream md:text-5xl">Our Work</motion.h2>
          </div>
          <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
            {[{ slug: "all", label: "All" } as WorkCategory, ...(categories as WorkCategory[])].map((c) => (
              <button
                key={c.slug}
                onClick={() => setActiveCat(c.slug)}
                className={`border px-4 py-1.5 text-[9px] uppercase tracking-[0.42em] transition-all ${activeCat === c.slug ? "border-gold bg-gold/10 text-gold" : "border-white/12 text-cream/45 hover:border-gold/35 hover:text-cream/75"}`}
              >
                {c.label}
              </button>
            ))}
          </motion.div>
        </motion.div>

        {/* Masonry grid — direct animate (no whileInView) so photos always visible */}
        {baseFiltered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="py-24 text-center"
          >
            <Aperture className="mx-auto mb-4 h-10 w-10 text-gold/20" strokeWidth={0.8} />
            <p className="font-display text-2xl text-cream/30">No photos yet</p>
            <p className="mt-2 text-[9px] uppercase tracking-[0.45em] text-cream/18">Add photos in the admin panel</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((photo, i) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.55, delay: i * 0.05, ease }}
                  className={`group relative overflow-hidden ${i === 0 ? "col-span-2 md:col-span-2" : ""} ${i === 3 ? "md:col-span-2" : ""}`}
                >
                  <Link to="/work/$category" params={{ category: photo.category ?? "all" }}>
                    <div className={`relative overflow-hidden ${i === 0 ? "aspect-[16/9]" : "aspect-square"}`}>
                      <img
                        src={photo.url}
                        alt={photo.title ?? ""}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.08]"
                      />
                      <div className="absolute inset-0 bg-[var(--espresso)]/0 transition-all duration-500 group-hover:bg-[var(--espresso)]/50" />
                      <div className="absolute inset-0 border border-transparent transition-all duration-500 group-hover:inset-3 group-hover:border-gold/40" />
                      <div className="absolute bottom-0 left-0 right-0 translate-y-full p-5 transition-transform duration-500 group-hover:translate-y-0">
                        <p className="text-[8px] uppercase tracking-[0.5em] text-gold">{photo.category}</p>
                        <p className="mt-0.5 font-display text-xl text-cream">{photo.title}</p>
                      </div>
                      <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center border border-transparent text-transparent transition-all duration-500 group-hover:border-gold/55 group-hover:text-gold">
                        <ArrowUpRight className="h-4 w-4" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <Link
            to="/work/$category"
            params={{ category: "all" }}
            className="group inline-flex items-center gap-2.5 border border-gold/38 px-9 py-4 text-[10px] uppercase tracking-[0.42em] text-gold transition-all hover:bg-gold hover:text-[var(--espresso)]"
          >
            View Full Gallery
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ─── About ────────────────────────────────────────────────────────────────────
function About() {
  const { data: settings } = useSiteSettings();
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section id="about" ref={sectionRef} className="relative overflow-hidden bg-[var(--espresso)] py-28 md:py-44">
      <div className="pointer-events-none absolute left-0 top-0 h-full w-1/2 bg-[radial-gradient(ellipse_80%_60%_at_0%_50%,rgba(201,169,110,0.05),transparent)]" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl">
          {/* Text */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="flex flex-col justify-center"
          >
            <motion.p variants={fadeUp} className="mb-3 text-[9px] uppercase tracking-[0.58em] text-gold/55">Our Story</motion.p>
            <motion.h2 variants={fadeUp} className="font-display text-4xl leading-[1.08] text-cream md:text-5xl">
              {settings?.photographer_name ?? "Lov’Ceylon Photography"}
            </motion.h2>
            <motion.div variants={fadeUp} className="my-6 h-px bg-gradient-to-r from-gold/35 to-transparent" />
            <motion.p variants={fadeUp} className="text-[15px] leading-relaxed text-cream/60">
              {settings?.about_text ?? "Lov’Ceylon Photography was founded with a single purpose — to tell love stories with the depth they deserve."}
            </motion.p>

            <motion.div variants={stagger} className="mt-10 grid grid-cols-3 gap-5 border-t border-gold/12 pt-8">
              {[
                [settings?.stat_1_value ?? "10+", settings?.stat_1_label ?? "Years"],
                [settings?.stat_2_value ?? "500+", settings?.stat_2_label ?? "Weddings"],
                [settings?.stat_3_value ?? "SL·JP", settings?.stat_3_label ?? "Countries"],
              ].map(([n, l]) => (
                <motion.div key={l} variants={fadeUp}>
                  <p className="font-display text-3xl text-gold">{n}</p>
                  <p className="mt-0.5 text-[8px] uppercase tracking-[0.45em] text-cream/40">{l}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="mt-10 flex gap-3">
              <a href="#contact" className="inline-flex items-center gap-2 bg-gold px-6 py-3 text-[10px] uppercase tracking-[0.4em] text-[var(--espresso)] transition-all hover:-translate-y-0.5">
                Work With Us <ArrowUpRight className="h-3 w-3" />
              </a>
              <a href={`https://wa.me/${settings?.contact_phone?.replace(/\D/g, "") ?? "94777807619"}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-gold/35 px-6 py-3 text-[10px] uppercase tracking-[0.4em] text-gold transition-all hover:bg-gold/8">
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Services ─────────────────────────────────────────────────────────────────
function Services() {
  const { data: services = [] } = useQuery(publicServicesQuery());

  if (services.length === 0) return null;

  return (
    <section id="services" className="relative bg-[var(--background)] py-28 md:py-44">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_100%,rgba(201,169,110,0.05),transparent)]" />

      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mb-16 text-center"
        >
          <motion.p variants={fadeUp} className="mb-3 text-[9px] uppercase tracking-[0.58em] text-gold/55">What We Offer</motion.p>
          <motion.h2 variants={fadeUp} className="font-display text-4xl text-cream md:text-5xl">Services</motion.h2>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid gap-px bg-gold/10 md:grid-cols-3"
        >
          {services.map((s) => {
            const Icon = ICON_MAP[s.icon_name] ?? Camera;
            return (
              <motion.div
                key={s.id}
                variants={fadeUp}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
                className="group relative flex flex-col bg-[var(--background)] p-10 transition-colors hover:bg-[rgba(201,169,110,0.03)]"
              >
                <p className="mb-6 font-display text-5xl text-gold/12 transition-colors group-hover:text-gold/25">{s.num}</p>
                <div className="mb-6 flex h-12 w-12 items-center justify-center border border-gold/18 transition-colors group-hover:border-gold/45">
                  <Icon className="h-5 w-5 text-gold/60 transition-colors group-hover:text-gold" strokeWidth={1.2} />
                </div>
                <h3 className="mb-4 font-display text-2xl text-cream">{s.name}</h3>
                <p className="flex-1 text-sm leading-relaxed text-cream/50">{s.description}</p>
                <div className="mt-8 h-px w-0 bg-gold/35 transition-all duration-500 group-hover:w-full" />
                {s.detail && <p className="mt-3 text-[8px] uppercase tracking-[0.42em] text-gold/45">{s.detail}</p>}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Process ──────────────────────────────────────────────────────────────────
function Process() {
  const { data: steps = [] } = useQuery(publicProcessStepsQuery());

  if (steps.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-[var(--espresso)] py-28 md:py-44">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mb-16"
        >
          <motion.p variants={fadeUp} className="mb-3 text-[9px] uppercase tracking-[0.58em] text-gold/55">How It Works</motion.p>
          <motion.h2 variants={fadeUp} className="font-display text-4xl text-cream md:text-5xl">Our Process</motion.h2>
        </motion.div>

        <div className="relative grid gap-0 md:grid-cols-3">
          <div className="absolute left-0 right-0 top-12 hidden md:block">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, ease, delay: 0.2 }}
              className="h-px origin-left bg-gradient-to-r from-transparent via-gold/22 to-transparent"
            />
          </div>

          {steps.map((step, i) => (
            <motion.div
              key={step.id}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.14 }}
              className="relative border-l border-gold/12 py-8 pl-8 md:border-l-0 md:border-t md:pl-0 md:pr-12 md:pt-10"
            >
              <div className="absolute -left-2 top-8 flex h-4 w-4 items-center justify-center rounded-full border border-gold/35 bg-[var(--espresso)] md:-top-2 md:left-8 md:-translate-x-1/2">
                <div className="h-1.5 w-1.5 rounded-full bg-gold/60" />
              </div>
              <p className="mb-6 font-display text-5xl text-gold/15 md:pl-14">{step.num}</p>
              <div className="md:pl-14">
                <h3 className="mb-3 font-display text-2xl text-cream">{step.title}</h3>
                <p className="text-sm leading-relaxed text-cream/50">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Packages ─────────────────────────────────────────────────────────────────
function Packages() {
  const { data: packages = [] } = useQuery(publicPackagesQuery());
  const { data: settings } = useSiteSettings();

  if (packages.length === 0) return null;

  return (
    <section id="packages" className="relative bg-[var(--background)] py-28 md:py-44">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_65%_55%_at_50%_0%,rgba(201,169,110,0.06),transparent)]" />

      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mb-16 text-center"
        >
          <motion.p variants={fadeUp} className="mb-3 text-[9px] uppercase tracking-[0.58em] text-gold/55">Investment</motion.p>
          <motion.h2 variants={fadeUp} className="font-display text-4xl text-cream md:text-5xl">Packages</motion.h2>
          <motion.p variants={fadeUp} className="mt-3 text-sm text-cream/40">Tailored packages for every love story</motion.p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid gap-5 md:grid-cols-3"
        >
          {packages.map((pkg) => (
            <motion.div
              key={pkg.id}
              variants={fadeUp}
              whileHover={{ y: -7 }}
              transition={{ duration: 0.35 }}
              className={`relative flex flex-col border p-9 ${pkg.is_popular ? "border-gold bg-[rgba(201,169,110,0.05)] shadow-[0_0_80px_rgba(201,169,110,0.1)]" : "border-gold/12 hover:border-gold/28"}`}
            >
              {pkg.is_popular && (
                <div className="absolute -top-px left-1/2 -translate-x-1/2 whitespace-nowrap bg-gold px-4 py-1 text-[8px] uppercase tracking-[0.5em] text-[var(--espresso)]">
                  Most Popular
                </div>
              )}
              <p className="text-[8px] uppercase tracking-[0.5em] text-gold/55">{pkg.name}</p>
              <p className="mt-3 font-display text-4xl text-cream">{pkg.price}</p>
              <p className="mt-3 text-sm leading-relaxed text-cream/50">{pkg.description}</p>
              <div className="my-7 h-px bg-gold/12" />
              <ul className="flex-1 space-y-3">
                {((pkg.features ?? []) as string[]).map((f: string) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-cream/65">
                    <span className="h-px w-4 shrink-0 bg-gold/45" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href={`https://wa.me/${settings?.contact_phone?.replace(/\D/g, "") ?? "94777807619"}?text=${encodeURIComponent(`Hi! I'm interested in the ${pkg.name} package.`)}`}
                target="_blank" rel="noreferrer"
                className={`mt-9 block py-3.5 text-center text-[10px] uppercase tracking-[0.4em] transition-all ${pkg.is_popular ? "bg-gold text-[var(--espresso)] hover:brightness-110" : "border border-gold/35 text-gold hover:bg-gold/8"}`}
              >
                Enquire
              </a>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
function Testimonials() {
  const { data: testimonials = [] } = useQuery(publicTestimonialsQuery());
  const [current, setCurrent] = useState(0);

  if (testimonials.length === 0) return null;
  const t = testimonials[current];

  return (
    <section className="relative overflow-hidden bg-[var(--espresso)] py-28 md:py-44">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_50%_50%,rgba(201,169,110,0.04),transparent)]" />

      <div className="mx-auto max-w-4xl px-6 text-center">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mb-14"
        >
          <motion.p variants={fadeUp} className="mb-3 text-[9px] uppercase tracking-[0.58em] text-gold/55">Client Love</motion.p>
          <motion.h2 variants={fadeUp} className="font-display text-4xl text-cream md:text-5xl">Testimonials</motion.h2>
        </motion.div>

        <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Giant decorative quote */}
          <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 font-display text-[14rem] leading-none text-gold/[0.05] select-none">
            &ldquo;
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -22 }}
              transition={{ duration: 0.55 }}
            >
              <div className="mb-8 flex justify-center gap-1">
                {Array.from({ length: t.rating ?? 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />
                ))}
              </div>
              <p className="mx-auto max-w-3xl font-display text-2xl leading-relaxed text-cream/88 md:text-[1.75rem]">
                &ldquo;{t.review_text}&rdquo;
              </p>
              <div className="mt-8 flex flex-col items-center gap-1">
                <p className="font-display text-xl text-cream">{t.client_name}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="mt-14 flex items-center justify-center gap-7">
            <button
              onClick={() => setCurrent((i) => (i - 1 + testimonials.length) % testimonials.length)}
              className="flex h-10 w-10 items-center justify-center border border-gold/22 text-cream/45 transition-all hover:border-gold hover:text-gold"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`rounded-full transition-all duration-400 ${i === current ? "h-1.5 w-7 bg-gold" : "h-1.5 w-1.5 bg-white/18 hover:bg-white/38"}`}
                />
              ))}
            </div>
            <button
              onClick={() => setCurrent((i) => (i + 1) % testimonials.length)}
              className="flex h-10 w-10 items-center justify-center border border-gold/22 text-cream/45 transition-all hover:border-gold hover:text-gold"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Contact ──────────────────────────────────────────────────────────────────
function Contact() {
  const { data: settings } = useSiteSettings();
  const { data: socialLinks = [] } = useQuery(socialLinksQuery());
  const [form, setForm] = useState({ name: "", email: "", phone: "", service: "", message: "" });
  const [sending, setSending] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { toast.error("Please fill in all required fields."); return; }
    setSending(true);
    try {
      await submitContactForm(form);
      toast.success("Message sent! We’ll be in touch soon.");
      setForm({ name: "", email: "", phone: "", service: "", message: "" });
    } catch {
      toast.error("Something went wrong. Try WhatsApp instead.");
    } finally { setSending(false); }
  };

  const socialMap: Record<string, React.FC<{ className?: string }>> = {
    instagram: Instagram, facebook: Facebook, youtube: Play, whatsapp: MessageCircle,
    tiktok: Play, twitter: X, website: Link2,
  };

  const waNumber = settings?.contact_phone?.replace(/\D/g, "") ?? "94777807619";
  const contactInfo = [
    { Icon: MapPin, text: settings?.contact_location ?? "Sri Lanka · Japan" },
    { Icon: MessageCircle, text: settings?.contact_email ?? "hello@lceylon.com" },
    { Icon: Phone, text: settings?.contact_phone ?? `+${waNumber}` },
  ];

  return (
    <section id="contact" className="relative bg-[var(--background)] py-28 md:py-44">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(201,169,110,0.07),transparent)]" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-16 md:grid-cols-2 md:gap-24">
          {/* Info */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
          >
            <motion.p variants={fadeUp} className="mb-3 text-[9px] uppercase tracking-[0.58em] text-gold/55">Get in Touch</motion.p>
            <motion.h2 variants={fadeUp} className="font-display text-4xl leading-[1.08] text-cream md:text-5xl">
              Let&#39;s Tell Your<br />Story Together
            </motion.h2>
            <motion.div variants={fadeUp} className="my-6 h-px w-14 bg-gold/35" />
            <motion.p variants={fadeUp} className="text-sm leading-relaxed text-cream/55">
              Ready to begin? We&#39;d love to hear about your day. Reach out via the form or connect directly — we typically respond within 24 hours.
            </motion.p>

            <motion.div variants={stagger} className="mt-10 space-y-5">
              {contactInfo.map(({ Icon, text }, i) => (
                <motion.div key={i} variants={fadeUp} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-gold/18">
                    <Icon className="h-4 w-4 text-gold/65" />
                  </div>
                  <p className="text-sm text-cream/60">{text}</p>
                </motion.div>
              ))}
            </motion.div>

            {socialLinks.length > 0 && (
              <motion.div variants={fadeUp} className="mt-10 flex gap-2.5">
                {socialLinks.map((link) => {
                  const SIcon = socialMap[link.platform] ?? Link2;
                  return (
                    <a key={link.id} href={link.url} target="_blank" rel="noreferrer"
                      className="flex h-10 w-10 items-center justify-center border border-gold/18 text-cream/42 transition-all hover:border-gold hover:text-gold">
                      <SIcon className="h-4 w-4" />
                    </a>
                  );
                })}
              </motion.div>
            )}

            <motion.div variants={fadeUp} className="mt-10">
              <a
                href={`https://wa.me/${waNumber}?text=${encodeURIComponent("Hi Lov'Ceylon! I'd like to book a session.")}`}
                target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2.5 bg-[#25d366] px-6 py-3.5 text-[10px] uppercase tracking-[0.4em] text-white transition-all hover:-translate-y-0.5 hover:brightness-110"
              >
                <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
              </a>
            </motion.div>
          </motion.div>

          {/* Form */}
          <motion.form
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {[
              { k: "name" as const, label: "Your Name *", type: "text", ph: "First & last name" },
              { k: "email" as const, label: "Email Address *", type: "email", ph: "you@example.com" },
              { k: "phone" as const, label: "Phone / WhatsApp", type: "tel", ph: "+94 77 xxx xxxx" },
            ].map(({ k, label, type, ph }) => (
              <motion.div key={k} variants={fadeUp}>
                <label className="mb-2 block text-[8px] uppercase tracking-[0.5em] text-cream/45">{label}</label>
                <input type={type} placeholder={ph} value={form[k]} onChange={set(k)}
                  className="w-full border border-gold/12 bg-transparent px-4 py-3 text-sm text-cream outline-none placeholder:text-cream/22 focus:border-gold/42 transition-colors" />
              </motion.div>
            ))}
            <motion.div variants={fadeUp}>
              <label className="mb-2 block text-[8px] uppercase tracking-[0.5em] text-cream/45">Service</label>
              <select value={form.service} onChange={set("service")}
                className="w-full border border-gold/12 bg-[var(--background)] px-4 py-3 text-sm text-cream outline-none focus:border-gold/42 transition-colors">
                <option value="">Select a service</option>
                <option>Wedding Photography</option>
                <option>Fashion &amp; Portrait</option>
                <option>Homecoming &amp; Events</option>
              </select>
            </motion.div>
            <motion.div variants={fadeUp}>
              <label className="mb-2 block text-[8px] uppercase tracking-[0.5em] text-cream/45">Message *</label>
              <textarea rows={5} placeholder="Tell us about your event — date, venue, vision..." value={form.message} onChange={set("message")}
                className="w-full resize-none border border-gold/12 bg-transparent px-4 py-3 text-sm text-cream outline-none placeholder:text-cream/22 focus:border-gold/42 transition-colors" />
            </motion.div>
            <motion.div variants={fadeUp}>
              <button type="submit" disabled={sending}
                className="w-full bg-gold py-4 text-[10px] uppercase tracking-[0.48em] text-[var(--espresso)] transition-all hover:brightness-110 disabled:opacity-50">
                {sending ? "Sending…" : "Send Message"}
              </button>
            </motion.div>
          </motion.form>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  const { data: settings } = useSiteSettings();
  const { data: socialLinks = [] } = useQuery(socialLinksQuery());
  const siteName = settings?.site_name ?? "Lov’Ceylon";
  const apoIdx = siteName.indexOf("’");
  const nameBefore = apoIdx >= 0 ? siteName.slice(0, apoIdx) : siteName;
  const fullAfter = apoIdx >= 0 ? siteName.slice(apoIdx + 1) : "";
  const nameAfter = fullAfter.includes(" ") ? fullAfter.slice(0, fullAfter.indexOf(" ")) : fullAfter;

  const socialMap: Record<string, React.FC<{ className?: string }>> = {
    instagram: Instagram, facebook: Facebook, youtube: Play, whatsapp: MessageCircle,
    tiktok: Play, twitter: X, website: Link2,
  };

  return (
    <footer className="relative overflow-hidden border-t border-gold/8 bg-[var(--espresso)] py-20 md:py-28">
      {/* Ambient radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_60%_at_50%_0%,rgba(201,169,110,0.07),transparent)]" />

      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-col items-center text-center"
        >
          {/* ── Large animated brand ── */}
          <motion.div variants={scaleIn} className="relative">
            <div className="relative overflow-hidden">
              <h2 className="font-display text-[clamp(1.8rem,4.5vw,3rem)] leading-none tracking-tight text-cream [text-shadow:0_4px_40px_rgba(0,0,0,0.55)]">
                {nameBefore}
                <span className="relative text-gold inline-block overflow-hidden">
                  &#39;
                  {/* Shimmer sweep */}
                  <motion.span
                    aria-hidden
                    animate={{ x: ["-350%", "500%"] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" }}
                    className="pointer-events-none absolute inset-y-0 w-6 block opacity-80"
                    style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.95),transparent)" }}
                  />
                </span>
                {nameAfter || "Ceylon"}
              </h2>
            </div>

            {/* Animated underline */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, delay: 0.25, ease }}
              className="mt-3 h-px origin-left bg-gradient-to-r from-gold/55 via-gold/30 to-transparent"
            />

            <p className="mt-2.5 text-[7px] uppercase tracking-[0.68em] text-gold/48">
              Photography · Sri Lanka · Japan
            </p>
          </motion.div>

          {/* Nav links */}
          <motion.nav variants={stagger} className="mt-10 flex flex-wrap justify-center gap-7">
            {[["Story", "#about"], ["Gallery", "#work"], ["Packages", "#packages"], ["Services", "#services"], ["Contact", "#contact"]].map(([l, h]) => (
              <motion.a key={l} variants={fadeIn} href={h} className="text-[8px] uppercase tracking-[0.45em] text-cream/35 transition-colors hover:text-gold">{l}</motion.a>
            ))}
          </motion.nav>

          {/* Social icons */}
          {socialLinks.length > 0 && (
            <motion.div variants={fadeUp} className="mt-8 flex gap-2.5">
              {socialLinks.map((link) => {
                const SIcon = socialMap[link.platform] ?? Link2;
                return (
                  <a key={link.id} href={link.url} target="_blank" rel="noreferrer"
                    className="flex h-8 w-8 items-center justify-center border border-gold/12 text-cream/30 transition-all hover:border-gold/38 hover:text-gold hover:shadow-[0_0_12px_rgba(201,169,110,0.2)]">
                    <SIcon className="h-3.5 w-3.5" />
                  </a>
                );
              })}
            </motion.div>
          )}

          <motion.div variants={fadeUp} className="mt-10 h-px w-16 bg-gold/18" />
          <motion.p variants={fadeIn} className="mt-5 text-[7.5px] text-cream/22">
            {settings?.footer_text ?? `© 2026 ${siteName} Photography · All rights reserved`}
          </motion.p>
        </motion.div>
      </div>
    </footer>
  );
}

// ─── Under Construction ───────────────────────────────────────────────────────
function UnderConstruction({ onDismiss, siteName }: { onDismiss: () => void; siteName: string }) {
  const apoIdx = siteName.indexOf("'");
  const nameBefore = apoIdx >= 0 ? siteName.slice(0, apoIdx) : siteName;
  const fullAfterUC = apoIdx >= 0 ? siteName.slice(apoIdx + 1) : "";
  const nameAfter = fullAfterUC.includes(" ") ? fullAfterUC.slice(0, fullAfterUC.indexOf(" ")) : fullAfterUC;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
      className="fixed inset-0 z-[400] flex flex-col items-center justify-center bg-[var(--espresso)] px-6 text-center"
    >
      {/* Radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_62%_48%_at_50%_38%,rgba(201,169,110,0.14),transparent)]" />
      <div className="absolute inset-0 grid-pattern opacity-10" />

      {/* Corner marks */}
      {[
        "left-6 top-6 border-l border-t",
        "right-6 top-6 border-r border-t",
        "bottom-6 left-6 border-b border-l",
        "bottom-6 right-6 border-b border-r",
      ].map((cls, i) => (
        <div key={i} className={`pointer-events-none absolute h-8 w-8 border-gold/40 ${cls}`} />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.9, ease }}
        className="relative flex flex-col items-center gap-0"
      >
        {/* Rotating aperture with glow */}
        <div className="relative mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/25"
          >
            <Aperture className="h-7 w-7 text-gold" strokeWidth={0.9} />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.6, 1], opacity: [0.2, 0, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-gold/15"
          />
        </div>

        <p className="mb-5 text-[9px] uppercase tracking-[0.65em] text-gold/60">Coming Soon</p>

        <div className="relative overflow-hidden">
          <h1 className="font-display text-[clamp(3rem,10vw,7rem)] leading-none tracking-tight text-cream [text-shadow:0_4px_36px_rgba(0,0,0,0.6)]">
            {nameBefore}<span className="text-gold relative">&#39;
              <motion.span
                aria-hidden
                animate={{ x: ["-300%", "400%"] }}
                transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
                className="pointer-events-none absolute inset-y-0 w-5 block opacity-75"
                style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.95),transparent)" }}
              />
            </span>{nameAfter || "Ceylon"}
          </h1>
        </div>

        <div className="my-5 h-px w-48 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

        <p className="max-w-sm text-[13px] leading-relaxed text-cream/50">
          We&#39;re putting the finishing touches on our new portfolio. Something beautiful is on its way.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <button
            onClick={onDismiss}
            className="group inline-flex items-center gap-2 border border-gold/40 bg-[rgba(14,8,4,0.4)] px-8 py-3.5 text-[10px] uppercase tracking-[0.42em] text-gold backdrop-blur-sm transition-all hover:bg-gold hover:text-[var(--espresso)]"
          >
            Visit Site Anyway
            <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>

        <p className="mt-8 text-[8px] uppercase tracking-[0.5em] text-cream/20">
          Photography · Sri Lanka · Japan
        </p>
      </motion.div>
    </motion.div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); },
      { threshold: 0.12 },
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    const mo = new MutationObserver((muts) => {
      muts.forEach((m) => m.addedNodes.forEach((n) => {
        if (n.nodeType !== Node.ELEMENT_NODE) return;
        const el = n as Element;
        if (el.classList?.contains("reveal")) io.observe(el);
        el.querySelectorAll?.(".reveal").forEach((c) => io.observe(c));
      }));
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, []);
}

function Index() {
  const { data: settings } = useSiteSettings();
  const { progress, visible } = useLoader();
  const [showConstruction, setShowConstruction] = useState(
    () => sessionStorage.getItem("lc_bypass") !== "1"
  );
  useReveal();
  useSeoMeta();
  useThemeApplicator();

  const marqueeWords = settings?.marquee_words
    ?.split(",")
    .map((w: string) => w.trim())
    .filter(Boolean);

  const show = {
    marquee:      settings?.show_marquee      ?? true,
    work:         settings?.show_work         ?? true,
    story:        settings?.show_story        ?? true,
    process:      settings?.show_process      ?? true,
    services:     settings?.show_services     ?? true,
    packages:     settings?.show_packages     ?? true,
    testimonials: settings?.show_testimonials ?? true,
  };

  const handleDismiss = () => {
    sessionStorage.setItem("lc_bypass", "1");
    setShowConstruction(false);
  };

  return (
    <>
      <AnimatePresence>
        {showConstruction && <UnderConstruction onDismiss={handleDismiss} siteName={settings?.site_name ?? "Lov'Ceylon"} />}
      </AnimatePresence>
      <CustomCursor />
      <Loader progress={progress} visible={visible} />
      <Toaster />
      {/* Floating call button — mobile only */}
      {settings?.contact_phone && (
        <a
          href={`tel:${settings.contact_phone}`}
          aria-label="Call us"
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gold shadow-[0_4px_28px_rgba(201,169,110,0.55)] transition-all hover:brightness-110 active:scale-95 md:hidden"
        >
          <Phone className="h-5 w-5 text-[var(--espresso)]" />
        </a>
      )}
      <Nav />
      <Hero />
      {show.marquee     && <Marquee words={marqueeWords} />}
      <Philosophy />
      {show.work        && <Work />}
      {show.story       && <About />}
      {show.services    && <Services />}
      {show.process     && <Process />}
      {show.packages    && <Packages />}
      {show.testimonials && <Testimonials />}
      <Contact />
      <Footer />
    </>
  );
}
