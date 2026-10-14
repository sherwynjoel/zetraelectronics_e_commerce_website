"use client";

import { OrderList } from "@/components/account/order-list";
import { RequireUser } from "@/components/account/require-user";

export default function TrackOrderPage() {
  return (
    <RequireUser next="/track-order">
      <div className="mx-auto grid max-w-3xl gap-6 pb-16">
        <header>
          <h1 className="text-4xl font-extrabold tracking-[-0.035em] text-ink sm:text-5xl">Your orders</h1>
          <p className="mt-2 text-ink-2">Live status, tracking links and GST invoices for every order.</p>
        </header>
        <OrderList />
      </div>
    </RequireUser>
  );
}
