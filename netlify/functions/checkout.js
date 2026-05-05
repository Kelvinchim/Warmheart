// Netlify Function — Paychangu Checkout
exports.handler = async (event) => {
  const headers = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type","Content-Type":"application/json"};
  if (event.httpMethod === "OPTIONS") return {statusCode:200,headers,body:""};
  if (event.httpMethod !== "POST") return {statusCode:405,headers,body:JSON.stringify({error:"Method not allowed"})};

  let items, customer;
  try { ({items,customer} = JSON.parse(event.body)); }
  catch { return {statusCode:400,headers,body:JSON.stringify({error:"Invalid JSON"})}; }

  if (!items?.length || !customer?.name || !customer?.phone) {
    return {statusCode:400,headers,body:JSON.stringify({error:"Name and phone required"})};
  }

  const SECRET_KEY = process.env.PAYCHANGU_SECRET_KEY;
  const BASE_URL   = process.env.URL || "https://warmheart.studio";
  const total      = items.reduce((s,i) => s + i.price * i.quantity, 0);
  const description = items.map(i => i.name + " x" + i.quantity + " (" + i.size + ")").join(", ");
  const tx_ref     = "WH-" + Date.now() + "-" + Math.random().toString(36).slice(2,7).toUpperCase();
  const parts      = customer.name.trim().split(" ");
  const first_name = parts[0] || "Customer";
  const last_name  = parts.slice(1).join(" ") || "Customer";
  const email      = customer.email && customer.email.includes("@")
    ? customer.email
    : customer.phone.replace(/\s+/g,"") + "@warmheart.studio";

  try {
    const res = await fetch("https://api.paychangu.com/payment", {
      method: "POST",
      headers: {Accept:"application/json","Content-Type":"application/json",Authorization:"Bearer "+SECRET_KEY},
      body: JSON.stringify({
        amount: String(total), currency: "MWK",
        email, first_name, last_name,
       return_url: BASE_URL + "/?order=success&tx_ref=" + tx_ref,
        tx_ref,
        customization: {title:"WARM.HEART", description},
        meta: {phone:customer.phone||"", location:customer.location||"", notes:customer.notes||"", items:JSON.stringify(items)},
      }),
    });

    const data = await res.json();
    console.log("Paychangu response:", JSON.stringify(data));

    const ok = data.status === "success" || data.status === "successful";
    if (!res.ok || !ok) return {statusCode:400,headers,body:JSON.stringify({error:data.message||"Payment initiation failed"})};

    const payment_url = data.data?.checkout_url || data.data?.link || data.checkout_url;
    if (!payment_url) return {statusCode:400,headers,body:JSON.stringify({error:"No checkout URL"})};

    return {statusCode:200,headers,body:JSON.stringify({success:true,payment_url,tx_ref})};
  } catch(err) {
    console.error("Checkout error:", err);
    return {statusCode:500,headers,body:JSON.stringify({error:"Server error"})};
  }
};
