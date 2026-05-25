import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { Aperture, ArrowLeft, ArrowUpRight, ChevronLeft, ChevronRight, MapPin, X } from "lucide-react";
import { categoriesQuery, photosQuery } from "@/lib/queries";
import type { Photo } from "@/lib/types";
import { useSiteSettings } from "@/hooks/use-site-settings";

export const Route = createFileRoute("/work/$category")({ component: WorkGallery });

const ease = [0.16, 1, 0.3, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.85, ease } },
};
const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};
const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease } },
};

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
      transition={{ duration: 0.35 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(8,4,2,0.96)] backdrop-blur-md"
      onClick={onClose}
    >
      {/* Close */}
      <button onClick={onClose} className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center border border-white/18 bg-white/8 text-cream/70 transition-all hover:border-gold/50 hover:text-gold">
        <X className="h-4 w-4" />
      </button>

      {/* Prev */}
      <button
        onClick={(e) => { e.stopPropagation(); setIndex((index - 1 + photos.length) % photos.length); }}
        className="absolute left-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center border border-white/18 bg-white/8 text-cream/70 transition-all hover:border-gold/50 hover:text-gold"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Next */}
      <button
        onClick={(e) => { e.stopPropagation(); setIndex((index + 1) % photos.length); }}
        className="absolute right-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center border border-white/18 bg-white/8 text-cream/70 transition-all hover:border-gold/50 hover:text-gold"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-4 px-16 md:px-24"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={photo.url}
            alt={photo.title}
            className="max-h-[78vh] max-w-[88vw] object-contain shadow-[0_24px_80px_rgba(0,0,0,0.7)]"
          />
          <div className="flex items-center gap-5">
            {photo.title && <p className="font-display text-xl text-cream/90">{photo.title}</p>}
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

function WorkGallery() {
  const { category: slug } = Route.useParams();
  const [lightbox, setLightbox] = useState<number | null>(null);
  const { data: settings } = useSiteSettings();
  const { data: categories = [] } = useQuery(categoriesQuery());
  const { data: allPhotos = [] } = useQuery(photosQuery());

  const isAll = slug === "all";
  const category = isAll ? null : categories.find((c) => c.slug === slug);
  const photos = isAll ? allPhotos : allPhotos.filter((p) => p.category === slug);

  return (
    <div className="min-h-screen bg-[var(--espresso)]">
      {/* Nav */}
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

      {/* Page header */}
      <div className="relative overflow-hidden px-6 py-24 md:py-36">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_0%_50%,rgba(201,169,110,0.07),transparent)]" />
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="relative mx-auto max-w-7xl"
        >
          <motion.p variants={fadeUp} className="mb-4 flex items-center gap-3 text-[9px] uppercase tracking-[0.5em] text-gold/60">
            <span className="h-px w-8 bg-gold/50" /> Portfolio
          </motion.p>
          <div className="overflow-hidden">
            <motion.h1
              initial={{ y: "105%" }}
              animate={{ y: 0 }}
              transition={{ duration: 1, delay: 0.15, ease }}
              className="font-display text-5xl leading-none text-cream md:text-7xl lg:text-9xl"
            >
              {isAll ? "All Photos" : (category?.label ?? slug)}
            </motion.h1>
          </div>
          {category?.tag && (
            <motion.p variants={fadeUp} className="mt-4 font-display text-2xl italic text-gold/70">{category.tag}</motion.p>
          )}
          {category?.intro && (
            <motion.p variants={fadeUp} className="mt-5 max-w-xl text-sm leading-relaxed text-cream/50">{category.intro}</motion.p>
          )}
          <motion.p variants={fadeUp} className="mt-6 text-[9px] uppercase tracking-[0.45em] text-cream/28">
            {photos.length} {photos.length === 1 ? "frame" : "frames"}
          </motion.p>
        </motion.div>
      </div>

      {/* Category tabs */}
      {categories.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
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
                  cat.slug === slug
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

      {/* Gallery grid */}
      <div className="px-6 py-14">
        <div className="mx-auto max-w-7xl">
          {photos.length === 0 ? (
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
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 lg:grid-cols-4"
              style={{ gridAutoRows: "clamp(140px, 26vw, 300px)" }}
            >
              {photos.map((photo, i) => (
                <motion.button
                  key={photo.id}
                  variants={scaleIn}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setLightbox(i)}
                  className={`group relative h-full overflow-hidden text-left ${photo.tall ? "row-span-2" : ""} ${i === 0 ? "col-span-2" : ""}`}
                >
                  <img
                    src={photo.url}
                    alt={photo.title}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                  />
                  {/* Base gradient */}
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(14,8,4,0.82)_100%)]" />
                  {/* Gold hover wash */}
                  <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: "linear-gradient(145deg,rgba(201,169,110,0.14),transparent 55%)" }} />
                  {/* Gold inset border on hover */}
                  <div className="absolute inset-0 border border-transparent transition-all duration-500 group-hover:inset-2 group-hover:border-gold/35" />

                  <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[8px] uppercase tracking-[0.45em] text-gold/80">
                        {String(i + 1).padStart(2, "0")}
                      </p>
                      {photo.location && (
                        <p className="mt-0.5 flex items-center gap-1 text-[8px] uppercase tracking-[0.35em] text-cream/50">
                          <MapPin className="h-2.5 w-2.5" /> {photo.location}
                        </p>
                      )}
                    </div>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-white/18 bg-black/20 text-cream opacity-0 transition-all duration-300 group-hover:border-gold group-hover:bg-gold group-hover:text-[var(--espresso)] group-hover:opacity-100">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom nav */}
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
          <ArrowLeft className="h-3.5 w-3.5" /> Back to home
        </Link>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <Lightbox
            photos={photos}
            index={lightbox}
            onClose={() => setLightbox(null)}
            setIndex={setLightbox}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
