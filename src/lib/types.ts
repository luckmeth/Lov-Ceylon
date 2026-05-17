export type Category = string;

export interface HeroSlide {
  id: string;
  storage_key: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface WorkCategory {
  id: string;
  slug: string;
  label: string;
  tag: string;
  intro: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface SiteSettings {
  id: number;
  site_name: string;
  tagline: string;
  photographer_name: string;
  logo_url: string | null;
  hero_heading: string;
  hero_subtext: string;
  about_text: string;
  stat_1_value: string;
  stat_1_label: string;
  stat_2_value: string;
  stat_2_label: string;
  stat_3_value: string;
  stat_3_label: string;
  contact_email: string;
  contact_phone: string | null;
  contact_location: string;
  meta_title: string;
  meta_description: string;
  quote_text: string;
  quote_author: string;
  footer_text: string;
  // Theme — colors
  color_primary?: string;
  color_background?: string;
  color_text?: string;
  color_accent?: string;
  color_card_bg?: string;
  // Theme — fonts
  font_heading?: string;
  font_body?: string;
  // Key site images
  hero_background_url?: string | null;
  about_portrait_url?: string | null;
  story_image_url?: string | null;
  process_image_url?: string | null;
  contact_image_url?: string | null;
  // Marquee text (comma-separated words)
  marquee_words?: string | null;
  // Section visibility
  show_marquee?: boolean;
  show_work?: boolean;
  show_story?: boolean;
  show_process?: boolean;
  show_services?: boolean;
  show_packages?: boolean;
  show_testimonials?: boolean;
}

export interface Photo {
  id: string;
  storage_key: string;
  url: string;
  title: string;
  location: string | null;
  category: Category;
  tall: boolean;
  is_published: boolean;
  sort_order: number;
  created_at: string;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  price: string;
  features: string[];
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  label: string;
  url: string;
  icon: string;
  is_active: boolean;
  sort_order: number;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  service: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Service {
  id: string;
  num: string;
  name: string;
  description: string;
  detail: string;
  icon_name: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface ProcessStep {
  id: string;
  num: string;
  title: string;
  description: string;
  sort_order: number;
  created_at: string;
}

export interface Testimonial {
  id: string;
  client_name: string;
  review_date: string;
  review_text: string;
  rating: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}
