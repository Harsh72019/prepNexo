import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PrepNexo",
    short_name: "PrepNexo",
    description:
      "AI interview prep, daily DSA arena battles, system design practice, and adaptive analytics.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#ff006e",
    icons: [
      {
        src: "/brand/favicon.png",
        sizes: "1024x1024",
        type: "image/png",
      },
    ],
  };
}
