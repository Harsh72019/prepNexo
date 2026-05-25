import type { MetadataRoute } from "next";

const siteUrl = process.env.WEB_URL ?? "https://prepnexo.online";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/register"],
        disallow: [
          "/admin",
          "/admin/",
          "/dashboard",
          "/dashboard/",
          "/onboarding",
          "/onboarding/",
          "/analytics",
          "/analytics/",
          "/ai-coach",
          "/ai-coach/",
          "/coding",
          "/coding/",
          "/dsa-arena",
          "/dsa-arena/",
          "/leaderboard",
          "/leaderboard/",
          "/system-design",
          "/system-design/",
          "/billing",
          "/billing/",
          "/api/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
