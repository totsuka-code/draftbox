const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://draftbox.app";

const routes = [
  "",
  "/about",
  "/help",
  "/limits",
  "/privacy",
  "/terms",
  "/contact",
];

export default function sitemap() {
  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.6,
  }));
}