import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, GripVertical, MapPin, Pencil, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { Photo } from "@/lib/types";
import { deletePhoto, updatePhoto, updatePhotoOrder } from "@/lib/queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PhotoGrid({ photos }: { photos: Photo[] }) {
  const queryClient = useQueryClient();
  const [items, setItems] = useState<Photo[]>(photos);
  const dragIdx = useRef<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  // Sync when parent data changes
  if (photos.length !== items.length || photos[0]?.id !== items[0]?.id) {
    setItems(photos);
  }

  const { mutate: doDelete } = useMutation({
    mutationFn: deletePhoto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photos"] });
      toast.success("Photo deleted");
    },
    onError: () => toast.error("Failed to delete"),
  });

  const { mutate: doTogglePublish } = useMutation({
    mutationFn: ({ id, is_published }: { id: string; is_published: boolean }) =>
      updatePhoto(id, { is_published }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["photos"] }),
    onError: () => toast.error("Failed to update"),
  });

  const { mutate: doToggleTall } = useMutation({
    mutationFn: ({ id, tall }: { id: string; tall: boolean }) =>
      updatePhoto(id, { tall }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["photos"] }),
    onError: () => toast.error("Failed to update"),
  });

  const { mutate: doUpdateTitle } = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      updatePhoto(id, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photos"] });
      setEditingId(null);
    },
    onError: () => toast.error("Failed to update title"),
  });

  const commitTitle = (id: string) => {
    doUpdateTitle({ id, title: editTitle.trim() });
  };

  const handleDrop = async (dropIdx: number) => {
    if (dragIdx.current === null || dragIdx.current === dropIdx) return;
    const reordered = [...items];
    const [moved] = reordered.splice(dragIdx.current, 1);
    reordered.splice(dropIdx, 0, moved);
    setItems(reordered);
    dragIdx.current = null;
    await updatePhotoOrder(reordered.map((p, i) => ({ id: p.id, sort_order: i })));
    queryClient.invalidateQueries({ queryKey: ["photos"] });
  };

  if (photos.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-[rgba(26,16,8,0.15)] py-10 text-center text-sm text-[#8B6B3D]">
        No photos yet — upload some above.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
      {items.map((photo, idx) => (
        <div
          key={photo.id}
          draggable
          onDragStart={() => { dragIdx.current = idx; }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(idx)}
          className={`group relative overflow-hidden rounded-lg border border-[rgba(26,16,8,0.08)] bg-white ${
            !photo.is_published ? "opacity-50" : ""
          }`}
        >
          {/* Drag handle */}
          <div className="absolute left-1 top-1 z-10 cursor-grab rounded p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing bg-black/30">
            <GripVertical className="h-3.5 w-3.5" />
          </div>

          <img
            src={photo.url}
            alt={photo.title}
            className="aspect-square w-full object-cover"
          />

          {/* Overlay controls */}
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
            <div className="p-2 space-y-1">
              {editingId === photo.id ? (
                <Input
                  autoFocus
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={() => commitTitle(photo.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitTitle(photo.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  placeholder="Add a title…"
                  className="h-6 text-xs bg-black/50 border-white/30 text-white placeholder:text-white/50"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <button
                  className="flex items-center gap-1 w-full text-left"
                  onClick={(e) => { e.stopPropagation(); setEditTitle(photo.title ?? ""); setEditingId(photo.id); }}
                  title="Edit title"
                >
                  <p className="truncate text-xs font-medium text-white flex-1">
                    {photo.title || <span className="italic text-white/50">Add title…</span>}
                  </p>
                  <Pencil className="h-3 w-3 text-white/60 shrink-0" />
                </button>
              )}
              {photo.location && (
                <p className="flex items-center gap-0.5 text-[10px] text-white/70">
                  <MapPin className="h-2.5 w-2.5" />
                  {photo.location}
                </p>
              )}
              <div className="flex items-center gap-1 pt-1">
                <button
                  onClick={() => doTogglePublish({ id: photo.id, is_published: !photo.is_published })}
                  className="flex-1 flex items-center justify-center gap-1 rounded bg-white/20 py-0.5 text-[10px] text-white hover:bg-white/30"
                  title={photo.is_published ? "Unpublish" : "Publish"}
                >
                  {photo.is_published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  {photo.is_published ? "Hide" : "Show"}
                </button>
                <button
                  onClick={() => {
                    if (confirm("Delete this photo?")) doDelete(photo);
                  }}
                  className="flex items-center justify-center rounded bg-white/20 p-0.5 text-white hover:bg-red-500/70"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="absolute right-1 top-1 flex flex-col gap-1">
            {photo.tall && (
              <Badge className="h-4 px-1 text-[9px] bg-[#C9A96E] text-[#1a1008] hover:bg-[#C9A96E]">
                tall
              </Badge>
            )}
            {!photo.is_published && (
              <Badge variant="secondary" className="h-4 px-1 text-[9px]">
                hidden
              </Badge>
            )}
          </div>

          {/* Tall toggle (bottom of card) */}
          <div className="border-t border-[rgba(26,16,8,0.06)] px-2 py-1 flex items-center gap-1">
            <input
              id={`tall-${photo.id}`}
              type="checkbox"
              checked={photo.tall}
              onChange={(e) => doToggleTall({ id: photo.id, tall: e.target.checked })}
              className="accent-[#C9A96E] h-3 w-3"
            />
            <label htmlFor={`tall-${photo.id}`} className="text-[10px] text-[#8B6B3D] cursor-pointer">
              tall span
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}
