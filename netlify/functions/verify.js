// Netlify Function — PayChangu Verify Payment
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

  // ── Mode & key selection ─────────────────────────────────────────────────
  const MODE    = (process.env.PAYCHANGU_MODE || "live").toLowerCase();
  const isTest  = MODE === "test";
  const BASE_URL = process.env.URL || "https://warmheart.studio";

  const SECRET_KEY = isTest
    ? process.env.PAYCHANGU_TEST_SECRET_KEY
    : process.env.PAYCHANGU_SECRET_KEY;

  console.log(`PayChangu verify running in ${isTest ? "TEST" : "LIVE"} mode`);

  const VERIFY_URL = "https://api.paychangu.com/verify-payment/";

  const failStatuses = ["failed", "cancelled", "canceled", "failure", "error", "timeout", "declined", "rejected"];

  // ── GET — PayChangu return_url redirect ──────────────────────────────────
  if (event.httpMethod === "GET") {
    const tx_ref = event.queryStringParameters?.tx_ref;
    const status = (event.queryStringParameters?.status || "").toLowerCase();

    if (!tx_ref) {
      return { statusCode: 302, headers: { ...headers, Location: BASE_URL + "/?order=failed" }, body: "" };
    }

    if (failStatuses.includes(status)) {
      console.log(`Payment ${tx_ref} returned with fail status: ${status}`);
      return { statusCode: 302, headers: { ...headers, Location: BASE_URL + "/?order=failed&tx_ref=" + tx_ref }, body: "" };
    }

    // Verify with PayChangu API
    try {
      const res  = await fetch(VERIFY_URL + tx_ref, {
        headers: { Authorization: "Bearer " + SECRET_KEY, Accept: "application/json" },
      });
      const data = await res.json();
      console.log("Verify GET response:", JSON.stringify(data));

      const txStatus = (data.data?.status || "").toLowerCase();
      // In test mode also accept "pending" as success since test payments may not fully settle
      const paid = data.status === "success" &&
        (txStatus === "successful" || txStatus === "success" || (isTest && txStatus === "pending") || status === "successful");

      const dest = BASE_URL + "/?order=" + (paid ? "success" : "failed") + "&tx_ref=" + tx_ref;
      return { statusCode: 302, headers: { ...headers, Location: dest }, body: "" };

    } catch (err) {
      console.error("Verify GET error:", err.message);
      // Fall back to PayChangu's own status param if API call fails
      const dest = status === "successful"
        ? BASE_URL + "/?order=success&tx_ref=" + tx_ref
        : BASE_URL + "/?order=failed&tx_ref="  + tx_ref;
      return { statusCode: 302, headers: { ...headers, Location: dest }, body: "" };
    }
  }

  // ── POST — PayChangu callback_url webhook ────────────────────────────────
  if (event.httpMethod === "POST") {
    let body;
    try { body = JSON.parse(event.body); }
    catch { return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON" }) }; }

    // PayChangu sends tx_ref directly or nested under data
    const tx_ref = body.tx_ref || body.data?.tx_ref;
    if (!tx_ref) return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing tx_ref" }) };

    try {
      const res  = await fetch(VERIFY_URL + tx_ref, {
        headers: { Authorization: "Bearer " + SECRET_KEY, Accept: "application/json" },
      });
      const data = await res.json();
      console.log("Verify POST response:", JSON.stringify(data));

      const txStatus = (data.data?.status || "").toLowerCase();
      const paid = data.status === "success" &&
        (txStatus === "successful" || txStatus === "success" || (isTest && txStatus === "pending"));

      // Log confirmed paid orders to Google Sheets (live mode only)
      if (paid && !isTest) {
        const meta = data.data?.meta || {};
        const cust = data.data?.customer || {};
        const items = typeof meta.items === "string" ? meta.items : JSON.stringify(meta.items || []);
        fetch(
          "https://script.google.com/macros/s/AKfycbzfh8rxtHRc60Sn9BNyl8dcT_ZG7YJ6qJDGAfniMByzAav4PNPUu7QY9FKPG-mtocB6BA/exec",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tx_ref:   data.data?.tx_ref || tx_ref,
              name:     (cust.first_name || "") + " " + (cust.last_name || ""),
              phone:    meta.phone    || "",
              email:    cust.email    || "",
              location: meta.location || "",
              items,
              amount:   data.data?.amount || "",
              status:   "paid",
              notes:    meta.notes || "",
            }),
          }
        ).catch(e => console.error("Sheet log error:", e));
      }

      if (paid && isTest) {
        console.log("TEST payment verified successfully — skipping Google Sheets log");
      }

      return { statusCode: 200, headers, body: JSON.stringify({ success: true, paid, mode: MODE }) };

    } catch (err) {
      console.error("Verify POST error:", err.message);
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Verify failed" }) };
    }
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
};
