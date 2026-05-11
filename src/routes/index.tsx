import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
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
  MapPin,
  MessageCircle,
  Play,
  Sparkles,
  Star,
  X,
} from "lucide-react";

import portrait from "@/assets/portrait.png";
import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import g4 from "@/assets/gallery-4.jpg";
import g5 from "@/assets/gallery-5.jpg";
import g6 from "@/assets/gallery-6.jpg";
import w1 from "@/assets/wedding-1.jpg";
import w2 from "@/assets/wedding-2.jpg";
import w3 from "@/assets/wedding-3.jpg";
import e1 from "@/assets/event-1.jpg";
import e2 from "@/assets/event-2.jpg";
import e3 from "@/assets/event-3.jpg";
import p1 from "@/assets/portrait-1.jpg";
import p2 from "@/assets/portrait-2.jpg";
import p3 from "@/assets/portrait-3.jpg";
import uPortraitBw from "@/assets/work-portrait-bw.jpg";
import uHandsTattoo from "@/assets/work-hands-tattoo.jpg";
import uSaree from "@/assets/work-saree-portrait.jpg";
import uWeddingCouple from "@/assets/work-wedding-couple.jpg";
import uCoupleCar from "@/assets/work-couple-car.png";

export const Route = createFileRoute("/")({
  component: Index,
});

type Category = "weddings" | "portraits" | "events";
type Photo = { src: string; title: string; location?: string; tall?: boolean };

const collections: Record<Category, { label: string; tag: string; intro: string; photos: Photo[] }> = {
  weddings: {
    label: "Weddings",
    tag: "Love, but with atmosphere.",
    intro: "A blend of stillness, softness, and moments that feel larger than the frame.",
    photos: [
      { src: uWeddingCouple, title: "Forehead to Forehead", location: "Colombo", tall: true },
      { src: uHandsTattoo, title: "A Promise in Hands", location: "Galle" },
      { src: uCoupleCar, title: "Sunlit Getaway", location: "Kandy", tall: true },
      { src: w1, title: "Golden Vows", location: "Galle" },
      { src: w2, title: "Under the Lights", location: "Kandy" },
      { src: w3, title: "Sacred Heirloom", location: "Colombo", tall: true },
      { src: g2, title: "First Dance", location: "Bentota" },
      { src: g3, title: "Quiet Hour", location: "Nuwara Eliya" },
    ],
  },
  portraits: {
    label: "Portraits",
    tag: "Quiet confidence with character.",
    intro: "Editorial portrait work shaped by texture, contrast, and natural expression.",
    photos: [
      { src: uPortraitBw, title: "Monochrome Composure", location: "Studio 01", tall: true },
      { src: uSaree, title: "Saree and Lamplight", location: "Colombo", tall: true },
      { src: p1, title: "Shadow and Skin", location: "Studio 02" },
      { src: p2, title: "Window Light", location: "Colombo" },
      { src: p3, title: "Maker's Hands", location: "Matale", tall: true },
      { src: g1, title: "Eyes That Speak", location: "Studio 02" },
      { src: g4, title: "Stillness", location: "Galle Fort" },
    ],
  },
  events: {
    label: "Events",
    tag: "Motion, rhythm, and memory.",
    intro: "High-energy coverage with a cinematic eye for mood, people, and atmosphere.",
    photos: [
      { src: e1, title: "Stage Light Symphony", location: "Colombo", tall: true },
      { src: e2, title: "Wish and Flame", location: "Private Venue" },
      { src: e3, title: "Floors Alive", location: "Mount Lavinia", tall: true },
      { src: g5, title: "After Hours", location: "Negombo" },
      { src: g6, title: "Backstage", location: "Colombo" },
    ],
  },
};

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
    const els = document.querySelectorAll(".reveal");
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

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
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

function Loader({ progress, visible }: { progress: number; visible: boolean }) {
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
            Dopamine loading
          </span>
          <span>Sri Lanka</span>
        </div>

        <div className="mx-auto flex max-w-4xl flex-1 flex-col items-center justify-center text-center">
          <div className="loader-aperture mb-10 flex h-28 w-28 items-center justify-center rounded-full border border-gold/30">
            <Aperture className="h-12 w-12 text-gold" strokeWidth={1} />
          </div>
          <p className="text-[10px] uppercase tracking-[0.6em] text-gold/80">Visual story in motion</p>
          <h1 className="mt-6 max-w-3xl font-display text-5xl leading-none text-cream md:text-7xl lg:text-[7.5rem]">
            Dopamine,
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    ["About", "#about"],
    ["Work", "#work"],
    ["Story", "#story"],
    ["Strengths", "#services"],
    ["Contact", "#contact"],
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "border-b border-border bg-[var(--espresso)]/82 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <a href="#top" className="group flex items-center gap-3 text-cream drop-shadow-[0_1px_8px_rgba(0,0,0,0.7)]">
          <Aperture className="h-5 w-5 text-gold transition-transform duration-700 group-hover:rotate-90" strokeWidth={1.4} />
          <span className="font-display text-2xl tracking-wide">Dopamine</span>
        </a>
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
        <a
          href="#contact"
          className="hidden border border-gold/60 bg-[rgba(14,8,4,0.35)] px-4 py-2 text-[10px] uppercase tracking-[0.32em] text-gold backdrop-blur-sm transition-all hover:bg-gold hover:text-[var(--espresso)] md:inline-flex"
        >
          Contact
        </a>
      </div>
    </header>
  );
}

function Hero() {
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      if (bgRef.current) {
        bgRef.current.style.transform = `translate3d(0, ${window.scrollY * 0.18}px, 0) scale(1.08)`;
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section id="top" className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-x-4 bottom-4 top-22 z-[1] border border-[var(--bronze)]/60 shadow-[inset_0_0_0_1px_rgba(139,107,61,0.35)] md:inset-x-6 md:bottom-6 md:top-24 lg:inset-x-8 lg:bottom-8 lg:top-26" />
      <div className="absolute inset-x-4 bottom-4 top-22 overflow-hidden md:inset-x-6 md:bottom-6 md:top-24 lg:inset-x-8 lg:bottom-8 lg:top-26">
        <div
          ref={bgRef}
          className="absolute inset-0 bg-cover bg-top"
          style={{ backgroundImage: `url(${uCoupleCar})`, backgroundPosition: "center top" }}
        />
      </div>
      {/* Almost transparent at top so image text is visible; heavy fade only at the very bottom for content legibility */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,8,4,0.14)_0%,rgba(14,8,4,0.0)_18%,rgba(14,8,4,0.0)_52%,rgba(14,8,4,0.68)_80%,rgba(14,8,4,0.92)_100%)]" />

      <div className="relative flex min-h-screen flex-col justify-end px-6 pb-16 md:pb-20">
        <div className="mx-auto flex w-full max-w-7xl justify-center">
          <div className="flex max-w-3xl flex-col items-center text-center">
            <div className="inline-flex items-center gap-3 rounded-full border border-gold/30 bg-[rgba(14,8,4,0.55)] px-4 py-2 text-[10px] uppercase tracking-[0.4em] text-gold backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-gold pulse-soft" />
            Portfolio of a Sri Lankan visual storyteller
            </div>

            <h1 className="mt-6 max-w-2xl font-display text-4xl leading-[0.92] text-cream drop-shadow-[0_2px_20px_rgba(0,0,0,0.55)] md:text-5xl lg:text-6xl">
              Frames that reveal
              <br />
              <span className="italic text-gradient-gold">how the photographer sees.</span>
            </h1>

            <a
              href="#about"
              className="group mt-8 inline-flex items-center gap-3 bg-gold px-6 py-3.5 text-[11px] uppercase tracking-[0.32em] text-[var(--espresso)] transition-transform duration-300 hover:-translate-y-0.5"
            >
              Discover the story
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </a>
          </div>
        </div>
      </div>

      <a
        href="#about"
        aria-label="Scroll down"
        className="absolute bottom-6 right-8 flex flex-col items-center gap-2 text-gold/90"
      >
        <span className="text-[10px] uppercase tracking-[0.4em]">Scroll</span>
        <ArrowDown className="h-4 w-4 animate-bounce" />
      </a>
    </section>
  );
}

function Marquee() {
  const words = ["Dopamine", "Portraits", "Weddings", "Events", "Editorial", "Mood", "Light"];
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
  return (
    <section id="about" className="relative overflow-hidden border-b border-border bg-[var(--espresso)] px-6 py-28 md:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,171,95,0.07),transparent_32%)]" />
      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">

          <div className="reveal relative">
            <div className="overflow-hidden rounded-[2.4rem] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.45)]">
              <img
                src={portrait}
                alt="Tharindu Viduranga — Founder, Dopamine"
                className="h-[46rem] w-full object-cover object-top"
                loading="eager"
              />
            </div>
            <div className="absolute -bottom-5 left-6 glass-panel px-6 py-4 shadow-xl">
              <p className="text-[10px] uppercase tracking-[0.35em] text-gold">Founder / Visual Storyteller</p>
              <p className="mt-1 font-display text-2xl text-cream">Tharindu Viduranga</p>
            </div>
          </div>

          <div className="reveal pt-8 lg:pt-0">
            <p className="mb-3 flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-gold">
              <span className="h-px w-10 bg-gold" /> About
            </p>
            <h2 className="font-display text-5xl leading-[0.94] text-cream md:text-6xl lg:text-7xl">
              The eye behind
              <br />
              <span className="italic text-gold">Dopamine.</span>
            </h2>
            <p className="mt-8 max-w-lg text-base leading-relaxed text-cream/72 md:text-lg">
              This portfolio is built to present the visual voice behind Dopamine: wedding stories, portraits, and event frames shaped with warmth, atmosphere, and a cinematic eye.
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
              {[
                ["120+", "Wedding stories told"],
                ["5K+", "Portraits and frames delivered"],
                ["Island-wide", "Available across Sri Lanka"],
              ].map(([value, label]) => (
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
          <img src={uSaree} alt="Saree portrait by lamplight" className="h-[32rem] w-full rounded-[1.5rem] object-cover md:h-[42rem]" loading="lazy" />
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
  photos: Photo[];
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
        <img src={photo.src} alt={photo.title} className="max-h-[78vh] max-w-[92vw] rounded-[1.6rem] object-contain shadow-2xl shadow-black/40" />
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
  const [active, setActive] = useState<Category>("weddings");
  const [lightbox, setLightbox] = useState<number | null>(null);
  const cats = useMemo(() => Object.keys(collections) as Category[], []);
  const data = collections[active];

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
            The work section is now framed as a curated portfolio archive so people notice visual range and consistency, not just what services are available.
          </p>
        </div>

        <div className="reveal mb-10 flex flex-wrap items-center gap-3">
          {cats.map((category, index) => {
            const isActive = category === active;
            return (
              <button
                key={category}
                onClick={() => setActive(category)}
                className={`group relative overflow-hidden rounded-full border px-5 py-3 text-[11px] uppercase tracking-[0.3em] transition-all ${
                  isActive
                    ? "border-gold bg-gold text-[var(--espresso)]"
                    : "border-white/12 bg-white/3 text-cream/70 hover:border-gold/40 hover:text-gold"
                }`}
              >
                <span className="mr-3 text-[10px] opacity-60">{String(index + 1).padStart(2, "0")}</span>
                {collections[category].label}
              </button>
            );
          })}
        </div>

        <div className="mb-10 grid gap-5 lg:grid-cols-[0.74fr_1.26fr]">
          <div className="reveal glass-panel flex flex-col justify-between p-8">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-gold">Current selection</p>
              <h3 className="mt-4 font-display text-4xl text-cream md:text-5xl">{data.label}</h3>
              <p className="mt-4 font-display text-2xl italic text-gold/90">{data.tag}</p>
              <p className="mt-6 max-w-sm text-sm leading-relaxed text-cream/68">{data.intro}</p>
            </div>
            <div className="mt-8 border-t border-white/10 pt-6 text-[10px] uppercase tracking-[0.35em] text-cream/45">
              Open any frame to view it as a portfolio piece
            </div>
          </div>

          <div className="reveal overflow-hidden rounded-[2rem] border border-white/10 bg-black/20 p-3">
            <img
              src={data.photos[0]?.src}
              alt={data.photos[0]?.title}
              className="h-[22rem] w-full rounded-[1.5rem] object-cover md:h-[30rem]"
              loading="lazy"
            />
          </div>
        </div>

        <div key={active} className="grid auto-rows-[210px] grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {data.photos.map((photo, index) => (
            <button
              key={`${active}-${photo.title}-${index}`}
              onClick={() => setLightbox(index)}
              className={`group relative overflow-hidden rounded-[1.5rem] text-left ${photo.tall ? "row-span-2" : ""} ${
                index === 0 ? "col-span-2" : ""
              }`}
              style={{ opacity: 0, animation: `fade-in 0.7s ease-out ${index * 0.08}s forwards` }}
            >
              <img
                src={photo.src}
                alt={photo.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,10,6,0.02),rgba(16,10,6,0.16)_40%,rgba(16,10,6,0.92)_100%)]" />
              <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: "linear-gradient(145deg, color-mix(in oklab, var(--gold) 22%, transparent), transparent 55%)" }} />
              <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-gold">
                    {String(index + 1).padStart(2, "0")} / {data.label}
                  </p>
                  <p className="mt-2 font-display text-xl italic text-cream md:text-2xl">{photo.title}</p>
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
      </div>

      {lightbox !== null ? (
        <Lightbox
          photos={data.photos}
          index={lightbox}
          onClose={() => setLightbox(null)}
          setIndex={(value) => setLightbox(value)}
        />
      ) : null}
    </section>
  );
}

function Process() {
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
          <img src={uHandsTattoo} alt="Hands detail portrait" className="h-[28rem] w-full object-cover md:h-[38rem]" loading="lazy" />
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

        <div className="grid gap-5 md:grid-cols-3">
          {services.map((service, index) => (
            <div key={service.name} className="reveal glass-panel group p-8 transition-transform duration-500 hover:-translate-y-2">
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Quote() {
  return (
    <section className="grain relative overflow-hidden px-6 py-28 md:py-36">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,171,95,0.08),transparent_40%)]" />
      <div className="reveal relative mx-auto max-w-5xl text-center">
        <span className="font-display text-6xl text-gold/35 md:text-7xl">"</span>
        <p className="font-display text-4xl italic leading-[1.08] text-cream md:text-6xl lg:text-7xl">
          A strong portfolio should show
          <br />
          not only the moment, but the mind behind it.
        </p>
        <div className="mx-auto mt-10 h-px w-24 bg-gold" />
        <p className="mt-6 text-[10px] uppercase tracking-[0.5em] text-gold">Dopamine portfolio / Sri Lanka</p>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-7xl px-6 py-28 md:py-32">
      <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="reveal overflow-hidden rounded-[2rem] border border-white/10">
          <img src={uWeddingCouple} alt="Wedding couple smiling" className="h-[30rem] w-full object-cover md:h-[40rem]" loading="lazy" />
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
              <a href="mailto:hello@dopamine.lk" className="mt-3 inline-block font-display text-2xl text-cream hover:text-gold">
                hello@dopamine.lk
              </a>
            </div>
            <div className="glass-panel p-5">
              <p className="text-[10px] uppercase tracking-[0.32em] text-cream/45">Based in</p>
              <p className="mt-3 font-display text-2xl text-cream">Colombo, Sri Lanka</p>
            </div>
          </div>

          <form
            className="mt-10 space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              (e.target as HTMLFormElement).reset();
            }}
          >
            {[
              { label: "Name", type: "text" },
              { label: "Email", type: "email" },
            ].map((field) => (
              <div key={field.label}>
                <label className="mb-2 block text-[10px] uppercase tracking-[0.32em] text-cream/52">{field.label}</label>
                <input
                  type={field.type}
                  required
                  className="w-full rounded-2xl border border-white/10 bg-white/4 px-5 py-4 text-cream outline-none backdrop-blur-sm transition-colors focus:border-gold"
                />
              </div>
            ))}

            <div>
              <label className="mb-2 block text-[10px] uppercase tracking-[0.32em] text-cream/52">Project Type</label>
              <select className="w-full rounded-2xl border border-white/10 bg-[var(--espresso)] px-5 py-4 text-cream outline-none transition-colors focus:border-gold">
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
                className="w-full resize-none rounded-[1.6rem] border border-white/10 bg-white/4 px-5 py-4 text-cream outline-none backdrop-blur-sm transition-colors focus:border-gold"
              />
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="submit"
                className="group inline-flex items-center gap-3 bg-gold px-8 py-4 text-[11px] uppercase tracking-[0.32em] text-[var(--espresso)] transition-transform duration-300 hover:-translate-y-0.5"
              >
                Send inquiry
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </button>
              <div className="flex gap-3">
                {[Instagram, Facebook, MessageCircle].map((Icon, index) => (
                  <a
                    key={index}
                    href="#"
                    aria-label="Social link"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 text-cream/75 transition-all hover:-translate-y-0.5 hover:border-gold hover:text-gold"
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.4} />
                  </a>
                ))}
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-[var(--espresso)] px-6 py-14 text-center">
      <Aperture className="mx-auto h-6 w-6 text-gold" strokeWidth={1.2} />
      <p className="mt-4 font-display text-4xl text-cream">Dopamine</p>
      <div className="mx-auto mt-6 h-px w-16 bg-gold" />
      <p className="mt-6 text-[10px] uppercase tracking-[0.4em] text-cream/50">
        Copyright 2026 Dopamine by Tharindu Viduranga
      </p>
    </footer>
  );
}

function Index() {
  useReveal();
  const { progress, visible } = useLoader();

  return (
    <>
      <Loader progress={progress} visible={visible} />
      <main className="min-h-screen overflow-x-hidden bg-background text-cream">
        <CustomCursor />
        <Nav />
        <Hero />
        <Marquee />
        <About />
        <Story />
        <Work />
        <Process />
        <Services />
        <Quote />
        <Contact />
        <Footer />
      </main>
    </>
  );
}
