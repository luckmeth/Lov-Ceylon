import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { allCategoriesQuery, allPhotosQuery } from "@/lib/queries";
import { PhotoUploader } from "@/components/admin/PhotoUploader";
import { PhotoGrid } from "@/components/admin/PhotoGrid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/admin/photos")({ component: AdminPhotos });

function AdminPhotos() {
  const { data: allPhotos = [], isLoading: photosLoading } = useQuery(allPhotosQuery());
  const { data: categories = [], isLoading: catsLoading } = useQuery(allCategoriesQuery());
  const [activeTab, setActiveTab] = useState<string>("");

  const isLoading = photosLoading || catsLoading;

  // Set first tab once categories load
  if (categories.length > 0 && !activeTab) setActiveTab(categories[0].slug);

  const byCategory = (slug: string) => allPhotos.filter((p) => p.category === slug);

  if (catsLoading) {
    return (
      <div className="p-8">
        <p className="text-sm text-[#8B6B3D]">Loading…</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold text-[#1a1008]">Photos</h1>
        <div className="mt-6 rounded-xl border border-dashed border-[rgba(26,16,8,0.15)] py-16 text-center">
          <p className="text-sm text-[#8B6B3D]">No categories yet.</p>
          <Link
            to="/admin/categories"
            className="mt-3 inline-block text-sm font-medium text-[#C9A96E] underline-offset-2 hover:underline"
          >
            Create your first category →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1a1008]">Photos</h1>
        <p className="mt-1 text-sm text-[#6b5a4a]">
          Upload, organise, and manage portfolio photos. Drag to reorder. Hover a photo to
          publish/hide or delete it.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 flex-wrap bg-[#f0ede8]">
          {categories.map((cat) => (
            <TabsTrigger
              key={cat.slug}
              value={cat.slug}
              className="data-[state=active]:bg-white data-[state=active]:text-[#1a1008]"
            >
              {cat.label}
              <span className="ml-1.5 text-[#8B6B3D] text-xs">
                ({byCategory(cat.slug).length})
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((cat) => (
          <TabsContent key={cat.slug} value={cat.slug} className="space-y-6">
            <div className="rounded-xl border border-[rgba(26,16,8,0.08)] bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-[#1a1008]">
                Upload to {cat.label}
              </h2>
              <PhotoUploader defaultCategory={cat.slug} categories={categories} />
            </div>

            <div className="rounded-xl border border-[rgba(26,16,8,0.08)] bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-[#1a1008]">
                {cat.label} Gallery
                {isLoading && (
                  <span className="ml-2 text-xs font-normal text-[#8B6B3D]">Loading…</span>
                )}
              </h2>
              <PhotoGrid photos={byCategory(cat.slug)} />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
