import type { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/utils/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/mypage/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
