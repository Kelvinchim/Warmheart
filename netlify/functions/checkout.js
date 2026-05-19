// Netlify Function — PayChangu Checkout
// Mode is controlled by PAYCHANGU_MODE env var ("test" | "live", default: "live")
// Test mode uses PAYCHANGU_TEST_SECRET_KEY
// Live mode uses PAYCHANGU_SECRET_KEY

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type":                 "application/json",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  if (event.httpMethod !== "POST")    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };

  // ── Mode & key selection ─────────────────────────────────────────────────
  const MODE = (process.env.PAYCHANGU_MODE || "live").toLowerCase();
  const isTest = MODE === "test";

  const SECRET_KEY = isTest
    ? process.env.PAYCHANGU_TEST_SECRET_KEY
    : process.env.PAYCHANGU_SECRET_KEY;

  console.log(`PayChangu running in ${isTest ? "TEST" : "LIVE"} mode`);

  if (!SECRET_KEY) {
    const missing = isTest ? "PAYCHANGU_TEST_SECRET_KEY" : "PAYCHANGU_SECRET_KEY";
    console.error(`Missing env var: ${missing}`);
    return { statusCode: 500, headers, body: JSON.stringify({ error: `${missing} is not set in Netlify environment variables` }) };
  }

  // ── Parse request ────────────────────────────────────────────────────────
  let items, customer;
  try { ({ items, customer } = JSON.parse(event.body)); }
  catch { return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON" }) }; }

  if (!items?.length || !customer?.name || !customer?.phone) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Name and phone required" }) };
  }

  // ── Build payment payload ────────────────────────────────────────────────
  const BASE_URL    = process.env.URL || "https://warmheart.studio";
  const total       = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const description = items.map(i => `${i.name} x${i.quantity} (${i.size})`).join(", ");
  const prefix      = isTest ? "TEST" : "WH";
  const tx_ref      = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  const parts       = customer.name.trim().split(" ");
  const first_name  = parts[0] || "Customer";
  const last_name   = parts.slice(1).join(" ") || "Customer";
  const email       = customer.email?.includes("@")
    ? customer.email
    : customer.phone.replace(/\s+/g, "") + "@warmheart.studio";

  // ── Call PayChangu API ───────────────────────────────────────────────────
  try {
    const res = await fetch("https://api.paychangu.com/payment", {
      method:  "POST",
      headers: {
        Accept:         "application/json",
        "Content-Type": "application/json",
        Authorization:  "Bearer " + SECRET_KEY,
      },
      body: JSON.stringify({
        amount:       String(total),
        currency:     "MWK",
        email, first_name, last_name,
        return_url:   BASE_URL + "/.netlify/functions/verify?tx_ref=" + tx_ref,
        callback_url: BASE_URL + "/.netlify/functions/verify",
        tx_ref,
        customization: { title: "WARM.HEART", description },
        meta: {
          phone:    customer.phone    || "",
          location: customer.location || "",
          notes:    customer.notes    || "",
          items:    JSON.stringify(items),
          mode:     MODE,
        },
      }),
    });

    const data = await res.json();
    console.log("PayChangu response:", JSON.stringify(data));

    const ok = data.status === "success" || data.status === "successful";
    if (!res.ok || !ok) {
      const msg = data.message
        || (typeof data.error === "string" ? data.error : JSON.stringify(data.error))
        || "Payment initiation failed";
      // Include debug info only in test mode
      return { statusCode: 400, headers, body: JSON.stringify({ error: msg, ...(isTest && { debug: data }) }) };
    }

    const payment_url =
      data.data?.checkout_url ||
      data.data?.link         ||
      data.data?.payment_url  ||
      data.data?.url          ||
      data.checkout_url       ||
      data.link               ||
      data.payment_url;

    if (!payment_url) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "No checkout URL in PayChangu response", ...(isTest && { debug: data }) }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, payment_url, tx_ref, mode: MODE }) };

  } catch (err) {
    console.error("Checkout error:", err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Server error" }) };
  }
};
