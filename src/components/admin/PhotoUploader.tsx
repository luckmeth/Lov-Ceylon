import { useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { Category, WorkCategory } from "@/lib/types";
import { uploadPhoto } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PendingFile {
  file: File;
  preview: string;
  title: string;
  location: string;
  tall: boolean;
}

const MAX_MB = 10;

export function PhotoUploader({
  defaultCategory,
  categories,
}: {
  defaultCategory: Category;
  categories: WorkCategory[];
}) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState<Category>(defaultCategory);
  const [pending, setPending] = useState<PendingFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const next: PendingFile[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > MAX_MB * 1024 * 1024) {
        toast.error(`${file.name} exceeds ${MAX_MB}MB limit`);
        continue;
      }
      next.push({
        file,
        preview: URL.createObjectURL(file),
        title: "",
        location: "",
        tall: false,
      });
    }
    setPending((prev) => [...prev, ...next]);
  };

  const removeFile = (idx: number) => {
    setPending((prev) => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const updateField = (idx: number, field: keyof PendingFile, value: string | boolean) => {
    setPending((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p)));
  };

  const handleUpload = async () => {
    if (pending.length === 0) return;
    setUploading(true);
    let success = 0;
    for (let i = 0; i < pending.length; i++) {
      try {
        await uploadPhoto(pending[i].file, category, {
          title: pending[i].title,
          location: pending[i].location || undefined,
          tall: pending[i].tall,
        }, i);
        URL.revokeObjectURL(pending[i].preview);
        success++;
      } catch {
        toast.error(`Failed to upload ${pending[i].file.name}`);
      }
    }
    await queryClient.invalidateQueries({ queryKey: ["photos"] });
    setPending([]);
    setUploading(false);
    if (success > 0) toast.success(`${success} photo${success > 1 ? "s" : ""} uploaded`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.slug} value={cat.slug}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-[#8B6B3D]">Select category, then drop photos below</span>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-10 transition-colors ${
          dragging
            ? "border-[#C9A96E] bg-[#C9A96E]/5"
            : "border-[rgba(26,16,8,0.15)] hover:border-[#C9A96E]/50 hover:bg-[#f8f6f2]"
        }`}
      >
        <ImagePlus className="mb-2 h-8 w-8 text-[#C9A96E]" />
        <p className="text-sm font-medium text-[#1a1008]">Drop photos here or click to browse</p>
        <p className="mt-1 text-xs text-[#8B6B3D]">JPG, PNG, WEBP — max {MAX_MB}MB each</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {/* Preview list */}
      {pending.length > 0 && (
        <div className="space-y-3">
          {pending.map((p, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border border-[rgba(26,16,8,0.08)] bg-white p-3"
            >
              <img
                src={p.preview}
                alt=""
                className="h-14 w-14 flex-shrink-0 rounded object-cover"
              />
              <div className="flex flex-1 flex-wrap gap-2">
                <div className="flex-1 min-w-32">
                  <Label className="mb-1 text-xs text-[#6b5a4a]">Title</Label>
                  <Input
                    value={p.title}
                    onChange={(e) => updateField(i, "title", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="w-32">
                  <Label className="mb-1 text-xs text-[#6b5a4a]">Location</Label>
                  <Input
                    value={p.location}
                    placeholder="Optional"
                    onChange={(e) => updateField(i, "location", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="flex items-end gap-1.5 pb-0.5">
                  <input
                    id={`tall-${i}`}
                    type="checkbox"
                    checked={p.tall}
                    onChange={(e) => updateField(i, "tall", e.target.checked)}
                    className="accent-[#C9A96E]"
                  />
                  <Label htmlFor={`tall-${i}`} className="text-xs text-[#6b5a4a] cursor-pointer">
                    Tall
                  </Label>
                </div>
              </div>
              <button
                onClick={() => removeFile(i)}
                className="flex-shrink-0 rounded p-1 text-[#8B6B3D] hover:bg-[#f0ede8] hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}

          <div className="flex justify-end">
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="bg-[#C9A96E] text-[#1a1008] hover:bg-[#b8945a]"
            >
              {uploading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading…</>
              ) : (
                `Upload ${pending.length} photo${pending.length > 1 ? "s" : ""}`
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
