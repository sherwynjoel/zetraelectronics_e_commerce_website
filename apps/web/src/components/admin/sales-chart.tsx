"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAdminGet } from "@/lib/admin-api";
import { formatINR } from "@/lib/format";
import { Segmented } from "@/components/ui/segmented";
import { Skeleton } from "@/components/ui/skeleton";

type Point = { date: string; total: number; orders: number };
type Range = "7" | "30" | "90";

const short = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" });
const compact = new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 });

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: { label: string; revenue: number; orders: number } }[] }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="glass glass-thick rounded-xl px-3 py-2 text-sm">
      <p className="text-xs font-semibold text-ink-3">{p.label}</p>
      <p className="tabular font-bold text-ink">{formatINR(p.revenue)}</p>
      <p className="tabular text-xs text-ink-2">
        {p.orders} {p.orders === 1 ? "order" : "orders"}
      </p>
    </div>
  );
}

export default function SalesChart() {
  const { data, loading, error } = useAdminGet<Point[]>("/analytics/sales-chart");
  const [range, setRange] = useState<Range>("30");

  const rows = useMemo(
    () =>
      (data ?? [])
        .map((d) => ({ label: short.format(new Date(d.date)), revenue: Number(d.total) || 0, orders: Number(d.orders) || 0 }))
        .slice(-Number(range)),
    [data, range],
  );

  return (
    <section aria-labelledby="revenue-title" className="glass glass-thick grid gap-4 rounded-[var(--radius-pane)] p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="revenue-title" className="text-lg font-bold text-ink">
          Revenue, last {range} days
        </h2>
        <Segmented<Range>
          ariaLabel="Chart range"
          value={range}
          onChange={setRange}
          options={[
            { value: "7", label: "7d" },
            { value: "30", label: "30d" },
            { value: "90", label: "90d" },
          ]}
          className="w-44"
        />
      </div>

      {loading ? (
        <Skeleton className="h-72" />
      ) : error ? (
        <p className="grid h-72 place-items-center text-sm text-ink-3">Sales data couldn’t load. Refresh to try again.</p>
      ) : rows.length === 0 ? (
        <p className="grid h-72 place-items-center text-sm text-ink-3">No sales in this period yet.</p>
      ) : (
        <>
          <div className="h-72" aria-hidden>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart)" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="var(--chart)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--line)" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--ink-3)", fontSize: 12 }} minTickGap={24} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={56}
                  tick={{ fill: "var(--ink-3)", fontSize: 12 }}
                  tickFormatter={(v: number) => `₹${compact.format(v)}`}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--ink-3)", strokeDasharray: "3 3" }} />
                <Area type="monotone" dataKey="revenue" stroke="var(--chart)" strokeWidth={2} fill="url(#rev-fill)" activeDot={{ r: 5, stroke: "var(--glass-solid)", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <table className="sr-only">
            <caption>Daily revenue, last {range} days</caption>
            <thead>
              <tr>
                <th>Date</th>
                <th>Revenue</th>
                <th>Orders</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label}>
                  <td>{r.label}</td>
                  <td>{formatINR(r.revenue)}</td>
                  <td>{r.orders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  );
}
