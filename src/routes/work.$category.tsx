import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Aperture, ArrowLeft, ArrowUpRight, ChevronLeft, ChevronRight, MapPin, X } from "lucide-react";
import { categoriesQuery, photosQuery } from "@/lib/queries";
import type { Photo } from "@/lib/types";
import { useSiteSettings } from "@/hooks/use-site-settings";

export const Route = createFileRoute("/work/$category")({ component: WorkGallery });

function Lightbox({
  photos,
  index,
  onClose,
  setIndex,
}: {
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
      >
        <X className="h-5 w-5" />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); setIndex((index - 1 + photos.length) % photos.length); }}
        className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); setIndex((index + 1) % photos.length); }}
        className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
      <div className="flex flex-col items-center gap-4 px-16" onClick={(e) => e.stopPropagation()}>
        <img
          src={photo.url}
          alt={photo.title}
          className="max-h-[78vh] max-w-[92vw] rounded-[1.6rem] object-contain shadow-2xl shadow-black/40"
        />
        <div className="flex items-center gap-4 text-center">
          {photo.title && (
            <p className="font-display text-2xl italic text-gold">{photo.title}</p>
          )}
          {photo.location && (
            <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.32em] text-white/50">
              <MapPin className="h-3 w-3" />
              {photo.location}
            </p>
          )}
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">
            {String(index + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
          </p>
        </div>
      </div>
    </div>
  );
}

function WorkGallery() {
  const { category: slug } = Route.useParams();
  const [lightbox, setLightbox] = useState<number | null>(null);
  const { data: settings } = useSiteSettings();
  const { data: categories = [] } = useQuery(categoriesQuery());
  const { data: allPhotos = [] } = useQuery(photosQuery());

  const category = categories.find((c) => c.slug === slug);
  const photos = allPhotos.filter((p) => p.category === slug);

  return (
    <div className="min-h-screen bg-[var(--espresso)]">
      {/* Nav */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/8 bg-[var(--espresso)]/90 px-6 py-4 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2.5 text-cream">
          <Aperture className="h-5 w-5 text-gold" strokeWidth={1.5} />
          <span className="font-display text-lg">{settings?.site_name ?? "Dopamine"}</span>
        </Link>
        <Link
          to="/"
          className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-cream/60 transition-colors hover:text-gold"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Link>
      </header>

      {/* Hero */}
      <div className="relative overflow-hidden px-6 py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,171,95,0.07),transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl">
          <p className="mb-3 flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-gold">
            <span className="h-px w-10 bg-gold" /> Portfolio
          </p>
          <h1 className="font-display text-5xl leading-[0.94] text-cream md:text-7xl lg:text-8xl">
            {category?.label ?? slug}
          </h1>
          {category?.tag && (
            <p className="mt-4 font-display text-2xl italic text-gold/80">{category.tag}</p>
          )}
          {category?.intro && (
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-cream/55">{category.intro}</p>
          )}
          <p className="mt-6 text-[11px] uppercase tracking-[0.35em] text-cream/35">
            {photos.length} {photos.length === 1 ? "frame" : "frames"}
          </p>
        </div>
      </div>

      {/* Category tabs */}
      {categories.length > 1 && (
        <div className="border-b border-white/8 px-6 pb-6">
          <div className="mx-auto flex max-w-7xl flex-wrap gap-2">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to="/work/$category"
                params={{ category: cat.slug }}
                className={`rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.25em] transition-all ${
                  cat.slug === slug
                    ? "border-gold bg-gold text-[var(--espresso)]"
                    : "border-white/12 text-cream/60 hover:border-gold/40 hover:text-gold"
                }`}
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Gallery grid */}
      <div className="px-6 py-12">
        <div className="mx-auto max-w-7xl">
          {photos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <Aperture className="mb-4 h-12 w-12 text-gold/30" strokeWidth={1} />
              <p className="font-display text-2xl text-cream/40">No photos yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4" style={{ gridAutoRows: "clamp(160px, 22vw, 300px)" }}>
              {photos.map((photo, index) => (
                <button
                  key={photo.id}
                  onClick={() => setLightbox(index)}
                  className={`group relative h-full overflow-hidden rounded-[1.5rem] text-left ${
                    photo.tall ? "row-span-2" : ""
                  } ${index === 0 ? "col-span-2" : ""}`}
                  style={{ opacity: 0, animation: `fade-in 0.6s ease-out ${Math.min(index, 12) * 0.05}s forwards` }}
                >
                  <img
                    src={photo.url}
                    alt={photo.title}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(16,10,6,0.85)_100%)]" />
                  <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: "linear-gradient(145deg,color-mix(in oklab,var(--gold) 18%,transparent),transparent 55%)" }} />
                  <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-gold">
                        {String(index + 1).padStart(2, "0")}
                      </p>
                      {photo.location && (
                        <p className="mt-1 flex items-center gap-1 text-[10px] uppercase tracking-[0.28em] text-cream/55">
                          <MapPin className="h-2.5 w-2.5" />
                          {photo.location}
                        </p>
                      )}
                    </div>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-black/20 text-cream opacity-0 transition-all group-hover:border-gold group-hover:bg-gold group-hover:text-[var(--espresso)] group-hover:opacity-100">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/8 px-6 py-10 text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-cream/40 transition-colors hover:text-gold"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to home
        </Link>
      </div>

      {lightbox !== null && (
        <Lightbox
          photos={photos}
          index={lightbox}
          onClose={() => setLightbox(null)}
          setIndex={setLightbox}
        />
      )}
    </div>
  );
}
