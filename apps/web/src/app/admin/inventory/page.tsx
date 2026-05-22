"use client";

import React, { useEffect, useState } from "react";
import { API_URL } from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Plus, Package, Tags, Trash2, Search, Filter } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/lib/auth-store";
import { formatImageUrl } from "@/lib/utils";
import { ProductActions } from "@/components/admin/product-actions";

export default function InventoryPage() {
    const { token } = useAuthStore();
    const [activeTab, setActiveTab] = useState<"products" | "categories">("products");
    
    // Products State
    const [products, setProducts] = useState<any[]>([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Categories State
    const [categories, setCategories] = useState<any[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [newCategory, setNewCategory] = useState({ name: "", description: "", parentId: "" });
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        setProductsLoading(true);
        try {
            const res = await fetch(`${API_URL}/products`);
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setProductsLoading(false);
        }
    };

    const fetchCategories = async () => {
        setCategoriesLoading(true);
        try {
            const res = await fetch(`${API_URL}/categories`);
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setCategoriesLoading(false);
        }
    };

    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreatingCategory(true);
        try {
            const body: any = { name: newCategory.name, description: newCategory.description };
            if (newCategory.parentId) body.parentId = Number(newCategory.parentId);
            const res = await fetch(`${API_URL}/categories`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                setNewCategory({ name: "", description: "", parentId: "" });
                fetchCategories();
            } else {
                const data = await res.json();
                alert(data.message || "Failed to create category");
            }
        } catch (error) {
            alert("Error creating category");
        } finally {
            setIsCreatingCategory(false);
        }
    };

    const handleDeleteCategory = async (id: number) => {
        if (!confirm("Are you sure you want to delete this category?")) return;
        try {
            const res = await fetch(`${API_URL}/categories/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) fetchCategories();
            else alert("Failed to delete category. Ensure no products are linked to it.");
        } catch (error) {
            alert("Error deleting category");
        }
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
                    <p className="text-muted-foreground">Manage your products and categories in one place.</p>
                </div>
                {activeTab === "products" && (
                    <Link href="/admin/products/new">
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" /> Add Product
                        </Button>
                    </Link>
                )}
            </div>

            {/* Tab Switcher */}
            <div className="flex p-1 bg-muted rounded-lg w-fit border">
                <button
                    onClick={() => setActiveTab("products")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        activeTab === "products" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                    <Package className="h-4 w-4" /> Products
                </button>
                <button
                    onClick={() => setActiveTab("categories")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        activeTab === "categories" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                    <Tags className="h-4 w-4" /> Categories
                </button>
            </div>

            {/* Products Content */}
            {activeTab === "products" && (
                <div className="space-y-4">
                    <div className="flex items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search products or categories..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-muted/20 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <Button variant="outline" className="gap-2">
                            <Filter className="h-4 w-4" /> Filter
                        </Button>
                    </div>

                    <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 text-muted-foreground border-b uppercase text-[10px] tracking-wider font-bold">
                                    <tr>
                                        <th className="p-4">Image</th>
                                        <th className="p-4">Name</th>
                                        <th className="p-4">Category</th>
                                        <th className="p-4">Price</th>
                                        <th className="p-4">Stock</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {productsLoading ? (
                                        <tr><td colSpan={6} className="p-12 text-center text-muted-foreground">Loading products...</td></tr>
                                    ) : filteredProducts.length === 0 ? (
                                        <tr><td colSpan={6} className="p-12 text-center text-muted-foreground">No products found.</td></tr>
                                    ) : (
                                        filteredProducts.map((product: any) => (
                                            <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="p-4">
                                                    <div className="relative h-12 w-12 bg-white border rounded p-1">
                                                        {product.image && (
                                                            <img src={formatImageUrl(product.image)} alt={product.name} className="h-full w-full object-contain" />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4 font-semibold">{product.name}</td>
                                                <td className="p-4">
                                                    <span className="px-2 py-1 bg-primary/5 text-primary text-[10px] font-bold rounded-full border border-primary/10">
                                                        {product.category}
                                                    </span>
                                                </td>
                                                <td className="p-4 font-mono">₹{Number(product.price).toFixed(2)}</td>
                                                <td className="p-4">
                                                    <span className={`font-medium ${product.stock < 10 ? 'text-red-500' : ''}`}>
                                                        {product.stock}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <ProductActions productId={product.id} />
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Categories Content */}
            {activeTab === "categories" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-card border rounded-lg p-6 shadow-sm">
                            <h3 className="font-bold mb-4">Add New Category</h3>
                            <form onSubmit={handleCreateCategory} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Name</label>
                                    <input
                                        required
                                        value={newCategory.name}
                                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                        className="w-full border rounded-md p-2 bg-muted/20"
                                        placeholder="e.g. Microcontrollers"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">
                                        Parent Category <span className="normal-case font-normal">(optional — leave blank for top-level)</span>
                                    </label>
                                    <select
                                        title="Parent Category"
                                        value={newCategory.parentId}
                                        onChange={(e) => setNewCategory({ ...newCategory, parentId: e.target.value })}
                                        className="w-full border rounded-md p-2 bg-muted/20"
                                    >
                                        <option value="">— None (top-level category) —</option>
                                        {categories.filter((c: any) => !c.parentId).map((cat: any) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Description</label>
                                    <textarea
                                        value={newCategory.description}
                                        onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                                        className="w-full border rounded-md p-2 bg-muted/20"
                                        rows={2}
                                        placeholder="Optional description..."
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={isCreatingCategory}>
                                    {isCreatingCategory ? "Creating..." : "Create Category"}
                                </Button>
                            </form>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 text-muted-foreground border-b uppercase text-[10px] tracking-wider font-bold">
                                    <tr>
                                        <th className="p-4">Name</th>
                                        <th className="p-4">Description</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {categoriesLoading ? (
                                        <tr><td colSpan={3} className="p-12 text-center text-muted-foreground">Loading categories...</td></tr>
                                    ) : categories.length === 0 ? (
                                        <tr><td colSpan={3} className="p-12 text-center text-muted-foreground">No categories defined.</td></tr>
                                    ) : (
                                        categories.filter((c: any) => !c.parentId).map((cat: any) => (
                                            <React.Fragment key={cat.id}>
                                                {/* Parent row */}
                                                <tr className="hover:bg-muted/30 transition-colors bg-muted/10">
                                                    <td className="p-4 font-bold">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-primary">⬡</span>
                                                            {cat.name}
                                                            {cat.children?.length > 0 && (
                                                                <span className="text-[10px] font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                                                                    {cat.children.length} sub
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-muted-foreground">{cat.description || "—"}</td>
                                                    <td className="p-4 text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDeleteCategory(cat.id)}
                                                            className="text-red-500 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                                {/* Subcategory rows */}
                                                {cat.children?.map((sub: any) => (
                                                    <tr key={sub.id} className="hover:bg-muted/20 transition-colors">
                                                        <td className="p-4 pl-10">
                                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                                <span>└</span>
                                                                <span className="font-medium text-foreground">{sub.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-muted-foreground">{sub.description || "—"}</td>
                                                        <td className="p-4 text-right">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDeleteCategory(sub.id)}
                                                                className="text-red-500 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
