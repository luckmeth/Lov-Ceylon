import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  allCategoriesQuery,
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/lib/queries";
import type { WorkCategory } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/categories")({ component: AdminCategories });

const EMPTY_FORM = { slug: "", label: "", tag: "", intro: "" };

function CategoryForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: typeof EMPTY_FORM;
  onSave: (v: typeof EMPTY_FORM) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(initial);
  const set = (k: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const autoSlug = (label: string) =>
    label.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  return (
    <div className="space-y-4 rounded-xl border border-[rgba(26,16,8,0.12)] bg-white p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label className="mb-1.5 text-xs text-[#6b5a4a]">Label (display name) *</Label>
          <Input
            value={form.label}
            onChange={(e) => {
              const label = e.target.value;
              setForm((p) => ({
                ...p,
                label,
                slug: initial.slug ? p.slug : autoSlug(label),
              }));
            }}
            placeholder="e.g. Graduations"
            className="h-9 text-sm"
          />
        </div>
        <div>
          <Label className="mb-1.5 text-xs text-[#6b5a4a]">Slug (URL key) *</Label>
          <Input
            value={form.slug}
            onChange={set("slug")}
            placeholder="e.g. graduations"
            className="h-9 font-mono text-sm"
          />
          <p className="mt-1 text-[10px] text-[#8B6B3D]">Lowercase, no spaces. Used in the URL.</p>
        </div>
      </div>
      <div>
        <Label className="mb-1.5 text-xs text-[#6b5a4a]">Tagline (short italic caption)</Label>
        <Input
          value={form.tag}
          onChange={set("tag")}
          placeholder="e.g. Milestones, not just moments."
          className="h-9 text-sm"
        />
      </div>
      <div>
        <Label className="mb-1.5 text-xs text-[#6b5a4a]">Intro text</Label>
        <Textarea
          value={form.intro}
          onChange={set("intro")}
          placeholder="A short description shown on the work section."
          rows={2}
          className="resize-none text-sm"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel} className="text-xs">
          Cancel
        </Button>
        <Button
          size="sm"
          disabled={saving || !form.label.trim() || !form.slug.trim()}
          onClick={() => onSave(form)}
          className="bg-[#C9A96E] text-[#1a1008] text-xs hover:bg-[#b8945a]"
        >
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}

function AdminCategories() {
  const queryClient = useQueryClient();
  const { data: categories = [], isLoading } = useQuery(allCategoriesQuery());
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["work-categories"] });
  };

  const { mutate: doCreate, isPending: creating } = useMutation({
    mutationFn: createCategory,
    onSuccess: () => { invalidate(); setAdding(false); toast.success("Category created"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const { mutate: doUpdate, isPending: updating } = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<WorkCategory> }) =>
      updateCategory(id, patch),
    onSuccess: () => { invalidate(); setEditingId(null); toast.success("Saved"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const { mutate: doDelete } = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => { invalidate(); toast.success("Category deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#1a1008]">Work Categories</h1>
          <p className="mt-1 text-sm text-[#6b5a4a]">
            Add and manage portfolio categories shown on the Work section. Each category gets its own gallery page.
          </p>
        </div>
        {!adding && (
          <Button
            onClick={() => setAdding(true)}
            className="shrink-0 bg-[#C9A96E] text-[#1a1008] hover:bg-[#b8945a]"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add category
          </Button>
        )}
      </div>

      {adding && (
        <div className="mb-6">
          <p className="mb-3 text-sm font-medium text-[#1a1008]">New category</p>
          <CategoryForm
            initial={EMPTY_FORM}
            onSave={(v) => doCreate(v)}
            onCancel={() => setAdding(false)}
            saving={creating}
          />
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-[#8B6B3D]">Loading…</p>
      ) : categories.length === 0 && !adding ? (
        <div className="rounded-xl border border-dashed border-[rgba(26,16,8,0.15)] py-16 text-center">
          <p className="text-sm text-[#8B6B3D]">No categories yet. Add your first one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="rounded-xl border border-[rgba(26,16,8,0.08)] bg-white"
            >
              {editingId === cat.id ? (
                <div className="p-5">
                  <p className="mb-3 text-sm font-medium text-[#1a1008]">Edit — {cat.label}</p>
                  <CategoryForm
                    initial={{ slug: cat.slug, label: cat.label, tag: cat.tag, intro: cat.intro }}
                    onSave={(v) => doUpdate({ id: cat.id, patch: v })}
                    onCancel={() => setEditingId(null)}
                    saving={updating}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4">
                  <div className="cursor-grab text-[#ccc]">
                    <GripVertical className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#1a1008]">{cat.label}</span>
                      <span className="font-mono text-xs text-[#8B6B3D]">/{cat.slug}</span>
                      {!cat.is_active && (
                        <Badge variant="secondary" className="text-[10px]">hidden</Badge>
                      )}
                    </div>
                    {cat.tag && (
                      <p className="mt-0.5 truncate text-xs italic text-[#8B6B3D]">{cat.tag}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() =>
                        doUpdate({ id: cat.id, patch: { is_active: !cat.is_active } })
                      }
                      className="rounded px-2.5 py-1 text-[11px] font-medium text-[#8B6B3D] hover:bg-[#f0ede8] hover:text-[#1a1008]"
                      title={cat.is_active ? "Hide from site" : "Show on site"}
                    >
                      {cat.is_active ? "Hide" : "Show"}
                    </button>
                    <button
                      onClick={() => setEditingId(cat.id)}
                      className="rounded p-1.5 text-[#8B6B3D] hover:bg-[#f0ede8] hover:text-[#1a1008]"
                      title="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${cat.label}"? Photos in this category will remain but won't appear on site.`))
                          doDelete(cat.id);
                      }}
                      className="rounded p-1.5 text-[#8B6B3D] hover:bg-red-50 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 rounded-xl border border-[rgba(201,169,110,0.3)] bg-[rgba(201,169,110,0.06)] p-4">
        <p className="text-xs font-medium text-[#8B6B3D]">Database setup required</p>
        <p className="mt-1 text-xs text-[#8B6B3D]/80">
          This feature needs a <code className="rounded bg-[rgba(26,16,8,0.06)] px-1 py-0.5">work_categories</code> table in Supabase.
          See the setup instructions for the SQL to run.
        </p>
      </div>
    </div>
  );
}
