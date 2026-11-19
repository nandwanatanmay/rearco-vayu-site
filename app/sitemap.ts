import type { MetadataRoute } from "next";
import { vayu } from "@/data/site";

const base = "https://rearco.in";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", vayu.href, "/trust", "/brands/exquisite", "/brands/royale", "/legal/disclaimer", "/legal/privacy"].map((p) => ({
    url: `${base}${p}`,
    changeFrequency: p === vayu.href ? "weekly" : "monthly",
    priority: p === "" ? 1 : p === vayu.href ? 0.9 : 0.5,
  }));
}
