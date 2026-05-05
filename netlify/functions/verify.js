export const handler = async (event) => {
  const headers = { "Content-Type": "application/json" };

  try {
    let tx_ref = event.queryStringParameters?.tx_ref;

    if (!tx_ref && event.body) {
      const body = JSON.parse(event.body);
      tx_ref = body.tx_ref;
    }

    if (!tx_ref) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, paid: false, error: "Missing tx_ref" }),
      };
    }

    const response = await fetch(
      `https://api.paychangu.com/verify-payment/${encodeURIComponent(tx_ref)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYCHANGU_SECRET_KEY}`,
          Accept: "application/json",
        },
      }
    );

    const data = await response.json();

    const status = String(data?.data?.status || data?.status || "").toLowerCase();

    const paidStatuses = [
      "success",
      "successful",
      "paid",
      "completed",
      "approved",
    ];

    const paid =
      data?.status === "success" &&
      paidStatuses.includes(status);

    // If PayChangu/browser hits this function directly as GET, send user back to site
    if (event.httpMethod === "GET") {
      return {
        statusCode: 302,
        headers: {
          Location: `https://warmheart.studio/?order=${paid ? "success" : "failed"}&tx_ref=${encodeURIComponent(tx_ref)}`,
        },
        body: "",
      };
    }

    // If frontend calls this as POST, return clean JSON
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        paid,
        status,
        tx_ref,
      }),
    };
  } catch (error) {
    console.error("VERIFY ERROR:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        paid: false,
        error: error.message,
      }),
    };
  }
};
