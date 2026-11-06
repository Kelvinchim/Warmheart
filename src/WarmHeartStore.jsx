import { useEffect, useMemo, useState } from "react";
import { ShoppingBag, Search, Heart, Menu, X, ArrowRight, Star, ShieldCheck, Truck, Ruler, Minus, Plus, Mail, MapPin, Instagram } from "lucide-react";


import { PHOTO_HERO_FRONT, PHOTO_FLOCK_DETAIL, PHOTO_FEMALE_WALK, PHOTO_BACK_NECK, PHOTO_GROUP, PHOTO_HANGER, IMAGE_VARIANTS } from "./campaign-images";

const BRAND = {
  name: "WARM HEART",
  tagline: "warmheart.studio",
  email: "hello@warmheart.africa",
  instagram: "@warmheart.africa",
  whatsappNumber: "265992149101",
  phoneDisplay: "+265 992 149 101",
  location: "Lilongwe, Malawi",
};

const STORAGE_KEY = "warm-heart-store-v1";
const currency = (v) => `MWK ${Number(v || 0).toLocaleString()}`;

const PRODUCTS = [
  {
    id: 1, name: "Core Tee — Rich Brown", price: 40000, category: "T-Shirts",
    color: "Rich Brown", fit: "Oversized", material: "260gsm heavyweight cotton",
    stock: "Drop live", image: PHOTO_HERO_FRONT, altImage: PHOTO_FLOCK_DETAIL,
    gallery: [PHOTO_HERO_FRONT, PHOTO_FLOCK_DETAIL, PHOTO_GROUP],
    description: "A premium oversized staple built for clean styling, daily wear, and a stronger silhouette.",
    story: "The Core Tee is the foundation of the Warm Heart uniform. Minimal, heavyweight, and built around elevated flock print texture.",
    sizes: ["S","M","L","XL","XXL"], sku: "WH-CT-BRN",
  },
  {
    id: 2, name: "Core Tee — Ivory", price: 40000, category: "T-Shirts",
    color: "Ivory", fit: "Oversized", material: "260gsm heavyweight cotton",
    stock: "Limited pieces", image: PHOTO_FEMALE_WALK, altImage: PHOTO_GROUP,
    gallery: [PHOTO_FEMALE_WALK, PHOTO_GROUP, PHOTO_FLOCK_DETAIL],
    description: "A cleaner lighter-toned option with the same oversized shape and premium brand feel.",
    story: "The Ivory Tee keeps the Warm Heart identity sharp and minimal with an editorial silhouette suited to any wearer.",
    sizes: ["S","M","L","XL"], sku: "WH-CT-IVY",
  },
  {
    id: 3, name: "Core Tee — Black", price: 40000, category: "T-Shirts",
    color: "Black", fit: "Oversized", material: "260gsm heavyweight cotton",
    stock: "Available now", image: PHOTO_HANGER, altImage: PHOTO_BACK_NECK,
    gallery: [PHOTO_HANGER, PHOTO_BACK_NECK, PHOTO_FLOCK_DETAIL],
    description: "A sharp black essential with a clean chest logo and premium back-neck statement print.",
    story: "The black version delivers the most stripped-back expression of the brand: versatile, premium, and easy to wear every day.",
    sizes: ["S","M","L","XL","XXL"], sku: "WH-CT-BLK",
  },
  {
    id: 4, name: "Core Tee — Mocha", price: 40000, category: "T-Shirts",
    color: "Mocha", fit: "Oversized", material: "260gsm heavyweight cotton",
    stock: "5 left", image: PHOTO_GROUP, altImage: PHOTO_HERO_FRONT,
    gallery: [PHOTO_GROUP, PHOTO_HERO_FRONT, PHOTO_FLOCK_DETAIL],
    description: "The trio campaign colourway. Earthy, grounded, and built to be worn together or alone.",
    story: "Shot in the campaign, the mocha colourway is the most wearable expression of the collection — quiet luxury, African warmth.",
    sizes: ["S","M","L","XL"], sku: "WH-CT-MCH",
  },
];

const LOOKBOOK = [PHOTO_GROUP, PHOTO_FEMALE_WALK, PHOTO_HERO_FRONT, PHOTO_BACK_NECK, PHOTO_HANGER, PHOTO_FLOCK_DETAIL];

const LOOKBOOK_META = [
  { tag: "Campaign", title: "The Full Collection" },
  { tag: "Editorial", title: "The Ivory Walk" },
  { tag: "Front", title: "Heritage Brown" },
  { tag: "Detail", title: "Back Neck Print" },
  { tag: "Product", title: "The Black Tee" },
  { tag: "Craft", title: "Flock Texture" },
];

const FAQ_ITEMS = [
  ["How does sizing work?","All pieces use an oversized relaxed fit. Refer to the size guide or size up if between sizes for a more dramatic drop."],
  ["Do you deliver outside Lilongwe?","Yes — nationwide delivery and pickup options are available. Confirm your location at checkout."],
  ["Are these limited drops?","Yes. Every release is a limited run to keep each drop intentional and exclusive. Once it's gone, it's gone."],
  ["What fabric do you use?","260gsm heavyweight 100% cotton. Pre-shrunk, double-stitched hems, and built to improve with every wash."],
  ["How do I pay?","Orders are confirmed over WhatsApp. Payment via Airtel Money, TNM Mpamba, bank transfer, or cash on pickup."],
  ["Can I return or exchange?","Contact us within 7 days if there's an issue with your order. We'll sort it out."],
];

function buildWhatsAppMsg(items, form) {
  const lines = items.map((it, i) => `${i+1}. ${it.name} | Size: ${it.size} | Qty: ${it.quantity} | ${currency(it.price * it.quantity)}`);
  const total = items.reduce((s, it) => s + it.price * it.quantity, 0);
  return ["Hello Warm Heart, I would like to place an order.","", ...lines,"",`Total: ${currency(total)}`,`Name: ${form.name||"—"}`,`Phone: ${form.phone||"—"}`,`Location: ${form.location||"—"}`,`Notes: ${form.notes||"None"}`].join("\n");
}

function readCart() {
  try { const d = JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]"); return Array.isArray(d)?d.map(item => ({...item, image: PRODUCTS.find(product => product.id === item.id)?.image || item.image})):[]; } catch { return []; }
}

function Img({ src, alt, className, priority = false, sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" }) {
  const [s, setS] = useState(src);
  useEffect(()=>setS(src),[src]);
  const variant = IMAGE_VARIANTS[s];
  return <img src={s || undefined} srcSet={variant?.srcSet} sizes={variant ? sizes : undefined}
    width={variant?.width} height={variant?.height} loading={priority ? "eager" : "lazy"}
    decoding="async" fetchPriority={priority ? "high" : "auto"}
    alt={alt} className={className} onError={()=>{ if (s) setS(""); }} />;
}

function Nav({ page, setPage, cartCount }) {
  const [open, setOpen] = useState(false);
  const pages = ["Home","Shop","Lookbook","About","FAQ","Contact"];
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-[#f7f5f1]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
        <button className="md:hidden p-1" onClick={()=>setOpen(o=>!o)}>{open?<X size={22}/>:<Menu size={22}/>}</button>
        <button onClick={()=>{setPage("Home");setOpen(false);}} className="text-left">
          <p className="text-[17px] font-bold tracking-[0.22em] text-zinc-950">{BRAND.name}</p>
          <a href="https://warmheart.studio" target="_blank" rel="noopener noreferrer" className="text-[9px] uppercase tracking-[0.38em] text-zinc-500 leading-none mt-0.5">{BRAND.tagline}</a>
        </button>
        <nav className="hidden md:flex items-center gap-7">
          {pages.map(p=>(
            <button key={p} onClick={()=>setPage(p)} className={`text-[13px] font-medium transition-colors ${page===p?"text-zinc-950":"text-zinc-500 hover:text-zinc-900"}`}>{p}</button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-white/70 transition"><Search size={18}/></button>
          <button className="p-2 rounded-full hover:bg-white/70 transition"><Heart size={18}/></button>
          <button onClick={()=>setPage("Cart")} className="p-2 rounded-full hover:bg-white/70 transition relative">
            <ShoppingBag size={18}/>
            {cartCount>0&&<span className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center rounded-full bg-zinc-950 text-[9px] font-bold text-white">{cartCount}</span>}
          </button>
        </div>
      </div>
      {open&&(
        <div className="md:hidden border-t border-zinc-200 px-5 py-4 flex flex-col gap-4">
          {pages.map(p=><button key={p} onClick={()=>{setPage(p);setOpen(false);}} className="text-left text-[13px] text-zinc-700 font-medium">{p}</button>)}
          <button onClick={()=>{setPage("Cart");setOpen(false);}} className="text-left text-[13px] text-zinc-700 font-medium">Cart</button>
        </div>
      )}
    </header>
  );
}

function Badge2({ children, className="" }) {
  return <span className={`inline-block text-[10px] font-semibold uppercase tracking-[0.2em] px-3 py-1 rounded-full ${className}`}>{children}</span>;
}

function ProductCard({ product, onOpen, onAdd }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      className="group bg-white rounded-3xl overflow-hidden border border-zinc-100 hover:border-zinc-200 transition-all hover:-translate-y-1 duration-300 cursor-pointer">
      <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100" onClick={()=>onOpen(product)}>
        <Img src={hov?product.altImage:product.image} alt={product.name} className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"/>
        <Badge2 className="absolute top-3 left-3 bg-white/90 text-zinc-900 shadow-sm">{product.stock}</Badge2>
        <button onClick={e=>{e.stopPropagation();}} className="absolute top-3 right-3 bg-white/90 rounded-full p-2 hover:scale-110 transition"><Heart size={14}/></button>
        <div className="absolute bottom-0 inset-x-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-zinc-950 text-white text-[10px] font-bold tracking-[0.2em] uppercase text-center py-3.5"
          onClick={e=>{e.stopPropagation();onAdd(product);}}>Quick Add</div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-400 mb-1">{product.category}</p>
            <h3 className="text-[15px] font-semibold text-zinc-950 leading-tight">{product.name}</h3>
          </div>
          <p className="text-[13px] font-bold text-zinc-950 whitespace-nowrap">{currency(product.price)}</p>
        </div>
        <p className="text-[13px] text-zinc-500 leading-relaxed mb-4 line-clamp-2">{product.description}</p>
        <div className="flex items-center gap-2">
          <button onClick={()=>onOpen(product)} className="flex-1 text-[11px] font-semibold uppercase tracking-[0.15em] py-2.5 border border-zinc-200 rounded-full hover:border-zinc-400 transition">View</button>
          <button onClick={()=>onAdd(product)} className="flex-1 text-[11px] font-semibold uppercase tracking-[0.15em] py-2.5 bg-zinc-950 text-white rounded-full hover:bg-zinc-800 transition">Add to Cart</button>
        </div>
      </div>
    </div>
  );
}

function ProductDetail({ product, onAdd, onBuy }) {
  const [size, setSize] = useState(product.sizes[0]);
  const [qty, setQty] = useState(1);
  const [mainImg, setMainImg] = useState(0);
  useEffect(()=>{setSize(product.sizes[0]);setQty(1);setMainImg(0);},[product.id]);

  return (
    <div className="grid lg:grid-cols-2 gap-10">
      <div className="space-y-3">
        <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-zinc-100 cursor-zoom-in">
          <Img src={product.gallery[mainImg]} priority sizes="(min-width: 1024px) 50vw, 100vw" alt={product.name} className="w-full h-full object-cover object-top"/>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {product.gallery.map((src,i)=>(
            <div key={i} onClick={()=>setMainImg(i)} className={`aspect-[4/5] rounded-2xl overflow-hidden bg-zinc-100 cursor-pointer ring-2 transition ${mainImg===i?"ring-zinc-950":"ring-transparent hover:ring-zinc-300"}`}>
              <Img src={src} sizes="(min-width: 1024px) 16vw, 33vw" alt={`View ${i+1}`} className="w-full h-full object-cover object-top"/>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-7">
        <div>
          <Badge2 className="bg-zinc-100 text-zinc-700 mb-3">{product.stock}</Badge2>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-950 mb-2">{product.name}</h1>
          <p className="text-2xl font-bold text-zinc-950 mb-3">{currency(product.price)}</p>
          <p className="text-[14px] leading-relaxed text-zinc-600">{product.story}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-[13px]">
          {[["Fit",product.fit],["Fabric",product.material],["Colour",product.color],["Origin","Designed in Malawi"]].map(([k,v])=>(
            <div key={k} className="rounded-2xl bg-zinc-50 p-4"><span className="font-semibold text-zinc-950">{k}:</span> <span className="text-zinc-600">{v}</span></div>
          ))}
        </div>
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-zinc-900">Select Size</p>
            <button className="flex items-center gap-1.5 text-[12px] text-zinc-500 hover:text-zinc-900 transition"><Ruler size={13}/> Size guide</button>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {product.sizes.map(s=>(
              <button key={s} onClick={()=>setSize(s)} className={`px-4 py-2.5 rounded-2xl text-[13px] font-semibold border transition ${size===s?"bg-zinc-950 text-white border-zinc-950":"bg-white text-zinc-900 border-zinc-200 hover:border-zinc-500"}`}>{s}</button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center border border-zinc-200 rounded-full p-1">
            <button onClick={()=>setQty(q=>Math.max(1,q-1))} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-zinc-100 transition"><Minus size={14}/></button>
            <span className="w-9 text-center text-[14px] font-semibold">{qty}</span>
            <button onClick={()=>setQty(q=>q+1)} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-zinc-100 transition"><Plus size={14}/></button>
          </div>
          <button onClick={()=>onAdd(product,qty,size)} className="flex-1 py-4 rounded-full bg-zinc-950 text-white text-[12px] font-bold uppercase tracking-[0.18em] hover:bg-zinc-800 transition">Add to Cart</button>
          <button onClick={()=>onBuy(product,qty,size)} className="py-4 px-6 rounded-full border border-zinc-300 text-[12px] font-bold uppercase tracking-[0.18em] hover:border-zinc-900 transition">Buy Now</button>
        </div>
        <div className="space-y-2.5 text-[13px] text-zinc-600">
          {[[<ShieldCheck size={14}/>, "Secure checkout — order via WhatsApp"],[<Truck size={14}/>, "Nationwide delivery and pickup available"],[<Star size={14}/>, "Premium flock print finish — limited drop quality"]].map(([icon,text],i)=>(
            <div key={i} className="flex items-center gap-3 rounded-2xl bg-zinc-50 p-3.5">{icon}<span>{text}</span></div>
          ))}
        </div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-400">SKU: {product.sku}</p>
      </div>
    </div>
  );
}

export default function WarmHeartStore() {
  const [page, setPage] = useState("Home");
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0]);
  const [tag, setTag] = useState("All");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState(readCart);
  const [form, setForm] = useState({name:"",phone:"",email:"",location:"",notes:""});
  const [heroImg, setHeroImg] = useState(0);
  const [checkoutStatus, setCheckoutStatus] = useState("idle");
  const [checkoutError, setCheckoutError] = useState("");

  useEffect(()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(cart));}catch{}},[cart]);

  useEffect(()=>{
    const params = new URLSearchParams(window.location.search);
    const order  = params.get("order");
    if (order === "success") { setPage("OrderSuccess"); window.history.replaceState({}, "", "/"); }
    if (order === "failed")  { setPage("OrderFailed");  window.history.replaceState({}, "", "/"); }
  },[]);

  useEffect(()=>{
    const t = setInterval(()=>setHeroImg(h=>(h+1)%[PHOTO_GROUP,PHOTO_FEMALE_WALK,PHOTO_HERO_FRONT].length),5000);
    return ()=>clearInterval(t);
  },[]);

  const cartCount = cart.reduce((s,i)=>s+i.quantity,0);
  const cartTotal = cart.reduce((s,i)=>s+i.price*i.quantity,0);

  const filtered = useMemo(()=>PRODUCTS.filter(p=>{
    const hay = `${p.name} ${p.category} ${p.color}`.toLowerCase();
    return (tag==="All"||p.category===tag) && (!query.trim()||hay.includes(query.trim().toLowerCase()));
  }),[query,tag]);

  const waLink = `https://wa.me/${BRAND.whatsappNumber}?text=${encodeURIComponent(buildWhatsAppMsg(cart,form))}`;

  const goTo = (p) => { setPage(p); window.scrollTo({top:0,behavior:"smooth"}); };
  const openProduct = (p) => { setSelectedProduct(p); goTo("Product"); };

  const addToCart = (product, quantity=1, size=product.sizes[0]) => {
    if(!quantity||quantity<1) return;
    setCart(prev=>{
      const ex = prev.find(i=>i.id===product.id&&i.size===size);
      if(ex) return prev.map(i=>i.id===product.id&&i.size===size?{...i,quantity:i.quantity+quantity}:i);
      return [...prev,{id:product.id,name:product.name,price:product.price,quantity,size,image:product.image}];
    });
  };

  const updateQty = (id, size, qty) => {
    if(qty<=0) setCart(prev=>prev.filter(i=>!(i.id===id&&i.size===size)));
    else setCart(prev=>prev.map(i=>i.id===id&&i.size===size?{...i,quantity:qty}:i));
  };

  const handlePaychangu = async () => {
    if (!cart.length) return;
    if (!form.name || !form.phone) { alert("Please enter your name and phone number."); return; }

    const pcMode = (import.meta.env.VITE_PAYCHANGU_MODE || "live").toLowerCase();
    console.log(`PayChangu running in ${pcMode === "test" ? "TEST" : "LIVE"} mode`);

    setCheckoutStatus("loading");
    try {
      const res  = await fetch("/.netlify/functions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          customer: { ...form, email: form.email || form.phone + "@warmheart.studio" },
        }),
      });
      const data = await res.json();
      if (pcMode === "test") console.log("Checkout response:", JSON.stringify(data));
      if (data.success && data.payment_url) {
        setCheckoutStatus("redirecting");
        window.location.href = data.payment_url;
      } else {
        setCheckoutStatus("error");
        const errMsg = typeof data.error === "string"
          ? data.error
          : (data.error?.message || JSON.stringify(data.error) || "Payment failed to start. Please try again.");
        setCheckoutError(errMsg);
      }
    } catch (err) {
      setCheckoutStatus("error");
      setCheckoutError("Could not reach payment server.");
    }
  };

  const buyNow = (product, qty=1, size=product.sizes[0]) => {
    const msg = buildWhatsAppMsg([{id:product.id,name:product.name,price:product.price,quantity:qty,size}], form);
    window.open(`https://wa.me/${BRAND.whatsappNumber}?text=${encodeURIComponent(msg)}`,"_blank","noopener,noreferrer");
  };

  const heroImgs = [PHOTO_GROUP, PHOTO_FEMALE_WALK, PHOTO_HERO_FRONT];

  return (
    <div className="min-h-screen bg-[#f7f5f1] text-zinc-950 font-sans">
      <Nav page={page} setPage={goTo} cartCount={cartCount}/>

      {/* HOME */}
      {page==="Home"&&(
        <main>
          {/* Hero */}
          <section className="mx-auto max-w-7xl px-5 pt-8 pb-6 md:px-8 md:pt-12">
            <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-4">
              <div className="relative overflow-hidden rounded-[2rem] bg-zinc-950 min-h-[480px] md:min-h-[560px] flex items-end p-8 md:p-12">
                <div className="absolute inset-0">
                  <Img src={heroImgs[heroImg]} priority sizes="(min-width: 1024px) 60vw, 100vw" alt="Campaign" className="w-full h-full object-cover opacity-40 transition-opacity duration-1000"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/40 to-transparent"/>
                  <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/60 to-transparent"/>
                </div>
                <div className="relative z-10 space-y-5 max-w-lg">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-[0.3em] bg-white/10 text-white px-4 py-1.5 rounded-full border border-white/15">Drop 01 — Now Live</span>
                  <h1 className="text-4xl md:text-6xl font-bold leading-[0.95] tracking-tight text-white">Wear the<br/><span className="italic font-light">Warm Heart.</span></h1>
                  <p className="text-[14px] text-zinc-300 leading-relaxed max-w-md">Premium streetwear from Malawi, built around identity, quality, and limited drops.</p>
                  <div className="flex flex-wrap gap-3 pt-1">
                    <button onClick={()=>goTo("Shop")} className="flex items-center gap-2 bg-white text-zinc-950 px-6 py-3 rounded-full text-[12px] font-bold uppercase tracking-[0.18em] hover:bg-zinc-100 transition">Shop Drop <ArrowRight size={14}/></button>
                    <button onClick={()=>goTo("Lookbook")} className="flex items-center gap-2 border border-white/25 text-white px-6 py-3 rounded-full text-[12px] font-bold uppercase tracking-[0.18em] hover:bg-white/10 transition">Lookbook</button>
                  </div>
                </div>
                {/* Hero indicator dots */}
                <div className="absolute bottom-6 right-6 flex gap-2 z-10">
                  {heroImgs.map((_,i)=><button key={i} onClick={()=>setHeroImg(i)} className={`w-1.5 h-1.5 rounded-full transition-all ${heroImg===i?"bg-white w-4":"bg-white/40"}`}/>)}
                </div>
              </div>
              <div className="rounded-[2rem] overflow-hidden bg-zinc-100 min-h-[300px] lg:min-h-[auto]">
                <Img src={PHOTO_FEMALE_WALK} priority sizes="(min-width: 1024px) 40vw, 100vw" alt="Ivory campaign" className="w-full h-full object-cover object-center"/>
              </div>
            </div>
          </section>

          {/* Marquee */}
          <div className="overflow-hidden border-y border-zinc-200/60 bg-zinc-950 py-3.5">
            <div className="flex animate-[marquee_28s_linear_infinite] whitespace-nowrap">
              {[...Array(2)].map((_,rep)=>(
                ["Premium Streetwear","Designed in Malawi","Heavyweight Cotton","Limited Drops","Warm Heart of Africa","Flock Print Finish","Identity × Culture","Oversized Fit"].map(t=>(
                  <span key={`${rep}-${t}`} className="inline-flex items-center gap-8 px-8 text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-400">
                    {t}<span className="text-[#c8a882] text-[7px]">✦</span>
                  </span>
                ))
              ))}
            </div>
          </div>

          {/* Featured */}
          <section className="mx-auto max-w-7xl px-5 py-12 md:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-zinc-400 mb-2">Featured Collection</p>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight">The <em className="font-light not-italic" style={{fontFamily:"Georgia,serif"}}>Heritage</em> Series</h2>
              </div>
              <button onClick={()=>goTo("Shop")} className="text-[11px] font-bold uppercase tracking-[0.18em] border-b border-zinc-900 pb-0.5 hover:text-zinc-500 transition hidden md:block">View All →</button>
            </div>
            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {PRODUCTS.map(p=><ProductCard key={p.id} product={p} onOpen={openProduct} onAdd={addToCart}/>)}
            </div>
          </section>

          {/* Brand stmt + texture */}
          <section className="mx-auto max-w-7xl px-5 py-6 md:px-8">
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="relative overflow-hidden rounded-[2rem] min-h-[400px]">
                <Img src={PHOTO_GROUP} alt="Group campaign" className="w-full h-full object-cover absolute inset-0"/>
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 to-zinc-950/20"/>
                <div className="relative z-10 p-8 md:p-12 h-full flex flex-col justify-end">
                  <blockquote className="text-xl md:text-2xl font-light text-white leading-relaxed italic" style={{fontFamily:"Georgia,serif"}}>
                    "Limited-drop streetwear inspired by <strong className="font-semibold not-italic text-[#c8a882]">identity, culture, and premium everyday style.</strong>"
                  </blockquote>
                  <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-zinc-400">Designed in Malawi — Made for the World</p>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-[2rem] min-h-[400px] group">
                <Img src={PHOTO_FLOCK_DETAIL} alt="Flock print detail" className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-700"/>
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 to-transparent"/>
                <div className="relative z-10 p-8 h-full flex flex-col justify-end">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 mb-2">Craftsmanship</p>
                  <h3 className="text-2xl font-bold text-white mb-2">Flock Print Texture</h3>
                  <p className="text-[13px] text-zinc-300 leading-relaxed">Signature raised flock lettering. Tactile, bold, and built to last.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Quality pillars */}
          <section className="mx-auto max-w-7xl px-5 py-10 md:px-8">
            <div className="grid sm:grid-cols-3 gap-4">
              {[["260gsm","Heavyweight Cotton","100% premium cotton. The weight you can feel from the first touch."],["Flock","3D Raised Print","Signature texture. Tactile, bold, and unforgettable up close."],["Ltd.","Limited Drops Only","Never mass-produced. Every release is intentional and exclusive."]].map(([n,t,b])=>(
                <div key={t} className="bg-white rounded-[1.5rem] p-7 border border-zinc-100">
                  <p className="text-4xl font-black text-[#c8a882] tracking-tight mb-3">{n}</p>
                  <p className="text-[13px] font-bold uppercase tracking-[0.15em] text-zinc-950 mb-2">{t}</p>
                  <p className="text-[13px] text-zinc-500 leading-relaxed">{b}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Newsletter */}
          <section className="mx-auto max-w-7xl px-5 py-8 pb-14 md:px-8">
            <div className="rounded-[2rem] bg-zinc-950 p-8 md:p-12">
              <div className="grid lg:grid-cols-[1fr_auto] lg:items-center gap-8">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-400 mb-3">Stay Connected</p>
                  <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-3">Join the next drop<br/>before it sells out.</h2>
                  <p className="text-[14px] text-zinc-400 leading-relaxed">Get notified about releases, campaign content, and exclusive merch updates.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                  <input type="email" placeholder="Enter your email" className="h-12 rounded-full bg-white/8 border border-white/12 px-5 text-white placeholder:text-zinc-500 text-[14px] outline-none focus:border-white/30 transition min-w-[240px]"/>
                  <button className="h-12 px-7 rounded-full bg-white text-zinc-950 text-[12px] font-bold uppercase tracking-[0.15em] hover:bg-zinc-200 transition whitespace-nowrap">Subscribe</button>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* SHOP */}
      {page==="Shop"&&(
        <main className="mx-auto max-w-7xl px-5 py-10 md:px-8">
          <div className="relative overflow-hidden rounded-[2rem] bg-zinc-950 mb-10 min-h-[260px] flex items-end p-8 md:p-12">
            <Img src={PHOTO_GROUP} alt="Shop banner" className="absolute inset-0 w-full h-full object-cover opacity-45"/>
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/40 to-transparent"/>
            <div className="relative z-10">
              <h1 className="text-4xl md:text-7xl font-black text-white tracking-tight leading-none mb-2">The Collection</h1>
              <p className="text-[13px] italic text-zinc-400" style={{fontFamily:"Georgia,serif"}}>Drop 001 — Limited Quantities</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
            <div className="flex gap-2 flex-wrap">
              {["All","T-Shirts","Accessories"].map(t=>(
                <button key={t} onClick={()=>setTag(t)} className={`px-5 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.15em] transition ${tag===t?"bg-zinc-950 text-white":"bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200"}`}>{t}</button>
              ))}
            </div>
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search…" className="ml-auto h-11 rounded-full border border-zinc-200 bg-white px-5 text-[13px] outline-none focus:border-zinc-400 transition w-full md:w-64"/>
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(p=><ProductCard key={p.id} product={p} onOpen={openProduct} onAdd={addToCart}/>)}
          </div>
        </main>
      )}

      {/* PRODUCT */}
      {page==="Product"&&(
        <main className="mx-auto max-w-7xl px-5 py-10 md:px-8">
          <button onClick={()=>goTo("Shop")} className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500 hover:text-zinc-950 transition mb-8">← Back to Shop</button>
          <ProductDetail product={selectedProduct} onAdd={addToCart} onBuy={buyNow}/>
          <div className="mt-16">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-400 mb-2">You May Also Like</p>
            <h2 className="text-2xl font-bold mb-6">Complete the Look</h2>
            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {PRODUCTS.filter(p=>p.id!==selectedProduct.id).map(p=><ProductCard key={p.id} product={p} onOpen={openProduct} onAdd={addToCart}/>)}
            </div>
          </div>
        </main>
      )}

      {/* LOOKBOOK */}
      {page==="Lookbook"&&(
        <main className="mx-auto max-w-7xl px-5 py-10 md:px-8">
          <div className="mb-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-zinc-400 mb-3">Campaign 001</p>
            <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-none mb-4">Drop 001<br/><span className="italic font-light" style={{fontFamily:"Georgia,serif"}}>Lookbook</span></h1>
            <p className="text-[14px] text-zinc-500 leading-relaxed max-w-lg">The Heritage Series. Built for culture, made to stand out. This is what it looks like to wear the Warm Heart of Africa.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {LOOKBOOK.map((src,i)=>(
              <div key={i} className={`relative overflow-hidden rounded-[1.5rem] bg-zinc-100 group cursor-pointer ${i===0?"md:col-span-2":""}`}>
                <Img src={src} alt={LOOKBOOK_META[i].title} className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${i===0?"h-[420px] md:h-[540px]":"h-[300px] md:h-[380px]"}`}/>
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-end p-6">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.3em] text-[#c8a882] mb-1">{LOOKBOOK_META[i].tag}</p>
                    <p className="text-[15px] font-bold text-white uppercase tracking-wide">{LOOKBOOK_META[i].title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 rounded-[2rem] bg-zinc-950 overflow-hidden">
            <div className="relative">
              <Img src={PHOTO_GROUP} alt="Full campaign" className="w-full h-[400px] md:h-[500px] object-cover opacity-60"/>
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent"/>
              <div className="absolute inset-0 p-10 md:p-16 flex flex-col justify-end">
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#c8a882] mb-3">Group Campaign</p>
                <p className="text-2xl md:text-4xl font-light text-white italic max-w-2xl leading-relaxed" style={{fontFamily:"Georgia,serif"}}>"Wear what you are. Represent where you're from. That's the whole philosophy."</p>
                <div className="flex gap-3 mt-6">
                  <button onClick={()=>goTo("Shop")} className="bg-white text-zinc-950 px-7 py-3 rounded-full text-[12px] font-bold uppercase tracking-[0.15em] hover:bg-zinc-100 transition">Shop Drop 001</button>
                  <button onClick={()=>goTo("About")} className="border border-white/25 text-white px-7 py-3 rounded-full text-[12px] font-bold uppercase tracking-[0.15em] hover:bg-white/10 transition">Our Story</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ABOUT */}
      {page==="About"&&(
        <main>
          <div className="relative overflow-hidden min-h-[60vh] flex items-end bg-zinc-950">
            <Img src={PHOTO_BACK_NECK} alt="About hero" className="absolute inset-0 w-full h-full object-cover object-top opacity-50"/>
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/40 to-transparent"/>
            <div className="relative z-10 mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
              <h1 className="text-5xl md:text-9xl font-black text-white tracking-tight leading-none">Built for<br/><span className="text-[#c8a882]">Culture.</span><br/><span className="italic font-light" style={{fontFamily:"Georgia,serif"}}>Made to Stand Out.</span></h1>
            </div>
          </div>
          <section className="mx-auto max-w-7xl px-5 py-14 md:px-8 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-zinc-400 mb-4">Our Story</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">Born from the<br/>Warm Heart</h2>
              <div className="space-y-4 text-[14px] text-zinc-600 leading-relaxed">
                <p>Malawi is called the Warm Heart of Africa — and we carry that name in everything we make. Warm Heart was built out of a simple frustration: why did premium streetwear with real cultural identity always have to come from somewhere else?</p>
                <p>We started with a vision — to build a label that represents Malawi on the world stage. Not a novelty brand. Not a souvenir. A real, serious fashion label with world-class quality and a genuine aesthetic point of view.</p>
                <p>Every tee is designed right here in Lilongwe. Each drop is limited, intentional, and rooted in what it means to be from this place — confident, warm, proud, and always moving forward.</p>
              </div>
              <button onClick={()=>goTo("Shop")} className="mt-7 bg-zinc-950 text-white px-7 py-3.5 rounded-full text-[12px] font-bold uppercase tracking-[0.15em] hover:bg-zinc-800 transition">Shop the Collection</button>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] rounded-[2rem] overflow-hidden">
                <Img src={PHOTO_GROUP} alt="Brand story" className="w-full h-full object-cover"/>
              </div>
              <div className="absolute -bottom-5 -left-5 w-1/2 aspect-square border-2 border-[#c8a882] rounded-[1rem] -z-10"/>
            </div>
          </section>
          <section className="bg-zinc-950 py-14 px-5 md:px-8">
            <div className="mx-auto max-w-7xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-zinc-400 mb-4">What We Stand For</p>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-10">The Warm <em className="font-light" style={{fontFamily:"Georgia,serif"}}>Heart Code</em></h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[["01","Identity First","Every piece carries a piece of Malawi. We design for people who know who they are."],["02","Uncompromising Quality","260gsm cotton, flock print finish, double-stitched seams. No shortcuts."],["03","Scarcity by Design","Limited quantities. Not for hype — because every piece should mean something."],["04","African Luxury","Luxury doesn't have to come from Paris. We're building proof it can come from Lilongwe."],["05","Community Driven","Built for creatives, culture carriers, and the diaspora. More than a brand."],["06","Always Evolving","Each drop is a new chapter. We grow, experiment, and push what's possible."]].map(([n,t,b])=>(
                  <div key={n} className="bg-white/4 rounded-[1.5rem] p-7 border border-white/8 hover:bg-white/6 transition">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#c8a882] mb-4">{n}</p>
                    <p className="text-[15px] font-bold text-white mb-2">{t}</p>
                    <p className="text-[13px] text-zinc-400 leading-relaxed">{b}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      )}

      {/* FAQ */}
      {page==="FAQ"&&(
        <main className="mx-auto max-w-3xl px-5 py-14 md:px-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-zinc-400 mb-3">FAQ</p>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-10">Answers</h1>
          <div className="space-y-3">
            {FAQ_ITEMS.map(([q,a])=><FaqItem key={q} q={q} a={a}/>)}
          </div>
        </main>
      )}

      {/* CONTACT */}
      {page==="Contact"&&(
        <main className="mx-auto max-w-7xl px-5 py-14 md:px-8">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-zinc-100">
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-zinc-400 mb-3">Contact</p>
              <h1 className="text-3xl md:text-5xl font-bold mb-2">Talk to<br/>the Brand</h1>
              <p className="text-[14px] text-zinc-500 mb-8">For orders, partnerships, wholesale, or campaign work.</p>
              <div className="space-y-3">
                <input className="w-full h-12 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-[14px] outline-none focus:border-zinc-400 transition" placeholder="Your name"/>
                <input className="w-full h-12 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-[14px] outline-none focus:border-zinc-400 transition" placeholder="Your email"/>
                <input className="w-full h-12 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-[14px] outline-none focus:border-zinc-400 transition" placeholder="Subject"/>
                <textarea className="w-full min-h-[140px] rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-[14px] outline-none focus:border-zinc-400 transition resize-none" placeholder="Your message"/>
                <button className="bg-zinc-950 text-white px-7 py-3.5 rounded-full text-[12px] font-bold uppercase tracking-[0.15em] hover:bg-zinc-800 transition">Send Message</button>
              </div>
            </div>
            <div className="bg-zinc-950 rounded-[2rem] p-8 md:p-10 text-white">
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-zinc-400 mb-8">Brand Info</p>
              <div className="space-y-5 text-[14px] text-zinc-300">
                <div className="flex items-center gap-3"><Mail size={15} className="text-[#c8a882]"/><span><span className="font-semibold text-white">Email: </span>{BRAND.email}</span></div>
                <div className="flex items-center gap-3"><Heart size={15} className="text-[#c8a882]"/><span><span className="font-semibold text-white">Instagram: </span>{BRAND.instagram}</span></div>
                <div className="flex items-center gap-3"><MapPin size={15} className="text-[#c8a882]"/><span><span className="font-semibold text-white">Location: </span>{BRAND.location}</span></div>
                <div><span className="font-semibold text-white">Order line: </span>{BRAND.phoneDisplay}</div>
                <div><span className="font-semibold text-white">WhatsApp: </span><a href={`https://wa.me/${BRAND.whatsappNumber}`} target="_blank" rel="noreferrer" className="text-[#c8a882] hover:underline">Chat with us</a></div>
              </div>
              <div className="mt-10 rounded-2xl bg-white/5 p-6 border border-white/8">
                <p className="text-[12px] font-bold text-white mb-2">How ordering works</p>
                <p className="text-[13px] text-zinc-400 leading-relaxed">Browse the shop → add to cart → checkout via WhatsApp → confirm stock → pay via Airtel Money, Mpamba, bank transfer, or cash on pickup.</p>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* CART */}
      {page==="Cart"&&(
        <main className="mx-auto max-w-7xl px-5 py-10 md:px-8">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-zinc-400 mb-3">Cart</p>
              <h1 className="text-3xl md:text-5xl font-bold mb-8">Your Order</h1>
              {cart.length===0?(
                <div className="bg-white rounded-[2rem] border border-zinc-100 p-10 text-center">
                  <ShoppingBag size={32} className="mx-auto text-zinc-300 mb-3"/>
                  <p className="text-[14px] text-zinc-500">Your cart is empty. Add pieces from the shop.</p>
                  <button onClick={()=>goTo("Shop")} className="mt-5 bg-zinc-950 text-white px-7 py-3 rounded-full text-[12px] font-bold uppercase tracking-[0.15em] hover:bg-zinc-800 transition">Browse Shop</button>
                </div>
              ):(
                <div className="space-y-4">
                  {cart.map(item=>(
                    <div key={`${item.id}-${item.size}`} className="bg-white rounded-[2rem] border border-zinc-100 p-5 flex gap-5">
                      <div className="w-24 h-28 rounded-2xl overflow-hidden flex-shrink-0 bg-zinc-100">
                        <Img src={item.image} sizes="96px" alt={item.name} className="w-full h-full object-cover object-top"/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <h3 className="text-[14px] font-bold text-zinc-950 leading-tight">{item.name}</h3>
                          <p className="text-[14px] font-bold text-zinc-950 whitespace-nowrap">{currency(item.price*item.quantity)}</p>
                        </div>
                        <p className="text-[12px] text-zinc-400 mb-3">Size: {item.size}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center border border-zinc-200 rounded-full p-1">
                            <button onClick={()=>updateQty(item.id,item.size,item.quantity-1)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-zinc-100 transition"><Minus size={12}/></button>
                            <span className="w-8 text-center text-[13px] font-semibold">{item.quantity}</span>
                            <button onClick={()=>updateQty(item.id,item.size,item.quantity+1)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-zinc-100 transition"><Plus size={12}/></button>
                          </div>
                          <button onClick={()=>updateQty(item.id,item.size,0)} className="text-[11px] uppercase tracking-[0.15em] text-zinc-400 hover:text-red-500 transition font-semibold">Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <div className="sticky top-24 bg-white rounded-[2rem] border border-zinc-100 p-7 md:p-9">
                <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-zinc-400 mb-5">Checkout</p>
                <div className="space-y-2.5 text-[13px] text-zinc-600 mb-6 pb-6 border-b border-zinc-100">
                  <div className="flex justify-between"><span>Items ({cartCount})</span><span className="font-semibold text-zinc-950">{currency(cartTotal)}</span></div>
                  <div className="flex justify-between"><span>Delivery</span><span>Confirmed on WhatsApp</span></div>
                  <div className="flex justify-between text-[16px] font-bold text-zinc-950 pt-2 border-t border-zinc-100 mt-2"><span>Total</span><span>{currency(cartTotal)}</span></div>
                </div>
                <div className="space-y-3 mb-5">
                  {[["name","Full name"],["phone","Phone number"],["location","Delivery location"]].map(([k,pl])=>(
                    <input key={k} className="w-full h-11 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-[13px] outline-none focus:border-zinc-400 transition" placeholder={pl} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}/>
                  ))}
                  <textarea className="w-full min-h-[90px] rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5 text-[13px] outline-none focus:border-zinc-400 transition resize-none" placeholder="Order notes or pickup preferences" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/>
                </div>
                <input className="w-full h-11 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-[13px] outline-none focus:border-zinc-400 transition mb-3" placeholder="Email (optional — for receipt)" value={form.email||""} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/>
                <button
                  onClick={handlePaychangu}
                  disabled={!cart.length || checkoutStatus === "loading" || checkoutStatus === "redirecting"}
                  className={`w-full py-4 rounded-full text-[12px] font-bold uppercase tracking-[0.18em] transition ${cart.length && checkoutStatus !== "loading" && checkoutStatus !== "redirecting" ? "bg-zinc-950 text-white hover:bg-zinc-800" : "bg-zinc-200 text-zinc-400 cursor-not-allowed"}`}
                >
                  {checkoutStatus === "loading" ? "Opening payment page..." : checkoutStatus === "redirecting" ? "Complete payment in the PayChangu page →" : "Pay Now →"}
                </button>
                {checkoutStatus === "redirecting" && (
                  <div className="mt-4 bg-zinc-50 rounded-2xl p-4 text-[13px] text-zinc-600 text-center">
                    <p className="mb-2">Complete your payment in the PayChangu page.</p>
                    <p className="text-[12px] text-zinc-400">If it didn't open or your payment failed, <button onClick={()=>setCheckoutStatus("idle")} className="underline text-zinc-600 hover:text-zinc-950">click here to try again</button>.</p>
                  </div>
                )}
                {checkoutStatus === "error" && (
                  <p className="mt-3 text-[12px] text-red-500 text-center">{checkoutError}</p>
                )}
                <div className="mt-5 bg-zinc-50 rounded-2xl p-4 text-[12px] text-zinc-500 leading-relaxed">
                  <p className="font-semibold text-zinc-700 mb-1">Payment methods</p>
                  <p>Airtel Money · TNM Mpamba · Visa/Mastercard · Bank transfer</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ORDER SUCCESS */}
      {page==="OrderSuccess"&&(
        <main className="min-h-[60vh] flex items-center justify-center px-5">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-6">✦</div>
            <h1 className="text-3xl font-bold tracking-tight mb-3">Order Confirmed</h1>
            <p className="text-zinc-500 text-[15px] mb-8">Your payment was successful. We'll be in touch shortly to confirm your order and delivery details.</p>
            <a href={`https://wa.me/${BRAND.whatsappNumber}?text=Hi, I just placed an order on warmheart.studio`} target="_blank" rel="noreferrer">
              <button className="px-8 py-3.5 rounded-full bg-zinc-950 text-white text-[12px] font-bold uppercase tracking-[0.15em] hover:bg-zinc-800 transition mb-4 mr-3">WhatsApp Us</button>
            </a>
            <button onClick={()=>goTo("Home")} className="px-8 py-3.5 rounded-full border border-zinc-200 text-zinc-700 text-[12px] font-bold uppercase tracking-[0.15em] hover:bg-zinc-50 transition">Back to Store</button>
          </div>
        </main>
      )}

      {/* ORDER FAILED */}
      {page==="OrderFailed"&&(
        <main className="min-h-[60vh] flex items-center justify-center px-5">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-6">✕</div>
            <h1 className="text-3xl font-bold tracking-tight mb-3">Payment Cancelled</h1>
            <p className="text-zinc-500 text-[15px] mb-8">Your payment didn't go through. No charge was made. You can try again or reach us on WhatsApp.</p>
            <button onClick={()=>goTo("Cart")} className="px-8 py-3.5 rounded-full bg-zinc-950 text-white text-[12px] font-bold uppercase tracking-[0.15em] hover:bg-zinc-800 transition mb-4 mr-3">Try Again</button>
            <a href={`https://wa.me/${BRAND.whatsappNumber}`} target="_blank" rel="noreferrer">
              <button className="px-8 py-3.5 rounded-full border border-zinc-200 text-zinc-700 text-[12px] font-bold uppercase tracking-[0.15em] hover:bg-zinc-50 transition">WhatsApp Us</button>
            </a>
          </div>
        </main>
      )}

      {/* FOOTER */}
      <footer className="border-t border-zinc-200 bg-white/70 mt-10">
        <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 grid sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <p className="text-[16px] font-bold tracking-[0.22em] mb-1">{BRAND.name}</p>
            <p className="text-[9px] uppercase tracking-[0.38em] text-zinc-400">{BRAND.tagline}</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-4">Shop</p>
            <div className="space-y-2.5">{["New Drop","T-Shirts","Accessories"].map(l=><p key={l} onClick={()=>goTo("Shop")} className="text-[13px] text-zinc-500 hover:text-zinc-950 cursor-pointer transition">{l}</p>)}</div>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-4">Info</p>
            <div className="space-y-2.5">{["About","FAQ","Contact"].map(l=><p key={l} onClick={()=>goTo(l)} className="text-[13px] text-zinc-500 hover:text-zinc-950 cursor-pointer transition">{l}</p>)}</div>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-4">Connect</p>
            <p className="text-[13px] text-zinc-500 mb-1">{BRAND.email}</p>
            <p className="text-[13px] text-zinc-500 mb-1">{BRAND.instagram}</p>
            <p className="text-[13px] text-zinc-500">{BRAND.location}</p>
          </div>
        </div>
        <div className="border-t border-zinc-100 px-5 py-5 md:px-8 mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4">
          <p className="text-[11px] text-zinc-400">© 2025 Warm Heart. All rights reserved.</p>
          <p className="text-[11px] text-zinc-400 flex items-center gap-1.5">🇲🇼 Designed in Malawi</p>
        </div>
      </footer>
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-[1.5rem] border border-zinc-100 overflow-hidden">
      <button onClick={()=>setOpen(o=>!o)} className="w-full flex items-center justify-between p-6 text-left hover:bg-zinc-50 transition">
        <p className="text-[14px] font-semibold text-zinc-950 pr-4">{q}</p>
        <span className={`text-xl text-zinc-400 transition-transform flex-shrink-0 ${open?"rotate-45":""}`}>+</span>
      </button>
      {open&&<div className="px-6 pb-6 text-[13px] text-zinc-600 leading-relaxed border-t border-zinc-100 pt-4">{a}</div>}
    </div>
  );
}
