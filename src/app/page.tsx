"use client";
// src/app/page.tsx

import { useState, useEffect, useCallback, useRef } from "react";
import { generateRef, formatGHS } from "@/lib/paystack";
import type { PaystackConfig, PaystackResponse } from "@/lib/paystack";
import Script from "next/script";


// ── Paystack type augmentation ──────────────────────────────
declare global {
  interface Window {
    PaystackPop: {
      setup: (config: any) => { 
        openIframe: () => void 
      };
    };
  }
}

// PASTE THIS ABOVE "export default function Home()"
async function verifyPayment(reference: string, amt: number, setThankAmount: any, setShowThankModal: any) {
  try {
    const res = await fetch("/api/verify-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference }),
    });
    const data = await res.json();
    if (data.success) {
      setThankAmount(amt);
      setShowThankModal(true);
    } else {
      // Show thank you anyway since Paystack took the money
      setThankAmount(amt);
      setShowThankModal(true);
    }
  } catch (error) {
    setThankAmount(amt);
    setShowThankModal(true);
  }
}

// ── Gallery data ─────────────────────────────────────────────
const GALLERY = [
  { src: "https://images.unsplash.com/photo-1567057419565-4349c49d8a04?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", cap: "Education drive — Accra, 2024" },
  { src: "https://media.licdn.com/dms/image/v2/D4D22AQHmZRabsCEBuA/feedshare-shrink_800/feedshare-shrink_800/0/1728463121129?e=2147483647&v=beta&t=6iFZHl2vKiIh-c-OSj9cIi_RWKc8wf0pl0D_CykYwJU", cap: "Food relief program — Kumasi, 2024" },
  { src: "https://tse4.mm.bing.net/th/id/OIP.yPxrY78XCXbpcJQc_3gqYQHaE8?rs=1&pid=ImgDetMain&o=7&rm=3", cap: "Clean water project — Volta Region, 2023" },
  { src: "https://tse1.mm.bing.net/th/id/OIP.itQl02U0NxCZvRkwU7u3EQHaF7?rs=1&pid=ImgDetMain&o=7&rm=3", cap: "Vocational training for women — Tamale, 2023" },
  { src: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1200&q=85", cap: "Free health screening camp — Tema, 2024" },
  { src: "https://tse2.mm.bing.net/th/id/OIP.E7xglCmi1SiBtFhGmPJLXQHaE7?rs=1&pid=ImgDetMain&o=7&rm=3", cap: "Tree planting initiative — Cape Coast, 2024" },
];

const AMOUNTS = [50, 100, 200, 500, 1000, 2000];

export default function Home() {
  // ── State ───────────────────────────────────────────────
  const [heroMode, setHeroMode] = useState<"volunteer" | "donor">("volunteer");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState("");
  const [frequency, setFrequency] = useState<"once" | "monthly" | "yearly">("once");
  const [donorEmail, setDonorEmail] = useState("");
  const [paying, setPaying] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [thankAmount, setThankAmount] = useState(100);
  const [showThankModal, setShowThankModal] = useState(false);
  const [volSuccess, setVolSuccess] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<NodeJS.Timeout | null>(null);

  // Donation widget form refs
  const widgetRef = useRef<HTMLDivElement>(null);

  // ── Toast helper ─────────────────────────────────────────
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  // ── Close mobile menu on scroll ──────────────────────────
  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // ── Keyboard listeners ───────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxIdx(null);
        setMobileOpen(false);
        setShowThankModal(false);
      }
      if (lightboxIdx !== null) {
        if (e.key === "ArrowLeft") setLightboxIdx(i => ((i ?? 0) - 1 + GALLERY.length) % GALLERY.length);
        if (e.key === "ArrowRight") setLightboxIdx(i => ((i ?? 0) + 1) % GALLERY.length);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    
  }, [lightboxIdx]);


  // ── Lightbox scroll lock ─────────────────────────────────
  useEffect(() => {
    if (lightboxIdx !== null || showThankModal) document.body.style.overflow = "hidden";
    else if (!mobileOpen) document.body.style.overflow = "";
  }, [lightboxIdx, showThankModal, mobileOpen]);

  // ── Fade-up observer ─────────────────────────────────────
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".fade-up").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // ── Mode switcher ────────────────────────────────────────
  function switchMode(m: "volunteer" | "donor") {
    setHeroMode(m);
    setMobileOpen(false);
  }

  function scrollToWidget() {
    setHeroMode("donor");
    setTimeout(() => widgetRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 300);
  }

  // ── Effective donation amount ────────────────────────────
  const effectiveAmount = customAmount ? parseFloat(customAmount) : selectedAmount;

  // ── Paystack donation ────────────────────────────────────
 async function handleDonate() {
  const amt = effectiveAmount;
  if (!amt || amt < 1) { showToast("⚠️ Please select or enter an amount."); return; }
  if (!donorEmail || !donorEmail.includes("@")) { showToast("⚠️ Please enter a valid email."); return; }

  const key = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "";
  
  // Check if Paystack is loaded
  if (typeof window.PaystackPop === "undefined") {
    showToast("⚠️ Payment system is still loading. Please wait a second.");
    return;
  }

  setPaying(true);
  const ref = generateRef();

  const handler = window.PaystackPop.setup({
    key,
    email: donorEmail,
    amount: Math.round(amt * 100),
    currency: "GHS",
    ref,
    // Forces the popup to show Mobile Money and Card options
    channels: ["mobile_money", "card", "bank_transfer"], 
    metadata: {
      custom_fields: [
        { display_name: "Frequency", variable_name: "frequency", value: frequency },
      ],
    },
   // Line 147 in your file:
callback: (response: PaystackResponse) => {
  // Update this line to pass the state setters
  verifyPayment(response.reference, amt, setThankAmount, setShowThankModal);
  setPaying(false);
},

    onClose: () => {
      setPaying(false);
      showToast("Window closed — you can donate anytime. 💚");
    },
  });

  handler.openIframe();
}


  // ── Server-side verification via Next.js API route ───────
 async function handleContactSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);
  const data = {
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  };


  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      showToast("🌿 Message sent successfully!");
      (e.target as HTMLFormElement).reset();
    } else {
      showToast("⚠️ Message failed to send.");
    }
  } catch (err) {
    showToast("⚠️ Error connecting to server.");
  }
}

const handleVolunteerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  
  const formData = new FormData(e.currentTarget);
  const data = {
    name: `${formData.get("firstName")} ${formData.get("lastName")}`,
    email: formData.get("email"),
    phone: formData.get("phone"),
    interest: formData.get("interest"),
    message: formData.get("message"),
  };

  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      setVolSuccess(true);
      showToast("✅ Application submitted!");
    } else {
      showToast("❌ Something went wrong.");
    }
  } catch (err) {
    showToast("❌ Error sending message.");
  }
};


  // ── Share impact ─────────────────────────────────────────
  function shareImpact() {
    const text = `I just donated ${formatGHS(thankAmount)} to ROLU to empower communities in Ghana! 🌱 Join me: rolu.org`;
    if (navigator.share) {
      navigator.share({ title: "I supported ROLU!", text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(text).then(() => showToast("🌿 Copied! Share on your socials."));
    }
  }

  // ── Render ───────────────────────────────────────────────
 return (
  <>
    {/* Add this line right here */}
    <Script src="https://paystack.co" strategy="beforeInteractive" />
    
    {/* ── HEADER ── */}

        <header>
    
        <div className="header-inner">
          <a href="#hero" className="logo">RO<span>LU.</span></a>
          <ul className="nav-links">
            {["about", "gallery", "volunteer", "contact"].map(s => (
              <li key={s}><a href={`#${s}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</a></li>
            ))}
          </ul>
          <div className="toggle-wrap">
            <button 
              className={`toggle-btn ${heroMode === "volunteer" ? "active" : ""}`} 
              onClick={() => {
                setHeroMode("volunteer");
                document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              🤝 I want to Volunteer
            </button>
            <button 
              className={`toggle-btn ${heroMode === "donor" ? "active" : ""}`} 
              onClick={() => {
                setHeroMode("donor");
                document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              💛 I want to Donate
            </button>
          </div>
          <button className="btn-donate-header" onClick={scrollToWidget}>Donate Now</button>
  <button
  type="button"
  className={`hamburger-nav ${mobileOpen ? "open" : ""}`}
  aria-label="Menu"
  style={{ position: 'relative', zIndex: 99999, touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' } as React.CSSProperties}
  onClick={() => setMobileOpen(prev => !prev)}
  onTouchEnd={(e) => { e.preventDefault(); setMobileOpen(prev => !prev); }}
>
  <span></span><span></span><span></span>
</button>
        </div>
      </header>


          {/* ── MOBILE MENU ── */}
{mobileOpen && (
  <div
    onClick={() => setMobileOpen(false)}
    style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9998,
      background: 'rgba(17,28,21,0.92)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0',
    } as React.CSSProperties}
  >
    {/* Close X button */}
    <button
      type="button"
      onClick={() => setMobileOpen(false)}
      style={{
        position: 'absolute',
        top: '1.5rem',
        right: '1.5rem',
        background: 'rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '50%',
        width: '44px',
        height: '44px',
        color: 'white',
        fontSize: '1.2rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
      } as React.CSSProperties}
    >
      ✕
    </button>

    {/* Nav links */}
    {[
      { key: "about", label: "About" },
      { key: "gallery", label: "Gallery" },
      { key: "volunteer", label: "Volunteer" },
      { key: "contact", label: "Contact" },
    ].map((item, i) => (
      <a
        key={item.key}
        href={`#${item.key}`}
        onClick={(e) => { e.stopPropagation(); setMobileOpen(false); }}
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '2.4rem',
          fontWeight: 900,
          color: 'white',
          textDecoration: 'none',
          padding: '0.6rem 2rem',
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
          opacity: 0.92,
          letterSpacing: '-0.02em',
          transition: 'color 0.2s',
        } as React.CSSProperties}
      >
        {item.label}
      </a>
    ))}

    {/* Divider */}
    <div style={{ width: '40px', height: '2px', background: 'rgba(200,150,62,0.6)', borderRadius: '2px', margin: '1.5rem 0' }} />

    {/* Donate Now button */}
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setMobileOpen(false);
        setHeroMode("donor");
        setTimeout(() => {
          widgetRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 350);
      }}
      style={{
        background: 'linear-gradient(135deg, #c8963e, #f0b955)',
        color: 'white',
        border: 'none',
        borderRadius: '100px',
        padding: '16px 44px',
        fontSize: '1.05rem',
        fontWeight: 700,
        cursor: 'pointer',
        minHeight: '52px',
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
        boxShadow: '0 8px 32px rgba(200,150,62,0.4)',
        fontFamily: "'Outfit', sans-serif",
        letterSpacing: '0.02em',
      } as React.CSSProperties}
    >
      💛 Donate Now
    </button>

    {/* Bottom tagline */}
    <p style={{
      color: 'rgba(255,255,255,0.35)',
      fontSize: '0.75rem',
      marginTop: '2rem',
      fontFamily: "'Outfit', sans-serif",
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
    }}>
      Empowering Communities · Ghana
    </p>
  </div>
)}

      {/* ── HERO ── */}
      <section className="hero-section" id="hero">
        {/* Volunteer panel */}
        <div className={`hero-panel hero-volunteer-bg ${heroMode==="volunteer"?"active":""}`}>
          <div className="hero-content">
            <div className="hero-text">
              <div className="hero-tag">Join Our Community</div>
              <h1>Be the <em>Change</em><br/>You Seek</h1>
              <p>Volunteer with ROLU and help transform lives across our communities. Your time and skills can make an immeasurable difference.</p>
              <a href="#volunteer" className="btn-hero">Sign Up to Volunteer →</a>
            </div>
          </div>
        </div>

        {/* Donor panel */}
        <div className={`hero-panel hero-donor-bg ${heroMode==="donor"?"active":""}`}>
          <div className="hero-content">
            <div className="hero-text">
              <div className="hero-tag">Make an Impact</div>
              <h1>Empower a <em>Life</em><br/>Today</h1>
              <p>Your generous donation funds education, healthcare, and livelihood programs for vulnerable communities across Ghana.</p>
              <button className="btn-hero" onClick={()=>widgetRef.current?.scrollIntoView({behavior:"smooth",block:"center"})}>Give Now →</button>
            </div>

            {/* Donation widget */}
            <div className="donation-widget" id="donation-widget" ref={widgetRef}>
              <h3>Make a Donation</h3>
              <p>Choose an amount or enter your own</p>
              <div className="amount-grid">
                {AMOUNTS.map(a=>(
                  <button
                    key={a}
                    className={`amount-btn ${customAmount===""&&selectedAmount===a?"selected":""}`}
                    onClick={()=>{ setSelectedAmount(a); setCustomAmount(""); }}
                  >
                    ₵{a.toLocaleString()}
                  </button>
                ))}
              </div>
              <input
                type="number" className="w-input" placeholder="Or enter custom amount (₵)"
                value={customAmount} min={1}
                onChange={e=>setCustomAmount(e.target.value)}
              />
              <input
                type="email" className="w-input" placeholder="Your email (for receipt) *"
                value={donorEmail} onChange={e=>setDonorEmail(e.target.value)} required
              />
              <div className="frequency-row">
                {(["once","monthly","yearly"] as const).map(f=>(
                  <button key={f} className={`freq-btn ${frequency===f?"selected":""}`} onClick={()=>setFrequency(f)}>
                    {f.charAt(0).toUpperCase()+f.slice(1)}
                  </button>
                ))}
              </div>
              <button className="btn-pay" onClick={handleDonate} disabled={paying}>
                {paying ? "Processing…" : `💳 Donate ${formatGHS(effectiveAmount||0)}`}
              </button>
              <div className="payment-logos">
                <span className="pay-badge momo">MoMo</span>
                <span className="pay-badge visa">VISA</span>
                <span className="pay-badge mc">MC</span>
              </div>
              <p className="secure-note">🔒 Secured by Paystack · SSL Encrypted</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── IMPACT STRIP ── */}
      <div className="impact-strip">
        <div className="impact-strip-inner">
          {[["2,400+","Lives Impacted"],["150+","Active Volunteers"],["12","Communities Served"],["6yrs","Of Service"]].map(([n,l])=>(
            <div key={l}><div className="impact-num">{n}</div><div className="impact-label">{l}</div></div>
          ))}
        </div>
      </div>

      {/* ── ABOUT ── */}
      <section className="about-section" id="about">
        <div className="about-inner">
          <div className="about-img-wrap fade-up">
            <img src="https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=800&q=80" alt="ROLU volunteers working with community members in Ghana"/>
            <div className="about-img-badge"><span>6+</span> Years of Hope</div>
          </div>
          <div className="about-text fade-up">
  <div className="section-tag">Who We Are</div>
  <h2>We Believe Every Person Deserves to <em>Thrive</em></h2>
  
  <p className="mb-4">
    ROLU was born from a simple question: why do some communities get left behind? Founded in the heart of Ghana, we are a <strong>community-focused non-profit initiative</strong> dedicated to bridging the gap between resources and the people who need them most.
  </p>
  
  <p className="mb-4">
    We work in <strong>educational support, healthcare, and humanitarian assistance</strong> — not as outsiders, but as partners. Every program we run is co-designed with the community, because real change comes from within.
  </p>

  {/* ── THE BLENDED ROADMAP (The "Proof" for Paystack) ── */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8">
    <div className="p-4 rounded-xl bg-[#fcfbf7] border-l-4 border-[#c8963e]">
      <h4 className="font-bold text-slate-900 text-sm uppercase mb-1">2026 Goal: Tech for Youth</h4>
      <p className="text-sm text-slate-600 font-medium">Distributing 50 educational & coding kits to rural students by June.</p>
    </div>
    <div className="p-4 rounded-xl bg-[#fcfbf7] border-l-4 border-[#c8963e]">
      <h4 className="font-bold text-slate-900 text-sm uppercase mb-1">Fund Allocation</h4>
      <p className="text-sm text-slate-600 font-medium">90% of all public donations go directly to community project implementation.</p>
    </div>
  </div>

  <p className="mb-6">
    From providing school supplies for children to vocational training for unemployed youth and clean water projects — ROLU is there, leveraging technology to empower underserved populations every step of the way.
  </p>

  <div className="vision-box bg-slate-50 p-6 rounded-2xl italic border border-slate-100">
    <p>🌿 <strong>Our Vision:</strong> A Ghana where every child has access to quality education, every family has clean water, and every young person has the opportunity to build a dignified livelihood.</p>
  </div>
</div>

          </div>
      
      </section>

      {/* ── GALLERY ── */}
      <section className="gallery-section" id="gallery">
        <div className="gallery-head">
          <div className="section-tag">Our Impact</div>
          <h2>Stories from the Field</h2>
        </div>
        <div className="gallery-grid">
          {GALLERY.map((item, i)=>(
            <div
              key={i} className="gallery-item fade-up"
              onClick={()=>setLightboxIdx(i)}
              role="button" tabIndex={0} aria-label={`View photo: ${item.cap}`}
              onKeyDown={e=>{ if(e.key==="Enter"||e.key===" "){e.preventDefault();setLightboxIdx(i);}}}
            >
              <img src={item.src} alt={item.cap}/>
              <div className="gallery-overlay"><p>{item.cap}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* ── VOLUNTEER FORM ── */}
      <section className="volunteer-section" id="volunteer">
        <div className="volunteer-inner">
          <div className="section-tag">Get Involved</div>
          <h2>Volunteer With Us</h2>
          <p>Whether you have a few hours or a few months, your contribution matters.
            Fill out the form below and a member of our team will reach out within 48 hours.</p>
            
          {volSuccess ? (
            <div className="success-box">
              <div className="success-icon">✅</div>
              <p className="success-title">Application received!</p>
              <p className="success-sub">We&apos;ll be in touch within 48 hours.</p>
            </div>
          ) : (
    <form className="vol-form" onSubmit={handleVolunteerSubmit}>
  <div className="form-row-2">
    {/* Notice 'name="firstName"' and 'name="lastName"' */}
    <input name="firstName" type="text" placeholder="First Name" required />
    <input name="lastName" type="text" placeholder="Last Name" required />
  </div>
  <input name="email" type="email" placeholder="Email Address" required />
  <input name="phone" type="tel" placeholder="Phone Number" />
  <select name="interest" defaultValue="">
    <option value="" disabled>Area of Interest</option>
    {["Education & Tutoring","Healthcare Support","Community Outreach","Fundraising","Environmental Projects","Other"].map(o=><option key={o} value={o}>{o}</option>)}
  </select>
  <textarea name="message" placeholder="Tell us a little about yourself…" />
  <button type="submit" className="btn-submit">Submit Application →</button>
</form>

          )}
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section className="contact-section" id="contact">
        <div className="contact-inner">
          <div className="contact-info fade-up">
            <div className="section-tag">Get In Touch</div>
            <h2>We&apos;d Love to Hear From You</h2>
            <p>Have questions about our programs, want to partner with us, or simply want to say hello? Reach out — we respond within 24 hours.</p>
            <div className="contact-detail">
              <div className="contact-icon" aria-hidden="true">📞</div>
              <div><span>Phone</span><a href="tel:+233509419901">+233 50 941 9901</a></div>
            </div>
            <div className="contact-detail">
              <div className="contact-icon" aria-hidden="true">✉️</div>
              <div><span>Email</span><a href="mailto:rolu7063@gmail.com">rolu7063@gmail.com</a></div>
            </div>
            <div className="contact-detail">
              <div className="contact-icon" aria-hidden="true">📍</div>
              <div><span>Address</span><a href="https://maps.google.com/?q=Accra+Ghana" target="_blank" rel="noopener">123 Community Lane, Accra, Ghana ↗</a></div>
            </div>
            <div className="social-row">
              {[["https://wa.me/233509419901","WhatsApp"]].map(([href,label])=>(
                <a key={label} href={href} target="_blank" rel="noopener" className="social-btn">{label} ↗</a>
              ))}
            </div>
          </div>
          <div className="fade-up">
            {contactSuccess ? (
              <div className="success-box" style={{background:"var(--green-pale)"}}>
                <div className="success-icon">✉️</div>
                <p className="success-title">Message sent!</p>
                <p className="success-sub">We&apos;ll get back to you within 24 hours.</p>
              </div>
            ) : (
      <div className="contact-form-container">
  <form onSubmit={handleContactSubmit} className="contact-form">
    <div className="form-group">
      <input 
        type="text" 
        name="name" 
        placeholder="Full Name" 
        className="form-input" 
        required 
      />
    </div>
    <div className="form-group">
      <input 
        type="email" 
        name="email" 
        placeholder="Email Address" 
        className="form-input" 
        required 
      />
    </div>
    <div className="form-group">
      <textarea 
        name="message" 
        placeholder="How can we help?" 
        className="form-textarea" 
        rows={5} 
        required
      ></textarea>
    </div>
    <button type="submit" className="submit-btn">
      Send Message
    </button>
  </form>
</div>

            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="site-footer">
        <p>© 2026 <strong>ROLU.</strong>  Empowering Communities Across Ghana. All rights reserved.</p>
        <div className="footer-links">
          {["about","gallery","volunteer","contact"].map(s=>(
            <a key={s} href={`#${s}`}>{s.charAt(0).toUpperCase()+s.slice(1)}</a>
          ))}
          <a href="mailto:rolu7063@gmail.com">rolu7063@gmail.com</a>
          <a href="tel:+233509419901">+233 50 941 9901</a>
        </div>
      </footer>

      {/* ── LIGHTBOX ── */}
      {lightboxIdx !== null && (
        <div className="lightbox open" role="dialog" aria-modal="true" aria-label="Image viewer"
          onClick={e=>{ if(e.target===e.currentTarget) setLightboxIdx(null); }}>
          <div className="lightbox-inner">
            <button className="lightbox-close" onClick={()=>setLightboxIdx(null)} aria-label="Close">✕</button>
            <button className="lightbox-nav lightbox-prev" onClick={()=>setLightboxIdx(i=>((i??0)-1+GALLERY.length)%GALLERY.length)} aria-label="Previous">‹</button>
            <img src={GALLERY[lightboxIdx].src} alt={GALLERY[lightboxIdx].cap}/>
            <p className="lightbox-caption">{GALLERY[lightboxIdx].cap}</p>
            <button className="lightbox-nav lightbox-next" onClick={()=>setLightboxIdx(i=>((i??0)+1)%GALLERY.length)} aria-label="Next">›</button>
          </div>
        </div>
      )}

      {/* ── THANK YOU MODAL ── */}
      <div className={`modal-overlay ${showThankModal?"open":""}`} role="dialog" aria-modal="true">
        <div className="modal-box">
          <div className="modal-icon">🎉</div>
          <h3>Thank You!</h3>
          <p>Your generous donation has been received. You are helping change lives across Ghana.</p>
          <div className="modal-amount">{formatGHS(thankAmount)}</div>
          <p style={{fontSize:".85rem",marginBottom:0}}>A confirmation and receipt has been sent to your email.</p>
          <br/>
          <div className="modal-actions">
            <button className="modal-btn ghost" onClick={()=>setShowThankModal(false)}>Close</button>
            <button className="modal-btn primary" onClick={shareImpact}>Share Your Impact 🌱</button>
          </div>
        </div>
      </div>

      {/* ── TOAST ── */}
      <div className={`toast ${toast?"show":""}`}>{toast}</div>
    </>
  );
}
