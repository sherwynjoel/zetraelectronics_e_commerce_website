"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { API_URL } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { OrderList } from "@/components/account/order-list";
import { RequireUser } from "@/components/account/require-user";
import { FormError, PasswordField } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import { toast } from "@/components/ui/toast";

type Tab = "orders" | "profile" | "security";

function useProfileSave() {
  const { user, token, login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const save = async (body: Record<string, string>) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");
      if (user && data.name) login({ ...user, name: data.name }, token!);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update profile");
      return false;
    } finally {
      setLoading(false);
    }
  };
  return { save, loading, error };
}

function ProfileTab() {
  const user = useAuthStore((s) => s.user)!;
  const [name, setName] = useState(user.name ?? "");
  const { save, loading, error } = useProfileSave();
  return (
    <form
      className="glass glass-thick grid gap-5 rounded-[var(--radius-pane)] p-6 sm:p-8"
      onSubmit={async (e) => {
        e.preventDefault();
        if (name.trim() && (await save({ name: name.trim() }))) toast.success("Profile updated");
      }}
    >
      <h2 className="text-xl font-bold text-ink">Your details</h2>
      <FormError>{error}</FormError>
      <TextField label="Full name" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} />
      <TextField label="Email" value={user.email} disabled hint="Your email is your sign-in and can’t be changed here." />
      <Button type="submit" loading={loading} disabled={!name.trim() || name.trim() === user.name} className="sm:justify-self-end">
        Save changes
      </Button>
    </form>
  );
}

function SecurityTab() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const { save, loading, error } = useProfileSave();
  const mismatch = confirm.length > 0 && confirm !== next;
  return (
    <form
      className="glass glass-thick grid gap-5 rounded-[var(--radius-pane)] p-6 sm:p-8"
      onSubmit={async (e) => {
        e.preventDefault();
        if (next !== confirm) return;
        if (await save({ currentPassword: current, newPassword: next })) {
          toast.success("Password changed");
          setCurrent("");
          setNext("");
          setConfirm("");
        }
      }}
    >
      <h2 className="text-xl font-bold text-ink">Change password</h2>
      <FormError>{error}</FormError>
      <PasswordField label="Current password" autoComplete="current-password" required value={current} onChange={(e) => setCurrent(e.target.value)} />
      <PasswordField label="New password" autoComplete="new-password" required minLength={8} hint="At least 8 characters" value={next} onChange={(e) => setNext(e.target.value)} />
      <PasswordField
        label="Confirm new password"
        autoComplete="new-password"
        required
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        error={mismatch ? "Passwords do not match" : undefined}
      />
      <Button type="submit" loading={loading} disabled={mismatch} className="sm:justify-self-end">
        Update password
      </Button>
    </form>
  );
}

function Account() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("orders");
  return (
    <div className="mx-auto grid max-w-3xl gap-6 pb-16">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-[-0.035em] text-ink sm:text-5xl">{user?.name ? `Hi, ${user.name.split(" ")[0]}` : "Your account"}</h1>
          <p className="mt-1 text-ink-3">{user?.email}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="text-danger hover:bg-danger-soft hover:text-danger"
        >
          <LogOut className="size-4" aria-hidden />
          Sign out
        </Button>
      </header>
      <Segmented<Tab>
        ariaLabel="Account sections"
        value={tab}
        onChange={setTab}
        options={[
          { value: "orders", label: "Orders" },
          { value: "profile", label: "Profile" },
          { value: "security", label: "Password" },
        ]}
        className="max-w-md"
      />
      {tab === "orders" ? <OrderList /> : tab === "profile" ? <ProfileTab /> : <SecurityTab />}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <RequireUser next="/profile">
      <Account />
    </RequireUser>
  );
}
