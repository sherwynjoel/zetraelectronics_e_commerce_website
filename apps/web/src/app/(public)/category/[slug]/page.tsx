import { permanentRedirect } from "next/navigation";
import { categoryHref, getCategories } from "@/lib/store-data";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/** Legacy /category/<slug> URLs land on the catalog with that category selected. */
export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const all = await getCategories();
  const match = all.find((c) => slugify(c.name) === slugify(decodeURIComponent(slug)));
  const name =
    match?.name ??
    slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  permanentRedirect(categoryHref(name));
}
