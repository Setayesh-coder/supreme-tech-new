import { mkdir, writeFile } from "node:fs/promises";

const BASE_URL = "https://supremetech.ir";
const API_BASE = `${BASE_URL}/api/v1`;

const staticRoutes = [
  "/",
  "/services",
  "/about",
  "/contact",
  "/approach",
  "/blog",
  "/events",
  "/courses",
];

async function fetchAll(endpoint) {
  const items = [];
  let page = 1;
  const size = 10;

  while (true) {
    const url = `${API_BASE}/${endpoint}?page=${page}&size=${size}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch ${url}: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!Array.isArray(data.items)) {
      throw new Error(`Invalid response format from ${url}`);
    }

    items.push(...data.items);

    const total = Number(data.total ?? items.length);

    if (items.length >= total || data.items.length === 0) {
      break;
    }

    page++;
  }

  return items;
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

async function main() {
  const [blogs, courses, events] = await Promise.all([
    fetchAll("blog"),
    fetchAll("courses"),
    fetchAll("events"),
  ]);

  const dynamicRoutes = [
    ...blogs
      .filter((item) => item.slug)
      .map((item) => `/blog/${encodeURIComponent(item.slug)}`),

    ...courses
      .filter((item) => item.slug && item.is_active !== false)
      .map((item) => `/courses/${encodeURIComponent(item.slug)}`),

    ...events
      .filter((item) => item.slug && item.is_active !== false)
      .map((item) => `/events/${encodeURIComponent(item.slug)}`),
  ];

  const routes = [...new Set([...staticRoutes, ...dynamicRoutes])];

  const urls = routes
    .map(
      (route) => `  <url>
    <loc>${escapeXml(`${BASE_URL}${route}`)}</loc>
  </url>`
    )
    .join("\n");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  await mkdir("public", { recursive: true });
  await writeFile("public/sitemap.xml", sitemap, "utf8");

  console.log(`Sitemap generated: ${routes.length} URLs`);
  console.log(`Blog posts: ${blogs.length}`);
  console.log(`Courses: ${courses.length}`);
  console.log(`Events: ${events.length}`);
}

main().catch((error) => {
  console.error("Sitemap generation failed:");
  console.error(error);
  process.exit(1);
});
