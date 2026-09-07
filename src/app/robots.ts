import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

/**
 * Everything public is crawlable; the per-account and gated areas are not. `/api/` is
 * disallowed because the checkout/webhook routes are machine endpoints, not pages.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/", "/p/", "/profiles", "/reset-password", "/success", "/cancel"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
