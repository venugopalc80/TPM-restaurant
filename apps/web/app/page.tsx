"use client";

import { useEffect, useMemo, useState } from "react";

type Item = {
  id: string;
  name: string;
  description?: string;
  price: number;
  allergens: string[];
  available: boolean;
};

type Category = {
  id: string;
  name: string;
  cuisine: string;
  menu_items: Item[];
};

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const RESTAURANT_ID = process.env.NEXT_PUBLIC_RESTAURANT_ID ?? "";

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<Record<string, { item: Item; quantity: number }>>({});
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderType, setOrderType] = useState<"collection" | "delivery">("collection");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${API}/restaurants/${RESTAURANT_ID}/menu`)
      .then((r) => r.json())
      .then((data) => setCategories(data.categories ?? []))
      .catch(() => setMessage("Unable to load the menu."));
  }, []);

  const cartItems = Object.values(cart);
  const total = useMemo(
    () => cartItems.reduce((sum, row) => sum + Number(row.item.price) * row.quantity, 0),
    [cartItems]
  );

  function add(item: Item) {
    setCart((current) => ({
      ...current,
      [item.id]: {
        item,
        quantity: (current[item.id]?.quantity ?? 0) + 1,
      },
    }));
  }

  function remove(id: string) {
    setCart((current) => {
      const next = { ...current };
      const row = next[id];
      if (!row) return current;
      if (row.quantity === 1) delete next[id];
      else next[id] = { ...row, quantity: row.quantity - 1 };
      return next;
    });
  }

  async function submitOrder() {
    setMessage("");
    if (!customerName || !customerPhone || cartItems.length === 0) {
      setMessage("Please add an item and enter your name and phone.");
      return;
    }
    if (orderType === "delivery" && !address) {
      setMessage("Please enter your delivery address.");
      return;
    }

    const response = await fetch(`${API}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        restaurant_id: RESTAURANT_ID,
        source: "website",
        order_type: orderType,
        customer_name: customerName,
        customer_phone: customerPhone,
        delivery_address: orderType === "delivery" ? address : null,
        items: cartItems.map(({ item, quantity }) => ({
          menu_item_id: item.id,
          quantity,
        })),
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      setMessage(data.detail ?? "Order failed.");
      return;
    }

    setMessage(`Order created successfully. Total: £${Number(data.total).toFixed(2)}`);
    setCart({});
  }

  return (
    <main>
      <header className="hero">
        <div>
          <p className="eyebrow">TPM RESTAURANT</p>
          <h1>Good food. Simple ordering.</h1>
          <p>Browse our English and Indian menu and order for collection or delivery.</p>
        </div>
        <div className="cart-summary">
          <strong>{cartItems.length} items</strong>
          <span>£{total.toFixed(2)}</span>
        </div>
      </header>

      <section className="content">
        <div className="menu">
          {categories.map((category) => (
            <section className="category" key={category.id}>
              <div className="category-title">
                <h2>{category.name}</h2>
                <span>{category.cuisine}</span>
              </div>
              <div className="grid">
                {category.menu_items.filter((item) => item.available).map((item) => (
                  <article className="card" key={item.id}>
                    <div>
                      <h3>{item.name}</h3>
                      <p>{item.description}</p>
                      {item.allergens.length > 0 && (
                        <small>Allergens: {item.allergens.join(", ")}</small>
                      )}
                    </div>
                    <footer>
                      <strong>£{Number(item.price).toFixed(2)}</strong>
                      <button onClick={() => add(item)}>Add</button>
                    </footer>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="checkout">
          <h2>Your order</h2>
          {cartItems.length === 0 ? <p>Your basket is empty.</p> : (
            <div className="basket">
              {cartItems.map(({ item, quantity }) => (
                <div className="basket-row" key={item.id}>
                  <div>
                    <strong>{item.name}</strong>
                    <span>£{(Number(item.price) * quantity).toFixed(2)}</span>
                  </div>
                  <div className="qty">
                    <button onClick={() => remove(item.id)}>-</button>
                    <span>{quantity}</span>
                    <button onClick={() => add(item)}>+</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <label>Name<input value={customerName} onChange={(e) => setCustomerName(e.target.value)} /></label>
          <label>Phone<input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} /></label>
          <label>Order type
            <select value={orderType} onChange={(e) => setOrderType(e.target.value as "collection" | "delivery")}>
              <option value="collection">Collection</option>
              <option value="delivery">Delivery</option>
            </select>
          </label>
          {orderType === "delivery" && (
            <label>Delivery address<textarea value={address} onChange={(e) => setAddress(e.target.value)} /></label>
          )}

          <button className="checkout-button" onClick={submitOrder}>Place order</button>
          {message && <p className="message">{message}</p>}
        </aside>
      </section>
    </main>
  );
}
