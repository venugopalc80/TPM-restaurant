"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type OrderItem = {
  id: string;
  item_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  notes?: string | null;
};

type Order = {
  id: string;
  order_number: number;
  source: "website" | "phone" | "staff";
  order_type: "collection" | "delivery";
  status: string;
  customer_name: string;
  customer_phone: string;
  delivery_address?: string | null;
  notes?: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  created_at: string;
  order_items: OrderItem[];
};

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const RESTAURANT_ID = process.env.NEXT_PUBLIC_RESTAURANT_ID ?? "";

const nextActions: Record<string, { label: string; status: string }[]> = {
  pending: [{ label: "Confirm", status: "confirmed" }, { label: "Cancel", status: "cancelled" }],
  confirmed: [{ label: "Start preparing", status: "preparing" }, { label: "Cancel", status: "cancelled" }],
  preparing: [{ label: "Mark ready", status: "ready" }],
  ready: [{ label: "Out for delivery", status: "out_for_delivery" }, { label: "Complete", status: "completed" }],
  out_for_delivery: [{ label: "Complete", status: "completed" }],
  completed: [],
  cancelled: [],
};

function money(value: number) {
  return `£${Number(value).toFixed(2)}`;
}

function ageLabel(iso: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return "just now";
  if (minutes === 1) return "1 min ago";
  return `${minutes} mins ago`;
}

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState("active");

  const loadOrders = useCallback(async () => {
    const response = await fetch(`${API}/restaurants/${RESTAURANT_ID}/orders?limit=100`, {
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Unable to load orders");
    const data = await response.json();
    setOrders(data.orders ?? []);
  }, []);

  useEffect(() => {
    loadOrders().catch(() => setMessage("Unable to connect to the ordering API."));
    const timer = window.setInterval(() => {
      loadOrders().catch(() => undefined);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [loadOrders]);

  const visibleOrders = useMemo(
    () => filter === "active"
      ? orders.filter((order) => !["completed", "cancelled"].includes(order.status))
      : orders,
    [filter, orders]
  );

  async function changeStatus(orderId: string, status: string) {
    setBusyId(orderId);
    setMessage("");
    try {
      const response = await fetch(`${API}/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail ?? "Status update failed");
      setOrders((current) => current.map((order) => order.id === orderId ? data : order));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Status update failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">TPM RESTAURANT</p>
          <h1>Order dashboard</h1>
          <p>Website and phone orders arrive here in one queue.</p>
        </div>
        <div className="dashboard-controls">
          <button className={filter === "active" ? "selected" : ""} onClick={() => setFilter("active")}>Active</button>
          <button className={filter === "all" ? "selected" : ""} onClick={() => setFilter("all")}>All orders</button>
          <button onClick={() => loadOrders().catch(() => setMessage("Refresh failed."))}>Refresh</button>
        </div>
      </header>

      {message && <div className="dashboard-message">{message}</div>}

      <section className="orders-grid">
        {visibleOrders.length === 0 ? (
          <div className="empty-state">
            <h2>No orders</h2>
            <p>New website and AI phone orders will appear here.</p>
          </div>
        ) : visibleOrders.map((order) => (
          <article className={`order-card status-${order.status}`} key={order.id}>
            <header>
              <div>
                <span className="order-number">#{order.order_number}</span>
                <span className="source-badge">{order.source}</span>
              </div>
              <span className="status-badge">{order.status.replace(/_/g, " ")}</span>
            </header>

            <div className="order-customer">
              <strong>{order.customer_name}</strong>
              <a href={`tel:${order.customer_phone}`}>{order.customer_phone}</a>
              <span>{order.order_type === "delivery" ? "Delivery" : "Collection"} · {ageLabel(order.created_at)}</span>
              {order.delivery_address && <span>{order.delivery_address}</span>}
            </div>

            <div className="order-items">
              {order.order_items.map((item) => (
                <div key={item.id}>
                  <span>{item.quantity} × {item.item_name}</span>
                  <strong>{money(item.line_total)}</strong>
                </div>
              ))}
            </div>

            {order.notes && <p className="order-notes">Note: {order.notes}</p>}

            <footer className="order-footer">
              <strong>Total {money(order.total)}</strong>
              <div>
                {nextActions[order.status]?.map((action) => (
                  <button
                    key={action.status}
                    disabled={busyId === order.id}
                    onClick={() => changeStatus(order.id, action.status)}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </footer>
          </article>
        ))}
      </section>
    </main>
  );
}
