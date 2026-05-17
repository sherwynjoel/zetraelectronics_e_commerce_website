import { API_URL } from '@/lib/api';
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroSearchBar } from "@/components/layout/HeroSearchBar";

async function getProducts() {
  try {
    const res = await fetch(`${API_URL}/products`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    console.error("Failed to fetch products:", e);
    return [];
  }
}

async function getSettings() {
  try {
    const res = await fetch(`${API_URL}/settings`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    console.error("Failed to fetch settings:", e);
    return [];
  }
}

async function getCategories() {
  try {
    const res = await fetch(`${API_URL}/categories`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    console.error("Failed to fetch categories:", e);
    return [];
  }
}

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await getProducts();
  const settingsData = await getSettings();
  const categories = await getCategories();
  
  const heroImage = settingsData.find((s: any) => s.key === "HOME_HERO_IMAGE")?.value || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000";
  const heroSubtext = settingsData.find((s: any) => s.key === "HOME_HERO_SUBTEXT")?.value || "Your premium destination for electronic components, sensors, IoT modules, and robotics kits. Enterprise-grade quality for hobbyists and professionals.";

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-white text-slate-900 py-12 md:py-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 md:space-y-6 max-w-2xl w-full">

            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-tight">
              Build the Future with <br />
              <span className="text-primary italic">Zetra Electronics</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-500">
              {heroSubtext}
            </p>
            <HeroSearchBar />
            <div className="flex gap-4 pt-4">
              <Link href="/products">
                <Button size="lg" className="rounded-full bg-primary hover:bg-primary/90 text-white border-0 px-8">
                  Browse Catalog
                </Button>
              </Link>
            </div>
          </div>
          {/* Abstract Tech Graphic Placeholder */}
          <div className="w-full max-w-md h-48 sm:h-64 bg-slate-100 rounded-2xl border border-slate-200 relative overflow-hidden flex items-center justify-center">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${heroImage}')` }}
            ></div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 md:py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-8">Popular Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
            {categories.length > 0 ? categories.map((cat: any) => (
              <Link key={cat.id} href={`/products?category=${encodeURIComponent(cat.name)}`}>
                <div className="bg-card p-4 rounded-xl border hover:border-primary transition-all cursor-pointer shadow-sm hover:shadow-md text-center group h-full">
                  <div className="font-semibold group-hover:text-primary transition-colors text-sm md:text-base">{cat.name}</div>
                </div>
              </Link>
            )) : (
              <div className="col-span-full text-sm text-muted-foreground text-center py-4">No categories found</div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-10 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4 sm:mb-8">
            <h2 className="text-xl sm:text-3xl font-bold">Featured Products</h2>
            <Link href="/products" className="text-primary hover:underline flex items-center gap-1 font-semibold">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {products.length > 0 ? products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            )) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed text-center">
                <p className="mb-2">Connecting to inventory system...</p>
                <p className="text-xs">Ensure Backend API is running on localhost:4000</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
