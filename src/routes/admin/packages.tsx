import { createFileRoute } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Star, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { deletePackage, packagesQuery, upsertPackage } from "@/lib/queries";
import type { Package } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/packages")({ component: AdminPackages });

const COLLECTIONS = ["Wedding Collection", "Homecoming Collection", "Pre-Casual Collection"] as const;

const schema = z.object({
  name: z.string().min(1, "Required"),
  description: z.string(),
  price: z.string().min(1, "Required"),
  features: z.string(),
  collection: z.string().min(1, "Required"),
  is_popular: z.boolean(),
  is_active: z.boolean(),
  sort_order: z.number(),
});
type FormData = z.infer<typeof schema>;

function AdminPackages() {
  const queryClient = useQueryClient();
  const { data: packages = [] } = useQuery(packagesQuery());
  const [editing, setEditing] = useState<Package | null | "new">(null);

  const { mutate: doDelete } = useMutation({
    mutationFn: deletePackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      toast.success("Package deleted");
    },
  });

  return (
    <div className="p-4 md:p-8 max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1a1008]">Packages</h1>
          <p className="mt-1 text-sm text-[#6b5a4a]">
            Define your photography packages — shown as a pricing section on the public site.
          </p>
        </div>
        <Button
          onClick={() => setEditing("new")}
          className="bg-[#C9A96E] text-[#1a1008] hover:bg-[#b8945a]"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add package
        </Button>
      </div>

      {packages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[rgba(26,16,8,0.15)] py-12 text-center">
          <p className="text-sm text-[#8B6B3D]">
            No packages yet. The pricing section will be hidden on your site until you add one.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`flex items-start gap-4 rounded-xl border bg-white p-4 ${
                pkg.is_popular
                  ? "border-[#C9A96E]/40"
                  : "border-[rgba(26,16,8,0.08)]"
              } ${!pkg.is_active ? "opacity-50" : ""}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-[#1a1008]">{pkg.name}</h3>
                  <span className="text-sm font-medium text-[#C9A96E]">{pkg.price}</span>
                  {pkg.is_popular && (
                    <Badge className="bg-[#C9A96E]/15 text-[#8B6B3D] hover:bg-[#C9A96E]/15 gap-1">
                      <Star className="h-2.5 w-2.5" />
                      Popular
                    </Badge>
                  )}
                  {pkg.collection && (
                    <Badge variant="outline" className="text-[10px] text-[#8B6B3D] border-[#C9A96E]/30">
                      {pkg.collection}
                    </Badge>
                  )}
                  {!pkg.is_active && (
                    <Badge variant="secondary" className="text-xs">Hidden</Badge>
                  )}
                </div>
                {pkg.description && (
                  <p className="mt-1 text-sm text-[#6b5a4a]">{pkg.description}</p>
                )}
                {(pkg.features ?? []).length > 0 && (
                  <ul className="mt-2 flex flex-wrap gap-1">
                    {(pkg.features ?? []).map((f) => (
                      <li
                        key={f}
                        className="rounded bg-[#f0ede8] px-2 py-0.5 text-[11px] text-[#6b5a4a]"
                      >
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-[#6b5a4a] hover:text-[#1a1008]"
                  onClick={() => setEditing(pkg)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-[#6b5a4a] hover:text-red-600"
                  onClick={() => {
                    if (confirm("Delete this package?")) doDelete(pkg.id);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <PackageDialog
        open={editing !== null}
        pkg={editing === "new" ? null : editing}
        onClose={() => setEditing(null)}
        sortOrder={packages.length}
      />
    </div>
  );
}

function PackageDialog({
  open,
  pkg,
  onClose,
  sortOrder,
}: {
  open: boolean;
  pkg: Package | null;
  onClose: () => void;
  sortOrder: number;
}) {
  const queryClient = useQueryClient();
  const [features, setFeatures] = useState<string[]>(pkg?.features ?? []);
  const [featureInput, setFeatureInput] = useState("");

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: pkg?.name ?? "",
      description: pkg?.description ?? "",
      price: pkg?.price ?? "",
      features: "",
      collection: pkg?.collection ?? "Wedding Collection",
      is_popular: pkg?.is_popular ?? false,
      is_active: pkg?.is_active ?? true,
      sort_order: pkg?.sort_order ?? sortOrder,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: pkg?.name ?? "",
        description: pkg?.description ?? "",
        price: pkg?.price ?? "",
        features: "",
        collection: pkg?.collection ?? "Wedding Collection",
        is_popular: pkg?.is_popular ?? false,
        is_active: pkg?.is_active ?? true,
        sort_order: pkg?.sort_order ?? sortOrder,
      });
      setFeatures(pkg?.features ?? []);
    }
  }, [open, pkg]);

  const addFeature = () => {
    const f = featureInput.trim();
    if (f) { setFeatures((prev) => [...prev, f]); setFeatureInput(""); }
  };

  const { mutate: doSave, isPending } = useMutation({
    mutationFn: (data: FormData) =>
      upsertPackage({
        ...(pkg ? { id: pkg.id } : {}),
        name: data.name,
        description: data.description,
        price: data.price,
        features,
        collection: data.collection,
        is_popular: data.is_popular,
        is_active: data.is_active,
        sort_order: data.sort_order,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      toast.success(pkg ? "Package updated" : "Package created");
      onClose();
    },
    onError: () => toast.error("Failed to save"),
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{pkg ? "Edit package" : "New package"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((d) => doSave(d))} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl><Input placeholder="LKR 85,000" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea rows={2} {...field} /></FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="collection"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Collection</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {COLLECTIONS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Features */}
            <div>
              <Label>Features</Label>
              <div className="mt-1 flex gap-2">
                <Input
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  placeholder="e.g. 8 hours coverage"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }}
                />
                <Button type="button" variant="outline" onClick={addFeature} className="flex-shrink-0">
                  Add
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {features.map((f, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1 rounded bg-[#f0ede8] px-2 py-0.5 text-xs text-[#6b5a4a]"
                  >
                    {f}
                    <button type="button" onClick={() => setFeatures((p) => p.filter((_, j) => j !== i))}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-6">
              <FormField
                control={form.control}
                name="is_popular"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0">Mark as Popular</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0">Active</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button
                type="submit"
                className="bg-[#C9A96E] text-[#1a1008] hover:bg-[#b8945a]"
                disabled={isPending}
              >
                {isPending ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
