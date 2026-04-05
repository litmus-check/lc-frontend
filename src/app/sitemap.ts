import { MetadataRoute } from "next";

const BASE_URL = "https://litmuscheck.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
    },
    {
      url: `${BASE_URL}/managed-qa`,
      lastModified: new Date(),
    },
  ];
}
