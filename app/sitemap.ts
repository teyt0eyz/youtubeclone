import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/env";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/trending",
    "/creators",
    "/login",
    "/signup",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: path === "" ? 1 : 0.6,
  }));

  try {
    const supabase = await createClient();
    const [{ data: videos }, { data: creators }] = await Promise.all([
      supabase
        .from("videos")
        .select("id, created_at")
        .eq("visibility", "public")
        .eq("is_removed", false)
        .order("created_at", { ascending: false })
        .limit(1000),
      supabase.from("profiles").select("username").limit(1000),
    ]);

    const videoRoutes: MetadataRoute.Sitemap = (videos ?? []).map((v) => ({
      url: `${base}/watch/${v.id}`,
      lastModified: new Date(v.created_at),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
    const creatorRoutes: MetadataRoute.Sitemap = (creators ?? []).map((c) => ({
      url: `${base}/channel/${c.username}`,
      changeFrequency: "weekly",
      priority: 0.5,
    }));

    return [...staticRoutes, ...videoRoutes, ...creatorRoutes];
  } catch {
    return staticRoutes;
  }
}
