import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Aperture, ArrowLeft, ArrowUpRight, ChevronLeft, ChevronRight, MapPin, X } from "lucide-react";
import { categoriesQuery, photosQuery } from "@/lib/queries";
import type { Photo } from "@/lib/types";
import { useSiteSettings } from "@/hooks/use-site-settings";

export const Route = createFileRoute("/work/$category")({ component: WorkGallery });

const ease = [0.16, 1, 0.3, 1] as const;

// ─── Lightbox ────────────────────────────────────────────────────────────────
function Lightbox({ photos, index, onClose, setIndex }: {
  photos: Photo[];
  index: number;
  onClose: () => void;
  setIndex: (i: number) => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIndex((index + 1) % photos.length);
      if (e.key === "ArrowLeft") setIndex((index - 1 + photos.length) % photos.length);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [index, onClose, photos.length, setIndex]);

  const photo = photos[index];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(6,3,1,0.97)] backdrop-blur-md"
      onClick={onClose}
    >
      {/* Film grain overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }} />

      <button onClick={onClose} className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center border border-white/15 bg-white/5 text-cream/60 transition-all hover:border-gold/50 hover:text-gold">
        <X className="h-4 w-4" />
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); setIndex((index - 1 + photos.length) % photos.length); }}
        className="absolute left-4 top-1/2 z-10 -translate-y-1/2 flex h-11 w-11 items-center justify-center border border-white/15 bg-white/5 text-cream/60 transition-all hover:border-gold/50 hover:text-gold"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); setIndex((index + 1) % photos.length); }}
        className="absolute right-4 top-1/2 z-10 -translate-y-1/2 flex h-11 w-11 items-center justify-center border border-white/15 bg-white/5 text-cream/60 transition-all hover:border-gold/50 hover:text-gold"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col items-center gap-5 px-16 md:px-24"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={photo.url}
            alt={photo.title}
            className="max-h-[78vh] max-w-[88vw] object-contain shadow-[0_32px_80px_rgba(0,0,0,0.8)]"
          />
          <div className="flex items-center gap-5">
            {photo.title && <p className="font-display text-lg text-cream/90">{photo.title}</p>}
            {photo.location && (
              <p className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.4em] text-cream/42">
                <MapPin className="h-3 w-3" /> {photo.location}
              </p>
            )}
            <p className="text-[9px] uppercase tracking-[0.4em] text-gold/50">
              {String(index + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Span pattern for masonry feel ───────────────────────────────────────────
function getSpan(i: number): string {
  // Creates a visually balanced, non-uniform layout
  const pattern = [
    "col-span-2 row-span-2",  // 0: large hero
    "col-span-1 row-span-1",  // 1
    "col-span-1 row-span-1",  // 2
    "col-span-1 row-span-2",  // 3: tall
    "col-span-1 row-span-1",  // 4
    "col-span-2 row-span-1",  // 5: wide
    "col-span-1 row-span-1",  // 6
    "col-span-1 row-span-1",  // 7
    "col-span-1 row-span-2",  // 8: tall
    "col-span-2 row-span-1",  // 9: wide
    "col-span-1 row-span-1",  // 10
    "col-span-1 row-span-1",  // 11
  ];
  return pattern[i % pattern.length];
}

// ─── WorkGallery ─────────────────────────────────────────────────────────────
function WorkGallery() {
  const { category: slug } = Route.useParams();
  const [lightbox, setLightbox] = useState<number | null>(null);
  const { data: settings } = useSiteSettings();
  const { data: categories = [] } = useQuery(categoriesQuery());
  const { data: allPhotos = [] } = useQuery(photosQuery());

  const isAll = slug === "all";
  const category = isAll ? null : categories.find((c) => c.slug === slug);
  const photos = isAll ? allPhotos : allPhotos.filter((p) => p.category === slug);

  // Shuffle once on load / when photo count changes
  const shuffledPhotos = useMemo(() => {
    const arr = [...photos];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [photos.length, slug]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = lightbox !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightbox]);

  return (
    <div className="min-h-screen bg-[var(--espresso)]">
      {/* ── Nav ── */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease }}
        className="sticky top-0 z-40 flex items-center justify-between border-b border-white/[0.07] bg-[rgba(14,8,4,0.92)] px-6 py-4 backdrop-blur-xl"
      >
        <Link to="/" className="group flex flex-col items-start leading-none">
          <span className="font-display text-lg text-cream transition-colors group-hover:text-gold">Lov&#39;Ceylon</span>
          <span className="mt-0.5 text-[7px] uppercase tracking-[0.5em] text-gold/60">Photography</span>
        </Link>
        <Link
          to="/"
          className="flex items-center gap-2 text-[9px] uppercase tracking-[0.42em] text-cream/50 transition-colors hover:text-gold"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>
      </motion.header>

      {/* ── Page header ── */}
      <div className="relative overflow-hidden px-6 py-20 md:py-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_0%_50%,rgba(201,169,110,0.07),transparent)]" />
        <motion.div
          initial="hidden"
          animate="visible"
          className="relative mx-auto max-w-7xl"
        >
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease }}
            className="mb-4 flex items-center gap-3 text-[9px] uppercase tracking-[0.5em] text-gold/60"
          >
            <span className="h-px w-8 bg-gold/50" /> Portfolio
          </motion.p>
          <div className="overflow-hidden">
            <motion.h1
              initial={{ y: "105%" }}
              animate={{ y: 0 }}
              transition={{ duration: 1, delay: 0.12, ease }}
              className="font-display text-5xl leading-none text-cream md:text-7xl lg:text-8xl"
            >
              {isAll ? "All Photos" : (category?.label ?? slug)}
            </motion.h1>
          </div>
          {!isAll && category?.tag && (
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-4 font-display text-2xl italic text-gold/70"
            >
              {category.tag}
            </motion.p>
          )}
          {!isAll && category?.intro && (
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-4 max-w-xl text-sm leading-relaxed text-cream/50"
            >
              {category.intro}
            </motion.p>
          )}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-6 text-[9px] uppercase tracking-[0.45em] text-cream/28"
          >
            {shuffledPhotos.length} {shuffledPhotos.length === 1 ? "frame" : "frames"}
          </motion.p>
        </motion.div>
      </div>

      {/* ── Category tabs ── */}
      {categories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="border-b border-white/[0.07] px-6 pb-4"
        >
          <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto pb-2 scrollbar-none">
            <Link
              to="/work/$category"
              params={{ category: "all" }}
              className={`shrink-0 border px-5 py-2 text-[9px] uppercase tracking-[0.4em] transition-all ${
                isAll ? "border-gold bg-gold/10 text-gold" : "border-white/10 text-cream/45 hover:border-gold/35 hover:text-cream/75"
              }`}
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to="/work/$category"
                params={{ category: cat.slug }}
                className={`shrink-0 border px-5 py-2 text-[9px] uppercase tracking-[0.4em] transition-all ${
                  cat.slug === slug && !isAll
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-white/10 text-cream/45 hover:border-gold/35 hover:text-cream/75"
                }`}
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Gallery grid ── */}
      <div className="px-4 py-10 md:px-6 md:py-14">
        <div className="mx-auto max-w-7xl">
          {shuffledPhotos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col items-center justify-center py-40 text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              >
                <Aperture className="mb-5 h-14 w-14 text-gold/25" strokeWidth={0.8} />
              </motion.div>
              <p className="font-display text-3xl text-cream/35">No photos yet</p>
              <p className="mt-2 text-[9px] uppercase tracking-[0.45em] text-cream/20">Check back soon</p>
            </motion.div>
          ) : (
            <div
              className="grid grid-cols-2 gap-1.5 md:grid-cols-3 md:gap-2 lg:gap-2.5"
              style={{ gridAutoRows: "clamp(130px, 22vw, 260px)" }}
            >
              {shuffledPhotos.map((photo, i) => {
                const spanClass = getSpan(i);
                return (
                  <motion.button
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: Math.min(i * 0.04, 0.5), ease }}
                    whileHover={{ scale: 1.015 }}
                    onClick={() => setLightbox(i)}
                    className={`group relative overflow-hidden text-left ${spanClass}`}
                    style={{ willChange: "transform" }}
                  >
                    <img
                      src={photo.url}
                      alt={photo.title}
                      loading={i < 6 ? "eager" : "lazy"}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.07]"
                    />
                    {/* Gradient base */}
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,8,4,0.08)_0%,transparent_35%,transparent_55%,rgba(14,8,4,0.88)_100%)]" />
                    {/* Gold hover wash */}
                    <div
                      className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      style={{ background: "linear-gradient(145deg,rgba(201,169,110,0.18),transparent 60%)" }}
                    />
                    {/* Gold inset border */}
                    <div className="absolute inset-0 border border-transparent transition-all duration-500 group-hover:inset-2 group-hover:border-gold/40" />

                    {/* Bottom info */}
                    <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2 opacity-0 transition-opacity duration-400 group-hover:opacity-100 md:inset-x-4 md:bottom-4">
                      <div>
                        {photo.title && (
                          <p className="font-display text-base leading-tight text-cream md:text-lg">{photo.title}</p>
                        )}
                        {photo.location && (
                          <p className="mt-0.5 flex items-center gap-1 text-[7px] uppercase tracking-[0.35em] text-cream/55">
                            <MapPin className="h-2.5 w-2.5" /> {photo.location}
                          </p>
                        )}
                      </div>
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-gold/50 bg-black/20 text-gold">
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </span>
                    </div>

                    {/* Frame number */}
                    <div className="absolute left-3 top-3 text-[8px] uppercase tracking-[0.4em] text-cream/30 opacity-0 transition-opacity duration-400 group-hover:opacity-100">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom nav ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="border-t border-white/[0.06] px-6 py-12 text-center"
      >
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.45em] text-cream/35 transition-colors hover:text-gold"
        >
          <ArrowLeft className="h-3 w-3" /> Back to home
        </Link>
      </motion.div>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightbox !== null && (
          <Lightbox
            photos={shuffledPhotos}
            index={lightbox}
            onClose={() => setLightbox(null)}
            setIndex={setLightbox}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default WorkGallery;
