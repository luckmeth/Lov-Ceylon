import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Eye, EyeOff, GripVertical, ImagePlus, Loader2, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  allHeroSlidesQuery,
  deleteHeroSlide,
  updateHeroSlide,
  updateHeroSlideOrder,
  uploadHeroSlide,
} from "@/lib/queries";
import type { HeroSlide } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/hero-slides")({ component: AdminHeroSlides });

interface PendingSlide {
  file: File;
  preview: string;
  caption: string;
}

function AdminHeroSlides() {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const dragIdx = useRef<number | null>(null);

  const { data: slides = [], isLoading } = useQuery(allHeroSlidesQuery());
  const [pending, setPending] = useState<PendingSlide[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["hero-slides"] });

  const { mutate: doDelete } = useMutation({
    mutationFn: deleteHeroSlide,
    onSuccess: () => { invalidate(); toast.success("Slide deleted"); },
    onError: () => toast.error("Failed to delete"),
  });

  const { mutate: doToggle } = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      updateHeroSlide(id, { is_active }),
    onSuccess: () => invalidate(),
    onError: () => toast.error("Failed to update"),
  });

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const next: PendingSlide[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 10 * 1024 * 1024) { toast.error(`${file.name} exceeds 10MB`); continue; }
      next.push({ file, preview: URL.createObjectURL(file), caption: "" });
    }
    setPending((p) => [...p, ...next]);
  };

  const handleUpload = async () => {
    if (pending.length === 0) return;
    setUploading(true);
    let success = 0;
    for (let i = 0; i < pending.length; i++) {
      try {
        await uploadHeroSlide(pending[i].file, pending[i].caption, slides.length + i);
        URL.revokeObjectURL(pending[i].preview);
        success++;
      } catch {
        toast.error(`Failed to upload ${pending[i].file.name}`);
      }
    }
    await invalidate();
    setPending([]);
    setUploading(false);
    if (success > 0) toast.success(`${success} slide${success > 1 ? "s" : ""} uploaded`);
  };

  const handleDrop = async (dropIdx: number) => {
    if (dragIdx.current === null || dragIdx.current === dropIdx) return;
    const reordered = [...slides];
    const [moved] = reordered.splice(dragIdx.current, 1);
    reordered.splice(dropIdx, 0, moved);
    dragIdx.current = null;
    await updateHeroSlideOrder(reordered.map((s, i) => ({ id: s.id, sort_order: i })));
    invalidate();
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1a1008]">Hero Slideshow</h1>
        <p className="mt-1 text-sm text-[#6b5a4a]">
          Upload and manage the photos shown in the homepage hero slideshow. Drag to reorder.
        </p>
      </div>

      {/* Upload zone */}
      <div className="mb-8 rounded-xl border border-[rgba(26,16,8,0.08)] bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-[#1a1008]">Upload slides</h2>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-10 transition-colors ${
            dragging ? "border-[#C9A96E] bg-[#C9A96E]/5" : "border-[rgba(26,16,8,0.15)] hover:border-[#C9A96E]/50 hover:bg-[#f8f6f2]"
          }`}
        >
          <ImagePlus className="mb-2 h-8 w-8 text-[#C9A96E]" />
          <p className="text-sm font-medium text-[#1a1008]">Drop photos here or click to browse</p>
          <p className="mt-1 text-xs text-[#8B6B3D]">JPG, PNG, WEBP — max 10MB each</p>
          <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
        </div>

        {pending.length > 0 && (
          <div className="mt-4 space-y-3">
            {pending.map((p, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-[rgba(26,16,8,0.08)] bg-[#fafaf8] p-3">
                <img src={p.preview} alt="" className="h-14 w-20 rounded object-cover flex-shrink-0" />
                <div className="flex-1">
                  <Label className="mb-1 text-xs text-[#6b5a4a]">Caption (optional)</Label>
                  <Input
                    value={p.caption}
                    onChange={(e) => setPending((prev) => prev.map((x, j) => j === i ? { ...x, caption: e.target.value } : x))}
                    placeholder="Optional caption for this slide"
                    className="h-8 text-sm"
                  />
                </div>
                <button onClick={() => { URL.revokeObjectURL(p.preview); setPending((prev) => prev.filter((_, j) => j !== i)); }} className="flex-shrink-0 rounded p-1 text-[#8B6B3D] hover:text-red-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <div className="flex justify-end">
              <Button onClick={handleUpload} disabled={uploading} className="bg-[#C9A96E] text-[#1a1008] hover:bg-[#b8945a]">
                {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading…</> : `Upload ${pending.length} slide${pending.length > 1 ? "s" : ""}`}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Current slides */}
      <div className="rounded-xl border border-[rgba(26,16,8,0.08)] bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-[#1a1008]">
          Current slides
          {isLoading && <span className="ml-2 text-xs font-normal text-[#8B6B3D]">Loading…</span>}
        </h2>

        {slides.length === 0 && !isLoading ? (
          <p className="rounded-lg border border-dashed border-[rgba(26,16,8,0.15)] py-10 text-center text-sm text-[#8B6B3D]">
            No slides yet — upload some above.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {slides.map((slide, idx) => (
              <div
                key={slide.id}
                draggable
                onDragStart={() => { dragIdx.current = idx; }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(idx)}
                className={`group relative overflow-hidden rounded-lg border border-[rgba(26,16,8,0.08)] bg-[#f0ede8] ${!slide.is_active ? "opacity-50" : ""}`}
              >
                <div className="absolute left-1 top-1 z-10 cursor-grab rounded p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing bg-black/30">
                  <GripVertical className="h-3.5 w-3.5" />
                </div>

                <img src={slide.image_url} alt={slide.caption ?? `Slide ${idx + 1}`} className="aspect-[4/3] w-full object-cover" />

                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex items-center gap-1 p-2">
                    {slide.caption && <p className="flex-1 truncate text-[10px] text-white">{slide.caption}</p>}
                    <button onClick={() => doToggle({ id: slide.id, is_active: !slide.is_active })} className="flex items-center gap-1 rounded bg-white/20 px-1.5 py-0.5 text-[10px] text-white hover:bg-white/30">
                      {slide.is_active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {slide.is_active ? "Hide" : "Show"}
                    </button>
                    <button onClick={() => { if (confirm("Delete this slide?")) doDelete(slide); }} className="rounded bg-white/20 p-0.5 text-white hover:bg-red-500/70">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="border-t border-[rgba(26,16,8,0.06)] px-2 py-1 text-[10px] text-[#8B6B3D]">
                  Slide {idx + 1}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-[rgba(201,169,110,0.3)] bg-[rgba(201,169,110,0.06)] p-4">
        <p className="text-xs font-medium text-[#8B6B3D]">Database setup required</p>
        <p className="mt-1 text-xs text-[#8B6B3D]/80">
          This feature needs a <code className="rounded bg-[rgba(26,16,8,0.06)] px-1 py-0.5">hero_slides</code> table. See setup instructions for the SQL.
        </p>
      </div>
    </div>
  );
}
