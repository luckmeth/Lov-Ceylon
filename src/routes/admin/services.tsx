import { createFileRoute } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { allServicesQuery, deleteService, upsertService } from "@/lib/queries";
import type { Service } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/services")({ component: AdminServices });

const ICON_OPTIONS = [
  "Heart", "Camera", "Calendar", "Star", "Award", "Aperture",
  "Image", "Film", "Sun", "Flower2",
];

const schema = z.object({
  num: z.string().min(1, "Required"),
  name: z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
  detail: z.string(),
  icon_name: z.string(),
  sort_order: z.number(),
  is_active: z.boolean(),
});
type FormData = z.infer<typeof schema>;

function AdminServices() {
  const queryClient = useQueryClient();
  const { data: services = [] } = useQuery(allServicesQuery());
  const [editing, setEditing] = useState<Service | null | "new">(null);

  const { mutate: doDelete } = useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Service deleted");
    },
  });

  return (
    <div className="p-4 md:p-8 max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1a1008]">Services</h1>
          <p className="mt-1 text-sm text-[#6b5a4a]">
            Manage the service cards shown in the Services section of the public site.
          </p>
        </div>
        <Button
          onClick={() => setEditing("new")}
          className="bg-[#C9A96E] text-[#1a1008] hover:bg-[#b8945a]"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add service
        </Button>
      </div>

      {services.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[rgba(26,16,8,0.15)] py-12 text-center">
          <p className="text-sm text-[#8B6B3D]">
            No services yet. Add your first service to show this section on your site.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((svc) => (
            <div
              key={svc.id}
              className={`flex items-start gap-4 rounded-xl border bg-white p-4 border-[rgba(26,16,8,0.08)] ${!svc.is_active ? "opacity-50" : ""}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono text-[#C9A96E]">{svc.num}</span>
                  <h3 className="font-semibold text-[#1a1008]">{svc.name}</h3>
                  {!svc.is_active && (
                    <Badge variant="secondary" className="text-xs">Hidden</Badge>
                  )}
                </div>
                <p className="mt-1 text-sm text-[#6b5a4a] line-clamp-2">{svc.description}</p>
                {svc.detail && (
                  <p className="mt-1 text-xs text-[#8B6B3D]">{svc.detail}</p>
                )}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Button
                  variant="ghost" size="icon"
                  className="h-8 w-8 text-[#6b5a4a] hover:text-[#1a1008]"
                  onClick={() => setEditing(svc)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost" size="icon"
                  className="h-8 w-8 text-[#6b5a4a] hover:text-red-600"
                  onClick={() => { if (confirm("Delete this service?")) doDelete(svc.id); }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ServiceDialog
        open={editing !== null}
        service={editing === "new" ? null : editing}
        onClose={() => setEditing(null)}
        sortOrder={services.length}
      />
    </div>
  );
}

function ServiceDialog({
  open, service, onClose, sortOrder,
}: {
  open: boolean;
  service: Service | null;
  onClose: () => void;
  sortOrder: number;
}) {
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      num: service?.num ?? String(sortOrder + 1).padStart(2, "0"),
      name: service?.name ?? "",
      description: service?.description ?? "",
      detail: service?.detail ?? "",
      icon_name: service?.icon_name ?? "Camera",
      sort_order: service?.sort_order ?? sortOrder,
      is_active: service?.is_active ?? true,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        num: service?.num ?? String(sortOrder + 1).padStart(2, "0"),
        name: service?.name ?? "",
        description: service?.description ?? "",
        detail: service?.detail ?? "",
        icon_name: service?.icon_name ?? "Camera",
        sort_order: service?.sort_order ?? sortOrder,
        is_active: service?.is_active ?? true,
      });
    }
  }, [open, service]);

  const { mutate: doSave, isPending } = useMutation({
    mutationFn: (data: FormData) =>
      upsertService({ ...(service ? { id: service.id } : {}), ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success(service ? "Service updated" : "Service created");
      onClose();
    },
    onError: () => toast.error("Failed to save"),
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{service ? "Edit service" : "New service"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((d) => doSave(d))} className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <FormField control={form.control} name="num" render={({ field }) => (
                <FormItem>
                  <FormLabel>Number</FormLabel>
                  <FormControl><Input placeholder="01" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Name</FormLabel>
                  <FormControl><Input placeholder="Wedding Photography" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea rows={3} placeholder="Full description shown on the card…" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="detail" render={({ field }) => (
              <FormItem>
                <FormLabel>Detail line <span className="text-[#8B6B3D] font-normal">(e.g. Pre-shoot · Ceremony · Reception)</span></FormLabel>
                <FormControl><Input placeholder="Pre-shoot · Ceremony · Reception" {...field} /></FormControl>
              </FormItem>
            )} />

            <FormField control={form.control} name="icon_name" render={({ field }) => (
              <FormItem>
                <FormLabel>Icon</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {ICON_OPTIONS.map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </FormControl>
              </FormItem>
            )} />

            <FormField control={form.control} name="is_active" render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0">Active (visible on site)</FormLabel>
              </FormItem>
            )} />

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
