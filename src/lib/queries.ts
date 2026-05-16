import { supabase } from "./supabase";
import type {
  Category,
  ContactSubmission,
  HeroSlide,
  Package,
  Photo,
  SiteSettings,
  SocialLink,
  Testimonial,
  WorkCategory,
} from "./types";

// ─── Hero Slides ──────────────────────────────────────────────────────────────

export const heroSlidesQuery = () => ({
  queryKey: ["hero-slides"],
  queryFn: async (): Promise<HeroSlide[]> => {
    const { data, error } = await supabase
      .from("hero_slides")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    if (error) return [];
    return (data ?? []) as HeroSlide[];
  },
  staleTime: 1000 * 60 * 5,
});

export const allHeroSlidesQuery = () => ({
  queryKey: ["hero-slides", "admin"],
  queryFn: async (): Promise<HeroSlide[]> => {
    const { data, error } = await supabase
      .from("hero_slides")
      .select("*")
      .order("sort_order");
    if (error) return [];
    return (data ?? []) as HeroSlide[];
  },
});

export const uploadHeroSlide = async (
  file: File,
  caption: string,
  existingCount: number,
) => {
  const ext = file.name.split(".").pop() ?? "jpg";
  const storageKey = `hero/${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from("photos")
    .upload(storageKey, file, { contentType: file.type });
  if (uploadError) throw uploadError;
  const { data: urlData } = supabase.storage.from("photos").getPublicUrl(storageKey);
  const { error: insertError } = await supabase.from("hero_slides").insert({
    storage_key: storageKey,
    image_url: urlData.publicUrl,
    caption: caption || null,
    sort_order: existingCount,
    is_active: true,
  });
  if (insertError) throw insertError;
};

export const deleteHeroSlide = async (slide: HeroSlide) => {
  await supabase.storage.from("photos").remove([slide.storage_key]);
  const { error } = await supabase.from("hero_slides").delete().eq("id", slide.id);
  if (error) throw error;
};

export const updateHeroSlide = async (id: string, patch: Partial<HeroSlide>) => {
  const { error } = await supabase.from("hero_slides").update(patch).eq("id", id);
  if (error) throw error;
};

export const updateHeroSlideOrder = async (updates: { id: string; sort_order: number }[]) => {
  const { error } = await supabase.from("hero_slides").upsert(updates);
  if (error) throw error;
};

// ─── Work Categories ──────────────────────────────────────────────────────────

export const categoriesQuery = () => ({
  queryKey: ["work-categories"],
  queryFn: async (): Promise<WorkCategory[]> => {
    const { data, error } = await supabase
      .from("work_categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw error;
    return (data ?? []) as WorkCategory[];
  },
  staleTime: 1000 * 60 * 5,
});

export const allCategoriesQuery = () => ({
  queryKey: ["work-categories", "admin"],
  queryFn: async (): Promise<WorkCategory[]> => {
    const { data, error } = await supabase
      .from("work_categories")
      .select("*")
      .order("sort_order");
    if (error) throw error;
    return (data ?? []) as WorkCategory[];
  },
});

export const createCategory = async (cat: {
  slug: string;
  label: string;
  tag: string;
  intro: string;
}) => {
  const { data: existing } = await supabase
    .from("work_categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);
  const nextOrder = (existing?.[0]?.sort_order ?? -1) + 1;
  const { error } = await supabase
    .from("work_categories")
    .insert({ ...cat, sort_order: nextOrder, is_active: true });
  if (error) throw error;
};

export const updateCategory = async (id: string, patch: Partial<WorkCategory>) => {
  const { error } = await supabase.from("work_categories").update(patch).eq("id", id);
  if (error) throw error;
};

export const deleteCategory = async (id: string) => {
  const { error } = await supabase.from("work_categories").delete().eq("id", id);
  if (error) throw error;
};

// ─── Site Settings ────────────────────────────────────────────────────────────

export const siteSettingsQuery = () => ({
  queryKey: ["site-settings"],
  queryFn: async (): Promise<SiteSettings> => {
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .single();
    if (error) throw error;
    return data as SiteSettings;
  },
  staleTime: 1000 * 60 * 5,
});

export const updateSiteSettings = (settings: Partial<SiteSettings>) =>
  supabase.from("site_settings").update(settings).eq("id", 1);

// ─── Photos ───────────────────────────────────────────────────────────────────

export const photosQuery = (category?: Category) => ({
  queryKey: ["photos", category ?? "all"],
  queryFn: async (): Promise<Photo[]> => {
    let q = supabase
      .from("photos")
      .select("*")
      .eq("is_published", true)
      .order("sort_order");
    if (category) q = q.eq("category", category);
    const { data, error } = await q;
    if (error) throw error;
    return data as Photo[];
  },
});

export const allPhotosQuery = () => ({
  queryKey: ["photos", "admin", "all"],
  queryFn: async (): Promise<Photo[]> => {
    const { data, error } = await supabase
      .from("photos")
      .select("*")
      .order("category")
      .order("sort_order");
    if (error) throw error;
    return data as Photo[];
  },
});

export const uploadPhoto = async (
  file: File,
  category: Category,
  metadata: { title: string; location?: string; tall?: boolean },
  existingCount: number,
) => {
  const ext = file.name.split(".").pop() ?? "jpg";
  const storageKey = `${category}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("photos")
    .upload(storageKey, file, { contentType: file.type });
  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from("photos")
    .getPublicUrl(storageKey);

  const { error: insertError } = await supabase.from("photos").insert({
    storage_key: storageKey,
    url: urlData.publicUrl,
    title: metadata.title,
    location: metadata.location ?? null,
    category,
    tall: metadata.tall ?? false,
    is_published: true,
    sort_order: existingCount,
  });
  if (insertError) throw insertError;
};

export const deletePhoto = async (photo: Photo) => {
  await supabase.storage.from("photos").remove([photo.storage_key]);
  const { error } = await supabase
    .from("photos")
    .delete()
    .eq("id", photo.id);
  if (error) throw error;
};

export const updatePhotoOrder = async (
  updates: { id: string; sort_order: number }[],
) => {
  const { error } = await supabase.from("photos").upsert(updates);
  if (error) throw error;
};

export const updatePhoto = async (
  id: string,
  patch: Partial<Pick<Photo, "title" | "location" | "tall" | "is_published">>,
) => {
  const { error } = await supabase.from("photos").update(patch).eq("id", id);
  if (error) throw error;
};

// ─── Packages ─────────────────────────────────────────────────────────────────

export const packagesQuery = () => ({
  queryKey: ["packages"],
  queryFn: async (): Promise<Package[]> => {
    const { data, error } = await supabase
      .from("packages")
      .select("*")
      .order("sort_order");
    if (error) throw error;
    return data as Package[];
  },
});

export const publicPackagesQuery = () => ({
  queryKey: ["packages", "public"],
  queryFn: async (): Promise<Package[]> => {
    const { data, error } = await supabase
      .from("packages")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw error;
    return data as Package[];
  },
});

export const upsertPackage = async (pkg: Partial<Package> & { name: string; price: string }) => {
  if (pkg.id) {
    const { id, ...updates } = pkg;
    const { error } = await supabase.from("packages").update(updates).eq("id", id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("packages").insert(pkg);
    if (error) throw error;
  }
};

export const deletePackage = async (id: string) => {
  const { error } = await supabase.from("packages").delete().eq("id", id);
  if (error) throw error;
};

// ─── Social Links ─────────────────────────────────────────────────────────────

export const socialLinksQuery = () => ({
  queryKey: ["social-links"],
  queryFn: async (): Promise<SocialLink[]> => {
    const { data, error } = await supabase
      .from("social_links")
      .select("*")
      .order("sort_order");
    if (error) throw error;
    return data as SocialLink[];
  },
});

export const upsertSocialLink = async (link: Partial<SocialLink> & { platform: string; url: string; label: string }) => {
  if (link.id) {
    const { id, ...updates } = link;
    const { error } = await supabase.from("social_links").update(updates).eq("id", id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("social_links").insert(link);
    if (error) throw error;
  }
};

export const deleteSocialLink = async (id: string) => {
  const { error } = await supabase.from("social_links").delete().eq("id", id);
  if (error) throw error;
};

// ─── Contact Submissions ──────────────────────────────────────────────────────

export const submissionsQuery = () => ({
  queryKey: ["submissions"],
  queryFn: async (): Promise<ContactSubmission[]> => {
    const { data, error } = await supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as ContactSubmission[];
  },
});

export const markSubmissionRead = async (id: string, is_read: boolean) => {
  const { error } = await supabase
    .from("contact_submissions")
    .update({ is_read })
    .eq("id", id);
  if (error) throw error;
};

export const submitContactForm = async (data: {
  name: string;
  email: string;
  project_type: string;
  message: string;
}) => {
  const { error } = await supabase.from("contact_submissions").insert(data);
  if (error) throw error;
};

// ─── Testimonials ─────────────────────────────────────────────────────────────

export const testimonialsQuery = () => ({
  queryKey: ["testimonials"],
  queryFn: async (): Promise<Testimonial[]> => {
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("sort_order");
    if (error) throw error;
    return data as Testimonial[];
  },
});

export const publicTestimonialsQuery = () => ({
  queryKey: ["testimonials", "public"],
  queryFn: async (): Promise<Testimonial[]> => {
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw error;
    return data as Testimonial[];
  },
});

export const upsertTestimonial = async (
  t: Partial<Testimonial> & { client_name: string; review_text: string; review_date: string },
) => {
  if (t.id) {
    const { id, ...updates } = t;
    const { error } = await supabase.from("testimonials").update(updates).eq("id", id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("testimonials").insert(t);
    if (error) throw error;
  }
};

export const deleteTestimonial = async (id: string) => {
  const { error } = await supabase.from("testimonials").delete().eq("id", id);
  if (error) throw error;
};
