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

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await getProducts();
  const settingsData = await getSettings();
  
  const heroImage = settingsData.find((s: any) => s.key === "HOME_HERO_IMAGE")?.value || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000";
  const heroSubtext = settingsData.find((s: any) => s.key === "HOME_HERO_SUBTEXT")?.value || "Your premium destination for electronic components, sensors, IoT modules, and robotics kits. Enterprise-grade quality for hobbyists and professionals.";

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-6 max-w-2xl">

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Build the Future with <span className="text-primary">Zetra Electronics</span>
            </h1>
            <p className="text-lg text-slate-300">
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
          <div className="w-full max-w-md h-64 bg-slate-800/50 rounded-2xl border border-white/10 relative overflow-hidden flex items-center justify-center">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${heroImage}')` }}
            ></div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Popular Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {["Development Boards", "Sensors", "Robotics", "IoT & Wireless", "Tools", "Batteries"].map((cat) => (
              <Link key={cat} href={`/products?category=${encodeURIComponent(cat)}`}>
                <div className="bg-card p-4 rounded-xl border hover:border-primary transition-all cursor-pointer shadow-sm hover:shadow-md text-center group h-full">
                  <div className="font-semibold group-hover:text-primary transition-colors text-sm md:text-base">{cat}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Featured Products</h2>
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
