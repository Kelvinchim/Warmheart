export async function handler(event) {
  try {
    // ✅ Support BOTH GET and POST
    let tx_ref = event.queryStringParameters?.tx_ref;

    if (!tx_ref && event.body) {
      try {
        const body = JSON.parse(event.body);
        tx_ref = body.tx_ref;
      } catch {}
    }

    if (!tx_ref) {
      console.log("NO TX_REF RECEIVED");
      return {
        statusCode: 400,
        body: JSON.stringify({ paid: false }),
      };
    }

    console.log("VERIFYING TX_REF:", tx_ref);

    const response = await fetch(
      `https://api.paychangu.com/verify/${tx_ref}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYCHANGU_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    console.log("PAYCHANGU VERIFY RAW:", JSON.stringify(data));

    // ✅ FIXED LOGIC
    const paid =
      data?.status === "success" &&
      ["success", "successful", "paid", "completed"].includes(
        String(data?.data?.status || "").toLowerCase()
      );

    return {
      statusCode: 200,
      body: JSON.stringify({ paid }),
    };
  } catch (error) {
    console.error("VERIFY ERROR:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ paid: false }),
    };
  }
}
