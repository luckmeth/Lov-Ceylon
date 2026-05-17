import { createFileRoute } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { deleteSocialLink, socialLinksQuery, upsertSocialLink } from "@/lib/queries";
import type { SocialLink } from "@/lib/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/admin/social")({ component: AdminSocial });

const PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "twitter", label: "Twitter / X" },
  { value: "custom", label: "Custom" },
];

const schema = z.object({
  platform: z.string().min(1),
  label: z.string().min(1, "Required"),
  url: z.string().url("Must be a valid URL"),
  is_active: z.boolean(),
  sort_order: z.number(),
});
type FormData = z.infer<typeof schema>;

function AdminSocial() {
  const queryClient = useQueryClient();
  const { data: links = [] } = useQuery(socialLinksQuery());
  const [editing, setEditing] = useState<SocialLink | null | "new">(null);

  const { mutate: doDelete } = useMutation({
    mutationFn: deleteSocialLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-links"] });
      toast.success("Link deleted");
    },
  });

  const { mutate: doToggle } = useMutation({
    mutationFn: (link: SocialLink) =>
      upsertSocialLink({ ...link, is_active: !link.is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["social-links"] }),
  });

  return (
    <div className="p-4 md:p-8 max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1a1008]">Social Links</h1>
          <p className="mt-1 text-sm text-[#6b5a4a]">
            Manage social media links shown in the contact section.
          </p>
        </div>
        <Button
          onClick={() => setEditing("new")}
          className="bg-[#C9A96E] text-[#1a1008] hover:bg-[#b8945a]"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add link
        </Button>
      </div>

      {links.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[rgba(26,16,8,0.15)] py-12 text-center">
          <p className="text-sm text-[#8B6B3D]">No social links yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {links.map((link) => (
            <div
              key={link.id}
              className={`flex items-center gap-3 rounded-xl border bg-white px-4 py-3 ${
                link.is_active ? "border-[rgba(26,16,8,0.08)]" : "border-[rgba(26,16,8,0.08)] opacity-50"
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-[#1a1008]">{link.label}</p>
                <p className="truncate text-xs text-[#8B6B3D]">{link.url}</p>
              </div>
              <Switch
                checked={link.is_active}
                onCheckedChange={() => doToggle(link)}
                title={link.is_active ? "Disable" : "Enable"}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-[#6b5a4a] hover:text-[#1a1008]"
                onClick={() => setEditing(link)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-[#6b5a4a] hover:text-red-600"
                onClick={() => {
                  if (confirm("Delete this link?")) doDelete(link.id);
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <SocialDialog
        open={editing !== null}
        link={editing === "new" ? null : editing}
        onClose={() => setEditing(null)}
        sortOrder={links.length}
      />
    </div>
  );
}

function SocialDialog({
  open,
  link,
  onClose,
  sortOrder,
}: {
  open: boolean;
  link: SocialLink | null;
  onClose: () => void;
  sortOrder: number;
}) {
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      platform: link?.platform ?? "instagram",
      label: link?.label ?? "",
      url: link?.url ?? "",
      is_active: link?.is_active ?? true,
      sort_order: link?.sort_order ?? sortOrder,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        platform: link?.platform ?? "instagram",
        label: link?.label ?? "",
        url: link?.url ?? "",
        is_active: link?.is_active ?? true,
        sort_order: link?.sort_order ?? sortOrder,
      });
    }
  }, [open, link]);

  const { mutate: doSave, isPending } = useMutation({
    mutationFn: (data: FormData) =>
      upsertSocialLink({
        ...(link ? { id: link.id } : {}),
        platform: data.platform,
        label: data.label,
        url: data.url,
        icon: data.platform,
        is_active: data.is_active,
        sort_order: data.sort_order,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-links"] });
      toast.success(link ? "Link updated" : "Link added");
      onClose();
    },
    onError: () => toast.error("Failed to save"),
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{link ? "Edit link" : "New social link"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((d) => doSave(d))} className="space-y-4">
            <FormField
              control={form.control}
              name="platform"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Platform</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PLATFORMS.map((p) => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display label</FormLabel>
                  <FormControl><Input placeholder="e.g. @lovceylon" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl><Input type="url" placeholder="https://..." {...field} /></FormControl>
                  <FormMessage />
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
                  <FormLabel className="!mt-0">Active (shown on site)</FormLabel>
                </FormItem>
              )}
            />
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
