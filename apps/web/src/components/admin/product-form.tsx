"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { API_URL } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { adminSend } from "@/lib/admin-api";
import { categoryTree, type Category } from "@/lib/store-data";
import { ImageUpload } from "@/components/admin/image-upload";
import { FormError } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { SelectField, TextField, TextareaField } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";

export type ProductFormValues = {
  name: string;
  category: string;
  price: string;
  stock: string;
  shippingCost: string;
  image: string;
  description: string;
  datasheet: string;
  specs: string;
};

export const emptyProduct: ProductFormValues = {
  name: "",
  category: "",
  price: "",
  stock: "",
  shippingCost: "0",
  image: "",
  description: "",
  datasheet: "",
  specs: "",
};

type SpecRow = { key: string; value: string };

function parseSpecs(raw: string): SpecRow[] {
  try {
    const o = raw ? JSON.parse(raw) : {};
    return Object.entries(o).map(([key, value]) => ({ key, value: String(value) }));
  } catch {
    return [];
  }
}

function serializeSpecs(rows: SpecRow[]) {
  const o: Record<string, string> = {};
  for (const r of rows) if (r.key.trim()) o[r.key.trim()] = r.value.trim();
  return Object.keys(o).length ? JSON.stringify(o) : "";
}

export function ProductForm({ initial, productId }: { initial: ProductFormValues; productId?: number }) {
  const router = useRouter();
  const { token } = useAuthStore();
  const [v, setV] = useState(initial);
  const [specs, setSpecs] = useState<SpecRow[]>(() => parseSpecs(initial.specs));
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/categories`)
      .then((r) => (r.ok ? r.json() : []))
      .then((all: Category[]) => setCategories(categoryTree(all)))
      .catch(() => {});
  }, []);

  const set = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setV((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const body = {
      ...v,
      price: parseFloat(v.price),
      stock: parseInt(v.stock, 10),
      shippingCost: parseFloat(v.shippingCost || "0"),
      specs: serializeSpecs(specs),
    };
    try {
      if (productId) await adminSend(token, `/products/${productId}`, "PATCH", body);
      else await adminSend(token, "/products", "POST", body);
      toast.success(productId ? "Product saved" : "Product created", v.name);
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the product");
      setSaving(false);
    }
  };

  const section = "glass glass-thick grid gap-5 rounded-[var(--radius-pane)] p-5 sm:p-7";

  return (
    <form onSubmit={submit} className="grid gap-5 pb-24 lg:pb-0">
      <FormError>{error}</FormError>

      <section className={section} aria-labelledby="basics">
        <h2 id="basics" className="text-lg font-bold text-ink">
          Basics
        </h2>
        <TextField label="Product name" name="name" required value={v.name} onChange={set} />
        <SelectField label="Category" name="category" required value={v.category} onChange={set}>
          <option value="" disabled>
            Choose a category
          </option>
          {v.category && !categories.some((c) => c.name === v.category || c.children?.some((s) => s.name === v.category)) && (
            <option value={v.category}>{v.category}</option>
          )}
          {categories.map((c) => [
            <option key={c.id} value={c.name}>
              {c.name}
            </option>,
            ...(c.children ?? []).map((s) => (
              <option key={s.id} value={s.name}>
                {"  — "}
                {s.name}
              </option>
            )),
          ])}
        </SelectField>
        <TextareaField label="Description" name="description" rows={5} value={v.description} onChange={set} />
      </section>

      <section className={section} aria-labelledby="pricing">
        <h2 id="pricing" className="text-lg font-bold text-ink">
          Price and stock
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField label="Price (₹)" name="price" type="number" inputMode="decimal" step="0.01" min={0} required value={v.price} onChange={set} hint="Including GST" />
          <TextField label="Stock" name="stock" type="number" inputMode="numeric" min={0} step={1} required value={v.stock} onChange={set} />
          <TextField label="Shipping per unit (₹)" name="shippingCost" type="number" inputMode="decimal" step="0.01" min={0} value={v.shippingCost} onChange={set} hint="0 for free shipping" />
        </div>
      </section>

      <section className={section} aria-labelledby="media">
        <h2 id="media" className="text-lg font-bold text-ink">
          Photo and datasheet
        </h2>
        <ImageUpload value={v.image} onChange={(url) => setV((p) => ({ ...p, image: url }))} />
        <TextField label="Datasheet link (PDF)" name="datasheet" type="url" placeholder="https://…" value={v.datasheet} onChange={set} />
      </section>

      <section className={section} aria-labelledby="specs-title">
        <div className="flex items-center justify-between gap-3">
          <h2 id="specs-title" className="text-lg font-bold text-ink">
            Specifications
          </h2>
          <Button type="button" variant="glass" size="sm" onClick={() => setSpecs((s) => [...s, { key: "", value: "" }])}>
            <Plus className="size-4" aria-hidden />
            Add row
          </Button>
        </div>
        {specs.length === 0 ? (
          <p className="text-sm text-ink-3">No specifications yet. Add rows such as “Operating voltage” and “5 V”.</p>
        ) : (
          <ul className="grid gap-3">
            {specs.map((row, i) => (
              <li key={i} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
                <TextField
                  label="Name"
                  labelHidden={i > 0}
                  value={row.key}
                  placeholder="Operating voltage"
                  onChange={(e) => setSpecs((s) => s.map((r, j) => (j === i ? { ...r, key: e.target.value } : r)))}
                />
                <TextField
                  label="Value"
                  labelHidden={i > 0}
                  value={row.value}
                  placeholder="5 V"
                  onChange={(e) => setSpecs((s) => s.map((r, j) => (j === i ? { ...r, value: e.target.value } : r)))}
                />
                <button
                  type="button"
                  aria-label={`Remove specification ${row.key || i + 1}`}
                  onClick={() => setSpecs((s) => s.filter((_, j) => j !== i))}
                  className="grid size-11 place-items-center rounded-full text-ink-3 hover:bg-danger-soft hover:text-danger"
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="glass glass-thick fixed inset-x-3 bottom-3 z-20 flex justify-end gap-2 rounded-full p-2 lg:static lg:inset-auto lg:rounded-[var(--radius-pane)] lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none lg:before:hidden">
        <Button type="button" variant="ghost" onClick={() => router.back()} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          {productId ? "Save changes" : "Create product"}
        </Button>
      </div>
    </form>
  );
}
