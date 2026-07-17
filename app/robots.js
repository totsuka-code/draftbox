const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://draftbox.app";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/auth/", "/s/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}