export async function handler(event) {
  try {
    const { tx_ref } = JSON.parse(event.body || "{}");

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

    // THIS IS WHAT YOU NEED TO SEE
    console.log("PAYCHANGU VERIFY RAW:", JSON.stringify(data));

    const paid =
      data?.data?.status === "success" ||
      data?.status === "success";

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
