"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ImageUpload } from "@/components/admin/image-upload";
import { useAuthStore } from "@/lib/auth-store";

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const { token } = useAuthStore();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "",
        image: "",
        datasheet: "",
        specs: "",
    });

    useEffect(() => {
        if (!id) return;
        fetch(`http://localhost:4000/products/${id}`)
            .then(res => {
                if (!res.ok) throw new Error("Product not found");
                return res.json();
            })
            .then(data => {
                setFormData({
                    name: data.name,
                    description: data.description || "",
                    price: data.price ? Number(data.price).toString() : "",
                    stock: data.stock ? Number(data.stock).toString() : "",
                    category: data.category,
                    image: data.image || "",
                    datasheet: data.datasheet || "",
                    specs: data.specs || "",
                });
            })
            .catch(err => {
                console.error(err);
                alert("Error fetching product");
                router.push("/admin/products");
            })
            .finally(() => setFetching(false));
    }, [id, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`http://localhost:4000/products/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                    stock: parseInt(formData.stock),
                }),
            });

            if (res.ok) {
                router.push("/admin/products");
                router.refresh();
            } else {
                alert("Failed to update product");
            }
        } catch (error) {
            console.error(error);
            alert("Error updating product");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Edit Product</h2>

            <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 border rounded-xl">
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Product Name</label>
                        <input name="name" required className="w-full border rounded-md p-2 bg-background" value={formData.name} onChange={handleChange} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <select name="category" required className="w-full border rounded-md p-2 bg-background" value={formData.category} onChange={handleChange}>
                            <option value="">Select Category</option>
                            <option value="Development Boards">Development Boards</option>
                            <option value="Sensors">Sensors</option>
                            <option value="Robotics">Robotics</option>
                            <option value="IoT & Wireless">IoT & Wireless</option>
                            <option value="Tools">Tools</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Price (₹)</label>
                            <input name="price" type="number" step="0.01" required className="w-full border rounded-md p-2 bg-background" value={formData.price} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Stock Quantity</label>
                            <input name="stock" type="number" required className="w-full border rounded-md p-2 bg-background" value={formData.stock} onChange={handleChange} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Product Image</label>
                        <ImageUpload value={formData.image} onChange={(url) => setFormData({ ...formData, image: url })} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea name="description" rows={4} className="w-full border rounded-md p-2 bg-background" value={formData.description} onChange={handleChange} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Datasheet URL (PDF)</label>
                        <input name="datasheet" placeholder="https://..." className="w-full border rounded-md p-2 bg-background" value={formData.datasheet} onChange={handleChange} />
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Update Product"}</Button>
                </div>
            </form>
        </div>
    );
}
