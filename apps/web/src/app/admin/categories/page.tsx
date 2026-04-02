"use client";

import { API_URL } from '@/lib/api';
import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default function CategoriesPage() {
    const { token } = useAuthStore();
    const [categories, setCategories] = useState<{ id: number; name: string; description: string }[]>([]);
    const [newCategory, setNewCategory] = useState({ name: "", description: "" });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = () => {
        fetch(`${API_URL}/categories`)
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(console.error);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/categories`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(newCategory),
            });

            if (res.ok) {
                setNewCategory({ name: "", description: "" });
                fetchCategories();
            } else {
                const data = await res.json();
                alert(data.message || "Failed to create category");
            }
        } catch (error) {
            alert("Error creating category");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this category?")) return;

        try {
            const res = await fetch(`${API_URL}/categories/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (res.ok) {
                fetchCategories();
            } else {
                alert("Failed to delete category");
            }
        } catch (error) {
            alert("Error deleting category");
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Manage Categories</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Create Form */}
                <div className="md:col-span-1 bg-card border rounded-lg p-6 shadow-sm h-fit">
                    <h2 className="text-lg font-semibold mb-4">Add New Category</h2>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Name</label>
                            <input
                                required
                                value={newCategory.name}
                                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                className="w-full border rounded-md p-2 bg-background"
                                placeholder="e.g. 3D Printer Parts"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                                value={newCategory.description}
                                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                                className="w-full border rounded-md p-2 bg-background"
                                rows={3}
                                placeholder="Optional description..."
                            />
                        </div>
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? "Creating..." : "Create Category"}
                        </Button>
                    </form>
                </div>

                {/* List View */}
                <div className="md:col-span-2 bg-card border rounded-lg shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="text-left p-4 font-medium text-sm">Name</th>
                                    <th className="text-left p-4 font-medium text-sm">Description</th>
                                    <th className="text-right p-4 font-medium text-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {categories.map(category => (
                                    <tr key={category.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="p-4 font-medium">{category.name}</td>
                                        <td className="p-4 text-sm text-muted-foreground">{category.description || "-"}</td>
                                        <td className="p-4 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(category.id)}
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {categories.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="p-8 text-center text-muted-foreground">
                                            No categories found. Create one to get started!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
