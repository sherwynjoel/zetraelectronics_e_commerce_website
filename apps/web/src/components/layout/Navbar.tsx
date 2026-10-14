import { categoryTree, getCategories } from "@/lib/store-data";
import { NavBar } from "./nav-bar";

export async function Navbar() {
  const categories = categoryTree(await getCategories());
  return <NavBar categories={categories} />;
}
