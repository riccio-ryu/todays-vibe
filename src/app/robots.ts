import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://todays-vibe-ca912.web.app";

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
