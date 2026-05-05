export const handler = async (event) => {
  try {
    const tx_ref = event.queryStringParameters.tx_ref;

    if (!tx_ref) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing tx_ref" }),
      };
    }

    const response = await fetch(
      `https://api.paychangu.com/transaction/verify/${tx_ref}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYCHANGU_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    console.log("PAYCHANGU RESPONSE:", data);

    // 👇 VERY IMPORTANT — inspect real status
    const status = (data?.data?.status || "").toLowerCase();

    // 👇 broaden accepted success values
    const paidStatuses = [
      "success",
      "successful",
      "paid",
      "completed",
      "approved"
    ];

    const paid = paidStatuses.includes(status);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        paid,
        status,
        raw: data, // 👈 THIS IS KEY (so we can see everything)
      }),
    };

  } catch (error) {
    console.error("VERIFY ERROR:", error);

    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: error.message,
      }),
    };
  }
};
