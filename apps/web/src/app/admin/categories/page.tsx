"use client";

import { useState } from "react";
import { Tags, Trash2 } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { adminSend, useAdminGet } from "@/lib/admin-api";
import { categoryTree, type Category } from "@/lib/store-data";
import { AdminHeader } from "@/components/admin/admin-shell";
import { FormError } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { confirmAction } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { SelectField, TextField } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";

export default function CategoriesPage() {
  const { token } = useAuthStore();
  const { data, loading, reload } = useAdminGet<Category[]>("/categories");
  const [form, setForm] = useState({ name: "", description: "", parentId: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const tree = categoryTree(data ?? []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body: Record<string, unknown> = { name: form.name.trim(), description: form.description.trim() };
      if (form.parentId) body.parentId = Number(form.parentId);
      await adminSend(token, "/categories", "POST", body);
      toast.success("Category added", form.name.trim());
      setForm({ name: "", description: "", parentId: "" });
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add the category");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c: Category) => {
    const ok = await confirmAction({
      title: `Delete “${c.name}”?`,
      body: "Products keep their category name, but it will no longer appear in menus or filters.",
      confirmLabel: "Delete category",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await adminSend(token, `/categories/${c.id}`, "DELETE");
      toast.success("Category deleted", c.name);
      reload();
    } catch (err) {
      toast.error("Category not deleted", err instanceof Error ? err.message : "Remove its subcategories first.");
    }
  };

  const Row = ({ c, sub }: { c: Category; sub?: boolean }) => (
    <li className={sub ? "ml-6 border-l border-line pl-4" : ""}>
      <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-brand-soft">
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-ink">{c.name}</span>
          {c.description && <span className="block truncate text-sm text-ink-3">{c.description}</span>}
        </span>
        <button
          type="button"
          onClick={() => remove(c)}
          aria-label={`Delete ${c.name}`}
          className="grid size-9 shrink-0 place-items-center rounded-full text-ink-3 hover:bg-danger-soft hover:text-danger"
        >
          <Trash2 className="size-4" aria-hidden />
        </button>
      </div>
    </li>
  );

  return (
    <>
      <AdminHeader title="Categories" description="Shown in the store menu, filters and footer." />
      <div className="grid gap-6 lg:grid-cols-[22rem_1fr] lg:items-start">
        <form onSubmit={create} className="glass glass-thick grid gap-4 rounded-[var(--radius-pane)] p-5 sm:p-6 lg:sticky lg:top-8">
          <h2 className="text-lg font-bold text-ink">Add a category</h2>
          <FormError>{error}</FormError>
          <TextField label="Name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <TextField label="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} hint="Optional" />
          <SelectField label="Parent category" value={form.parentId} onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))} hint="Leave empty for a top-level category">
            <option value="">None (top level)</option>
            {tree.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </SelectField>
          <Button type="submit" loading={saving} disabled={!form.name.trim()}>
            Add category
          </Button>
        </form>

        <section aria-label="All categories" className="glass glass-regular rounded-[var(--radius-pane)] p-3 sm:p-4">
          {loading && !data ? (
            <Skeleton className="h-64" />
          ) : tree.length === 0 ? (
            <EmptyState icon={Tags} title="No categories yet" body="Add one to organise the catalog." className="shadow-none" />
          ) : (
            <ul className="grid gap-1">
              {tree.map((c) => (
                <li key={c.id}>
                  <ul className="grid gap-1">
                    <Row c={c} />
                    {c.children?.map((s) => <Row key={s.id} c={s} sub />)}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
