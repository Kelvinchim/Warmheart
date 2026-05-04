// Netlify Function — Paychangu Verify Payment
exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };

  const SECRET_KEY = process.env.PAYCHANGU_SECRET_KEY;
  const BASE_URL   = process.env.URL || "https://warmheart.studio";

  if (event.httpMethod === "GET") {
    const tx_ref = event.queryStringParameters?.tx_ref;
    const status = event.queryStringParameters?.status;
    if (!tx_ref) return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing tx_ref" }) };
    if (status === "failed" || status === "cancelled")
      return { statusCode: 302, headers: { ...headers, Location: `${BASE_URL}/?order=failed&tx_ref=${tx_ref}` }, body: "" };
    try {
      const res  = await fetch(`https://api.paychangu.com/verify-payment/${tx_ref}`, { headers: { Authorization: `Bearer ${SECRET_KEY}`, Accept: "application/json" } });
      const data = await res.json();
      const paid = data.status === "success" && data.data?.status === "successful";
      return { statusCode: 302, headers: { ...headers, Location: `${BASE_URL}/?order=${paid ? "success" : "failed"}&tx_ref=${tx_ref}` }, body: "" };
    } catch (err) {
      return { statusCode: 302, headers: { ...headers, Location: `${BASE_URL}/?order=failed&tx_ref=${tx_ref}` }, body: "" };
    }
  }

  if (event.httpMethod === "POST") {
    let tx_ref;
    try { ({ tx_ref } = JSON.parse(event.body)); }
    catch { return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON" }) }; }
    try {
      const res  = await fetch(`https://api.paychangu.com/verify-payment/${tx_ref}`, { headers: { Authorization: `Bearer ${SECRET_KEY}`, Accept: "application/json" } });
      const data = await res.json();
      const paid = data.status === "success" && data.data?.status === "successful";

      if (paid) {
        const meta = data.data?.meta || {};
        const cust = data.data?.customer || {};
        const items = typeof meta.items === "string" ? meta.items : JSON.stringify(meta.items || []);
        fetch(process.env.SHEET_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tx_ref:   data.data?.tx_ref || tx_ref,
            name:     (cust.first_name || "") + " " + (cust.last_name || ""),
            phone:    meta.phone || "",
            email:    cust.email || "",
            location: meta.location || "",
            items,
            amount:   data.data?.amount || "",
            status:   "paid",
            notes:    meta.notes || ""
          })
        }).catch(e => console.error("Sheet log error:", e));
      }

      return { statusCode: 200, headers, body: JSON.stringify({ success: true, paid, data: data.data }) };
    } catch (err) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Verify failed" }) };
    }
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
};