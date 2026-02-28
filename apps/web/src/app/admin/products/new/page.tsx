"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/admin/image-upload";
import { useAuthStore } from "@/lib/auth-store";

export default function CreateProductPage() {
    const router = useRouter();
    const { token } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "",
        image: "",
        specs: "",
        datasheet: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("http://localhost:4000/products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                    stock: parseInt(formData.stock),
                    // @ts-ignore
                    shippingCost: parseFloat(formData.shippingCost || "0"),
                }),
            });

            if (res.ok) {
                router.push("/admin/products");
                router.refresh();
            } else {
                alert("Failed to create product");
            }
        } catch (error) {
            console.error(error);
            alert("Error creating product");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Create New Product</h2>

            <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 border rounded-xl">
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Product Name</label>
                        <input name="name" required className="w-full border rounded-md p-2 bg-background" onChange={handleChange} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <select name="category" required className="w-full border rounded-md p-2 bg-background" onChange={handleChange}>
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
                            <input name="price" type="number" step="0.01" required className="w-full border rounded-md p-2 bg-background" onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Stock Quantity</label>
                            <input name="stock" type="number" required className="w-full border rounded-md p-2 bg-background" onChange={handleChange} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Shipping Cost (₹)</label>
                        <input name="shippingCost" type="number" step="0.01" className="w-full border rounded-md p-2 bg-background" onChange={handleChange} placeholder="0.00" />
                        <p className="text-xs text-muted-foreground mt-1">Extra cost per unit added to the bill.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Product Image</label>
                        <ImageUpload value={formData.image} onChange={(url) => setFormData({ ...formData, image: url })} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea name="description" rows={4} className="w-full border rounded-md p-2 bg-background" onChange={handleChange} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Datasheet URL (PDF)</label>
                        <input name="datasheet" placeholder="https://..." className="w-full border rounded-md p-2 bg-background" onChange={handleChange} />
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Create Product"}</Button>
                </div>
            </form>
        </div>
    );
}
