// Netlify Function — Mailchimp Subscribe
// POST /api/subscribe  { email: "..." }

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let email;
  try {
    ({ email } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  if (!email || !email.includes("@")) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Valid email required" }) };
  }

  const API_KEY    = process.env.MAILCHIMP_API_KEY;
  const AUDIENCE   = process.env.MAILCHIMP_AUDIENCE_ID;
  const DC         = API_KEY.split("-").pop();

  const url = `https://${DC}.api.mailchimp.com/3.0/lists/${AUDIENCE}/members`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`anystring:${API_KEY}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: email,
        status: "subscribed",
        tags: ["drop-001", "warmheart-studio"],
      }),
    });

    const data = await res.json();

    if (res.status === 400 && data.title === "Member Exists") {
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, existing: true }) };
    }

    if (!res.ok) {
      console.error("Mailchimp error:", data);
      return { statusCode: res.status, headers, body: JSON.stringify({ error: data.detail || "Mailchimp error" }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error("Function error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Server error" }) };
  }
};
