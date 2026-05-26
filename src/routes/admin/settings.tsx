import { createFileRoute } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { siteSettingsQuery, updateSiteSettings } from "@/lib/queries";
import type { SiteSettings } from "@/lib/types";
import { AssetUploader } from "@/components/admin/AssetUploader";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/admin/settings")({ component: AdminSettings });

const HEADING_FONTS = [
  "Cormorant Garamond",
  "Playfair Display",
  "Libre Baskerville",
  "EB Garamond",
  "Lora",
  "Merriweather",
];

const BODY_FONTS = [
  "DM Sans",
  "Inter",
  "Nunito",
  "Poppins",
  "Raleway",
  "Montserrat",
  "Open Sans",
];

const schema = z.object({
  site_name: z.string().min(1, "Required"),
  tagline: z.string().min(1, "Required"),
  photographer_name: z.string().min(1, "Required"),
  logo_url: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  hero_heading: z.string().min(1, "Required"),
  hero_subtext: z.string(),
  about_text: z.string(),
  stat_1_value: z.string(),
  stat_1_label: z.string(),
  stat_2_value: z.string(),
  stat_2_label: z.string(),
  stat_3_value: z.string(),
  stat_3_label: z.string(),
  contact_email: z.string().email("Must be a valid email"),
  contact_phone: z.string().optional(),
  contact_location: z.string(),
  meta_title: z.string(),
  meta_description: z.string(),
  quote_text: z.string(),
  quote_author: z.string(),
  footer_text: z.string(),
  // Colors
  color_primary: z.string().optional(),
  color_background: z.string().optional(),
  color_text: z.string().optional(),
  color_accent: z.string().optional(),
  // Fonts
  font_heading: z.string().optional(),
  font_body: z.string().optional(),
  // Site images
  hero_background_url: z.string().nullable().optional(),
  about_portrait_url: z.string().nullable().optional(),
  story_image_url: z.string().nullable().optional(),
  process_image_url: z.string().nullable().optional(),
  contact_image_url: z.string().nullable().optional(),
  // Marquee words (comma-separated)
  marquee_words: z.string().nullable().optional(),
  // Section visibility
  show_marquee: z.boolean().optional(),
  show_work: z.boolean().optional(),
  show_story: z.boolean().optional(),
  show_process: z.boolean().optional(),
  show_services: z.boolean().optional(),
  show_packages: z.boolean().optional(),
  show_testimonials: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

function AdminSettings() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery(siteSettingsQuery());

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      site_name: "",
      tagline: "",
      photographer_name: "",
      logo_url: "",
      hero_heading: "",
      hero_subtext: "",
      about_text: "",
      stat_1_value: "",
      stat_1_label: "",
      stat_2_value: "",
      stat_2_label: "",
      stat_3_value: "",
      stat_3_label: "",
      contact_email: "",
      contact_phone: "",
      contact_location: "",
      meta_title: "",
      meta_description: "",
      quote_text: "",
      quote_author: "",
      footer_text: "",
      color_primary: "#C9A96E",
      color_background: "#0e0804",
      color_text: "#F5ECD7",
      color_accent: "#8B6B3D",
      font_heading: "Cormorant Garamond",
      font_body: "DM Sans",
      hero_background_url: null,
      about_portrait_url: null,
      story_image_url: null,
      process_image_url: null,
      contact_image_url: null,
      marquee_words: "",
      show_marquee: true,
      show_work: true,
      show_story: true,
      show_process: true,
      show_services: true,
      show_packages: true,
      show_testimonials: true,
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        ...settings,
        logo_url: settings.logo_url ?? "",
        contact_phone: settings.contact_phone ?? "",
        color_primary: settings.color_primary || "#C9A96E",
        color_background: settings.color_background || "#0e0804",
        color_text: settings.color_text || "#F5ECD7",
        color_accent: settings.color_accent || "#8B6B3D",
        font_heading: settings.font_heading ?? "Cormorant Garamond",
        font_body: settings.font_body ?? "DM Sans",
        marquee_words: settings.marquee_words ?? "",
        show_marquee: settings.show_marquee ?? true,
        show_work: settings.show_work ?? true,
        show_story: settings.show_story ?? true,
        show_process: settings.show_process ?? true,
        show_services: settings.show_services ?? true,
        show_packages: settings.show_packages ?? true,
        show_testimonials: settings.show_testimonials ?? true,
      } as FormData);
    }
  }, [settings, form]);

  const [heroUrl, aboutUrl, storyUrl, processUrl, contactUrl] = form.watch([
    "hero_background_url",
    "about_portrait_url",
    "story_image_url",
    "process_image_url",
    "contact_image_url",
  ]);

  const onSubmit = async (data: FormData) => {
    const { error } = await updateSiteSettings(data as Partial<SiteSettings>);
    if (error) {
      toast.error("Failed to save settings.");
    } else {
      await queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      toast.success("Settings saved.");
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-8">
        <div className="h-8 w-48 animate-pulse rounded bg-[#e8e4de]" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1a1008]">Site Settings</h1>
        <p className="mt-1 text-sm text-[#6b5a4a]">
          Edit everything shown on your public website.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">

          {/* ─── Identity ─── */}
          <section>
            <h2 className="mb-4 text-base font-semibold text-[#1a1008]">Identity</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FF form={form} name="site_name" label="Site Name" />
                <FF form={form} name="photographer_name" label="Photographer Name" />
              </div>
              <FF form={form} name="tagline" label="Tagline" />
              <div>
                <p className="mb-1 text-sm font-medium text-[#1a1008]">Logo</p>
                <p className="mb-2 text-[11px] text-[#6b5a4a]">Upload a logo image, or leave blank to use the site name as text.</p>
                <AssetUploader
                  label="Logo"
                  currentUrl={form.watch("logo_url") || undefined}
                  onUpload={(url) => form.setValue("logo_url", url, { shouldDirty: true })}
                  onRemove={() => form.setValue("logo_url", "", { shouldDirty: true })}
                />
              </div>
            </div>
          </section>

          <Separator className="bg-[rgba(26,16,8,0.08)]" />

          {/* ─── Brand Colors ─── */}
          <section>
            <h2 className="mb-1 text-base font-semibold text-[#1a1008]">Brand Colors</h2>
            <p className="mb-4 text-sm text-[#6b5a4a]">Changes apply instantly across the entire public site.</p>
            <div className="space-y-4">
              <ColorField
                form={form}
                name="color_primary"
                label="Primary / Gold Color"
                description="Gold accent — buttons, headings, tab indicators, highlights"
                defaultColor="#C9A96E"
              />
              <ColorField
                form={form}
                name="color_background"
                label="Dark Background Color"
                description="Base dark tone (hero, about, packages, footer). Lighter sections auto-derive from this."
                defaultColor="#0e0804"
              />
              <ColorField
                form={form}
                name="color_text"
                label="Text / Cream Color"
                description="Body and heading text on dark backgrounds"
                defaultColor="#F5ECD7"
              />
              <ColorField
                form={form}
                name="color_accent"
                label="Accent / Bronze Color"
                description="Secondary accent — subtle borders, muted labels, hover tints"
                defaultColor="#8B6B3D"
              />
            </div>
          </section>

          <Separator className="bg-[rgba(26,16,8,0.08)]" />

          {/* ─── Fonts ─── */}
          <section>
            <h2 className="mb-1 text-base font-semibold text-[#1a1008]">Fonts</h2>
            <p className="mb-4 text-sm text-[#6b5a4a]">Google Fonts loaded automatically when you save.</p>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="font_heading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#1a1008]">Heading Font</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? "Cormorant Garamond"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {HEADING_FONTS.map((font) => (
                          <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                            {font}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-[#8B6B3D]">Elegant serif for headings</FormDescription>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="font_body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#1a1008]">Body Font</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? "DM Sans"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BODY_FONTS.map((font) => (
                          <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                            {font}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-[#8B6B3D]">Clean sans-serif for body text</FormDescription>
                  </FormItem>
                )}
              />
            </div>
          </section>

          <Separator className="bg-[rgba(26,16,8,0.08)]" />

          {/* ─── Site Images ─── */}
          <section>
            <h2 className="mb-1 text-base font-semibold text-[#1a1008]">Site Images</h2>
            <p className="mb-4 text-sm text-[#6b5a4a]">Key background and section images. Falls back to built-in defaults if not set.</p>
            <div className="grid grid-cols-2 gap-6">
              <AssetUploader
                label="Hero Background"
                currentUrl={heroUrl ?? null}
                onUpload={(url) => form.setValue("hero_background_url", url, { shouldDirty: true })}
                onRemove={() => form.setValue("hero_background_url", null, { shouldDirty: true })}
              />
              <AssetUploader
                label="About Portrait"
                currentUrl={aboutUrl ?? null}
                onUpload={(url) => form.setValue("about_portrait_url", url, { shouldDirty: true })}
                onRemove={() => form.setValue("about_portrait_url", null, { shouldDirty: true })}
              />
              <AssetUploader
                label="Story Section"
                currentUrl={storyUrl ?? null}
                onUpload={(url) => form.setValue("story_image_url", url, { shouldDirty: true })}
                onRemove={() => form.setValue("story_image_url", null, { shouldDirty: true })}
              />
              <AssetUploader
                label="Process Section"
                currentUrl={processUrl ?? null}
                onUpload={(url) => form.setValue("process_image_url", url, { shouldDirty: true })}
                onRemove={() => form.setValue("process_image_url", null, { shouldDirty: true })}
              />
              <AssetUploader
                label="Contact Section"
                currentUrl={contactUrl ?? null}
                onUpload={(url) => form.setValue("contact_image_url", url, { shouldDirty: true })}
                onRemove={() => form.setValue("contact_image_url", null, { shouldDirty: true })}
              />
            </div>
          </section>

          <Separator className="bg-[rgba(26,16,8,0.08)]" />

          {/* ─── Marquee Text ─── */}
          <section>
            <h2 className="mb-1 text-base font-semibold text-[#1a1008]">Scrolling Marquee Text</h2>
            <p className="mb-4 text-sm text-[#6b5a4a]">
              Enter the words to show in the scrolling band — comma-separated. Leave blank to use the default
              (site name + Portraits, Weddings, Events, Editorial, Mood, Light).
            </p>
            <FFTextarea
              form={form}
              name="marquee_words"
              label="Marquee words"
              description="e.g. &quot;Lov'Ceylon, Wedding, Fashion, Portrait, Sri Lanka, Japan, Timeless&quot;"
              rows={2}
            />
          </section>

          <Separator className="bg-[rgba(26,16,8,0.08)]" />

          {/* ─── Section Visibility ─── */}
          <section>
            <h2 className="mb-1 text-base font-semibold text-[#1a1008]">Section Visibility</h2>
            <p className="mb-4 text-sm text-[#6b5a4a]">Toggle entire sections on or off for the public site.</p>
            <div className="space-y-3">
              {(
                [
                  ["show_marquee", "Marquee", "Scrolling text band at the top"],
                  ["show_work", "Portfolio / Work", "Photo gallery with category tabs"],
                  ["show_story", "Story", "Portfolio narrative section"],
                  ["show_process", "Experience / Process", "The 3-step craft section"],
                  ["show_services", "Strengths / Services", "Service cards section"],
                  ["show_packages", "Packages / Pricing", "Pricing cards section"],
                  ["show_testimonials", "Testimonials", "Client reviews section"],
                ] as [keyof FormData, string, string][]
              ).map(([name, label, description]) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-[rgba(26,16,8,0.1)] bg-[#faf8f5] px-4 py-3">
                      <div>
                        <FormLabel className="text-sm font-medium text-[#1a1008]">{label}</FormLabel>
                        <FormDescription className="text-xs text-[#8B6B3D]">{description}</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={(field.value as boolean) ?? true}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </section>

          <Separator className="bg-[rgba(26,16,8,0.08)]" />

          {/* ─── Hero ─── */}
          <section>
            <h2 className="mb-4 text-base font-semibold text-[#1a1008]">Hero Section</h2>
            <div className="space-y-4">
              <FF form={form} name="hero_heading" label="Heading" />
              <FF form={form} name="hero_subtext" label="Sub-text" />
            </div>
          </section>

          <Separator className="bg-[rgba(26,16,8,0.08)]" />

          {/* ─── About ─── */}
          <section>
            <h2 className="mb-4 text-base font-semibold text-[#1a1008]">About Section</h2>
            <div className="space-y-4">
              <FFTextarea form={form} name="about_text" label="About Text" rows={5} />
              <div className="grid grid-cols-2 gap-4">
                <FF form={form} name="stat_1_value" label="Stat 1 — Value" placeholder="120+" />
                <FF form={form} name="stat_1_label" label="Stat 1 — Label" placeholder="Wedding stories told" />
                <FF form={form} name="stat_2_value" label="Stat 2 — Value" placeholder="5K+" />
                <FF form={form} name="stat_2_label" label="Stat 2 — Label" placeholder="Portraits delivered" />
                <FF form={form} name="stat_3_value" label="Stat 3 — Value" placeholder="Island-wide" />
                <FF form={form} name="stat_3_label" label="Stat 3 — Label" placeholder="Available across Sri Lanka" />
              </div>
            </div>
          </section>

          <Separator className="bg-[rgba(26,16,8,0.08)]" />

          {/* ─── Contact ─── */}
          <section>
            <h2 className="mb-4 text-base font-semibold text-[#1a1008]">Contact Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FF form={form} name="contact_email" label="Email" type="email" />
                <FF form={form} name="contact_phone" label="Phone" placeholder="+94 77 000 0000" />
              </div>
              <FF form={form} name="contact_location" label="Location" placeholder="Colombo, Sri Lanka" />
            </div>
          </section>

          <Separator className="bg-[rgba(26,16,8,0.08)]" />

          {/* ─── Quote ─── */}
          <section>
            <h2 className="mb-4 text-base font-semibold text-[#1a1008]">Quote Section</h2>
            <div className="space-y-4">
              <FFTextarea form={form} name="quote_text" label="Quote" rows={3} />
              <FF form={form} name="quote_author" label="Attribution" />
            </div>
          </section>

          <Separator className="bg-[rgba(26,16,8,0.08)]" />

          {/* ─── SEO / Footer ─── */}
          <section>
            <h2 className="mb-4 text-base font-semibold text-[#1a1008]">SEO & Footer</h2>
            <div className="space-y-4">
              <FF form={form} name="meta_title" label="Page Title (browser tab)" />
              <FFTextarea
                form={form}
                name="meta_description"
                label="Meta Description"
                rows={2}
                description="Shown in search results (aim for 150–160 chars)"
              />
              <FF form={form} name="footer_text" label="Footer Text" />
            </div>
          </section>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-[#C9A96E] text-[#1a1008] hover:bg-[#b8945a] px-8"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

function ColorField({
  form,
  name,
  label,
  description,
  defaultColor,
}: {
  form: ReturnType<typeof useForm<FormData>>;
  name: keyof FormData;
  label: string;
  description: string;
  defaultColor: string;
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-[#1a1008]">{label}</FormLabel>
          <FormControl>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={(field.value as string) ?? defaultColor}
                onChange={(e) => field.onChange(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded border border-[rgba(26,16,8,0.15)] bg-transparent p-0.5"
              />
              <Input
                value={(field.value as string) ?? defaultColor}
                onChange={(e) => field.onChange(e.target.value)}
                className="font-mono uppercase"
                maxLength={7}
                placeholder={defaultColor}
              />
            </div>
          </FormControl>
          <FormDescription className="text-[#8B6B3D]">{description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function FF({
  form,
  name,
  label,
  description,
  placeholder,
  type = "text",
}: {
  form: ReturnType<typeof useForm<FormData>>;
  name: keyof FormData;
  label: string;
  description?: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-[#1a1008]">{label}</FormLabel>
          <FormControl>
            <Input type={type} placeholder={placeholder} {...field} value={(field.value as string) ?? ""} />
          </FormControl>
          {description && <FormDescription className="text-[#8B6B3D]">{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function FFTextarea({
  form,
  name,
  label,
  description,
  rows = 3,
}: {
  form: ReturnType<typeof useForm<FormData>>;
  name: keyof FormData;
  label: string;
  description?: string;
  rows?: number;
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-[#1a1008]">{label}</FormLabel>
          <FormControl>
            <Textarea rows={rows} {...field} value={(field.value as string) ?? ""} />
          </FormControl>
          {description && <FormDescription className="text-[#8B6B3D]">{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
