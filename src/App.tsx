import { useState } from "react";

// ── Data ──────────────────────────────────────────────────────────────────────
const LINES = [
  { from: "Abidjan", to: "Bouaké",       price: 5000, duration: "4h30" },
  { from: "Abidjan", to: "Yamoussoukro", price: 3500, duration: "2h30" },
  { from: "Abidjan", to: "San-Pédro",    price: 7000, duration: "6h00" },
  { from: "Abidjan", to: "Man",          price: 8000, duration: "7h00" },
  { from: "Abidjan", to: "Daloa",        price: 6000, duration: "5h00" },
  { from: "Bouaké",  to: "Abidjan",      price: 5000, duration: "4h30" },
  { from: "Yamoussoukro", to: "Abidjan", price: 3500, duration: "2h30" },
];
const CITIES    = ["Abidjan","Bouaké","Yamoussoukro","San-Pédro","Man","Daloa"];
const HOURS     = ["06h00","06h30","07h00","08h00","09h00","10h00","12h00","13h00","14h00","15h00"];
const OPERATORS = ["Orange Money","MTN Money","Wave","Moov Money"];
const KOYA_FEES = 300;
const KOYA_WA = "2250142299949"; // Numéro WhatsApp KOYA sans + ni espace

// ── Helpers ───────────────────────────────────────────────────────────────────
function genDemandeCode() {
  const now = new Date();
  const dd  = String(now.getDate()).padStart(2,"0");
  const mm  = String(now.getMonth()+1).padStart(2,"0");
  const num = String(Math.floor(Math.random()*900)+100);
  return `DEMANDE-KOYA-${dd}${mm}-${num}`;
}

function buildWALink(form, demandeCode, totalPrice) {
  const msg = [
    `🚌 *Demande KOYA — ${demandeCode}*`,
    ``,
    `👤 Nom : ${form.name}`,
    `📱 Téléphone : ${form.phone}`,
    ``,
    `🗺️ Trajet : ${form.from} → ${form.to}`,
    `📅 Date : ${form.date}`,
    `🕗 Heure souhaitée : ${form.hour}`,
    `💺 Places : ${form.seats}`,
    ``,
    `💰 Montant estimé : ${totalPrice.toLocaleString()} FCFA`,
    `   (ticket + ${KOYA_FEES} FCFA frais KOYA)`,
    `📲 Opérateur préféré : ${form.operator}`,
    ``,
    `⏳ En attente de confirmation de disponibilité.`,
  ].join("\n");
  return `https://wa.me/${KOYA_WA}?text=${encodeURIComponent(msg)}`;
}

// ── Styles ────────────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --green:#1A5C38;--green2:#237A4B;--lgreen:#EAF7EE;
  --orange:#E07B00;--lorange:#FFF4E6;
  --dark:#0D1B0F;--mid:#3D5445;--lite:#F2F7F3;--white:#FFFFFF;
  --red:#C0392B;--lred:#FDF0EF;
  --border:#C8DDD0;--wa:#25D366;
  --shadow:0 4px 24px rgba(26,92,56,.10);
  --shadow2:0 2px 8px rgba(26,92,56,.08);
}
body{font-family:'DM Sans',sans-serif;background:var(--lite);color:var(--dark);min-height:100vh}

/* NAV */
.nav{background:var(--green);padding:0 24px;height:64px;display:flex;align-items:center;
  justify-content:space-between;position:sticky;top:0;z-index:100;box-shadow:0 2px 12px rgba(0,0,0,.18)}
.logo{font-family:'Syne',sans-serif;font-size:26px;font-weight:800;color:#fff;letter-spacing:2px}
.logo span{color:var(--orange)}
.badge{background:rgba(255,255,255,.15);color:#fff;font-size:12px;font-weight:500;
  padding:4px 12px;border-radius:20px;border:1px solid rgba(255,255,255,.25)}

/* HERO */
.hero{background:linear-gradient(135deg,var(--green) 0%,#0D3D24 100%);
  padding:56px 24px 48px;text-align:center;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;inset:0;
  background:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")}
.hero-tag{display:inline-block;background:rgba(224,123,0,.2);border:1px solid rgba(224,123,0,.4);
  color:var(--orange);font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;
  padding:5px 14px;border-radius:20px;margin-bottom:20px}
.hero h1{font-family:'Syne',sans-serif;font-size:clamp(28px,5vw,44px);font-weight:800;
  color:#fff;line-height:1.15;margin-bottom:16px}
.hero h1 em{font-style:normal;color:var(--orange)}
.hero-sub{color:rgba(255,255,255,.75);font-size:16px;max-width:520px;margin:0 auto 28px;line-height:1.6}
.hero-chips{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}
.chip{background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.20);color:#fff;
  font-size:13px;padding:6px 14px;border-radius:20px;display:flex;align-items:center;gap:6px}

/* NOTICE — siège non encore garanti */
.not-confirmed-notice{
  background:rgba(224,123,0,.12);border:1.5px solid rgba(224,123,0,.35);
  border-radius:10px;padding:10px 14px;margin-bottom:14px;
  font-size:13px;color:var(--dark);line-height:1.5;display:flex;gap:8px;align-items:flex-start}
.not-confirmed-notice span{flex-shrink:0;font-size:16px}

/* FORM CARD */
.form-wrap{max-width:680px;margin:-24px auto 0;padding:0 16px 48px;position:relative;z-index:10}
.card{background:#fff;border-radius:20px;box-shadow:var(--shadow);overflow:hidden}
.card-header{background:var(--lgreen);border-bottom:1px solid var(--border);padding:20px 28px;
  display:flex;align-items:center;gap:12px}
.card-header-icon{width:40px;height:40px;background:var(--green);border-radius:10px;
  display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
.card-header h2{font-family:'Syne',sans-serif;font-size:18px;font-weight:700;color:var(--green)}
.card-header p{font-size:13px;color:var(--mid);margin-top:2px}
.card-body{padding:28px}

/* STEPS */
.steps{display:flex;margin-bottom:28px;border-radius:10px;overflow:hidden;border:1px solid var(--border)}
.step{flex:1;padding:10px 6px;text-align:center;font-size:11px;font-weight:500;color:var(--mid);
  background:var(--lite);border-right:1px solid var(--border);display:flex;
  align-items:center;justify-content:center;gap:4px;line-height:1.3}
.step:last-child{border-right:none}
.step.active{background:var(--green);color:#fff;font-weight:700}
.step.done{background:var(--lgreen);color:var(--green)}

/* FIELDS */
.field{margin-bottom:18px}
.field label{display:block;font-size:13px;font-weight:600;color:var(--mid);
  margin-bottom:6px;letter-spacing:.3px}
.field label span{color:var(--red)}
.field input,.field select{width:100%;height:48px;padding:0 14px;border:1.5px solid var(--border);
  border-radius:10px;font-size:15px;font-family:'DM Sans',sans-serif;color:var(--dark);
  background:#fff;outline:none;transition:border-color .2s,box-shadow .2s;appearance:none}
.field input:focus,.field select:focus{border-color:var(--green);box-shadow:0 0 0 3px rgba(26,92,56,.10)}
.field input::placeholder{color:#9BAAA0}
.row{display:grid;grid-template-columns:1fr 1fr;gap:14px}

/* PRICE BOX */
.price-box{background:var(--lgreen);border:1.5px solid var(--border);border-radius:12px;
  padding:16px 18px;margin-bottom:18px;display:flex;justify-content:space-between;align-items:center}
.price-left{font-size:13px;color:var(--mid);line-height:1.7}
.price-right{text-align:right}
.price-total{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;color:var(--green)}
.price-detail{font-size:11px;color:var(--mid)}

/* PAYMENT INFO BOX — pas de paiement sur le site */
.payment-info{background:var(--lorange);border:1.5px solid rgba(224,123,0,.30);
  border-radius:12px;padding:18px;margin-bottom:18px}
.payment-info-title{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;
  color:var(--orange);margin-bottom:8px;display:flex;align-items:center;gap:6px}
.payment-info-body{font-size:13px;color:var(--dark);line-height:1.7}
.payment-info-body strong{color:var(--green)}

/* PAYMENT OPTIONS */
.payment-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:18px}
.pay-opt{border:2px solid var(--border);border-radius:10px;padding:12px 14px;
  cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:10px;
  font-size:13px;font-weight:500;color:var(--dark)}
.pay-opt.sel{border-color:var(--green);background:var(--lgreen);color:var(--green)}
.pay-dot{width:18px;height:18px;border-radius:50%;border:2px solid var(--border);
  flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all .2s;position:relative}
.pay-opt.sel .pay-dot{border-color:var(--green);background:var(--green)}
.pay-dot::after{content:'';width:6px;height:6px;border-radius:50%;background:#fff;
  position:absolute;opacity:0;transition:opacity .2s}
.pay-opt.sel .pay-dot::after{opacity:1}

/* BTN */
.btn{width:100%;height:52px;border:none;border-radius:12px;font-family:'Syne',sans-serif;
  font-size:16px;font-weight:700;cursor:pointer;transition:all .2s;
  display:flex;align-items:center;justify-content:center;gap:8px}
.btn-primary{background:var(--green);color:#fff;box-shadow:0 4px 16px rgba(26,92,56,.25)}
.btn-primary:hover{background:var(--green2);transform:translateY(-1px);box-shadow:0 6px 20px rgba(26,92,56,.30)}
.btn-primary:active{transform:translateY(0)}
.btn-primary:disabled{opacity:.5;cursor:not-allowed;transform:none}
.btn-secondary{background:transparent;color:var(--mid);border:1.5px solid var(--border);margin-bottom:12px}
.btn-secondary:hover{background:var(--lite)}
.btn-wa{background:var(--wa);color:#fff;box-shadow:0 4px 16px rgba(37,211,102,.30);font-size:15px}
.btn-wa:hover{background:#1EB85A;transform:translateY(-1px)}

/* DEMANDE REÇUE */
.success-wrap{padding:36px 28px;text-align:center}
.success-icon{width:80px;height:80px;background:var(--lgreen);border-radius:50%;
  display:flex;align-items:center;justify-content:center;font-size:36px;
  margin:0 auto 20px;border:3px solid var(--green)}
.success-title{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;
  color:var(--green);margin-bottom:8px}
.success-sub{font-size:14px;color:var(--mid);line-height:1.7;margin-bottom:24px}
.demande-box{background:var(--dark);color:#fff;border-radius:12px;padding:20px;margin-bottom:20px}
.demande-label{font-size:11px;color:rgba(255,255,255,.5);letter-spacing:2px;
  text-transform:uppercase;margin-bottom:8px}
.demande-code{font-family:'Syne',sans-serif;font-size:20px;font-weight:800;
  color:var(--orange);letter-spacing:2px;word-break:break-all}
.demande-hint{font-size:12px;color:rgba(255,255,255,.4);margin-top:6px}

/* ÉTAPES VALIDATION */
.steps-validation{background:var(--lgreen);border:1.5px solid var(--border);
  border-radius:12px;padding:18px;margin-bottom:20px;text-align:left}
.steps-val-title{font-size:13px;font-weight:700;color:var(--green);
  margin-bottom:14px;display:flex;align-items:center;gap:6px}
.val-step{display:flex;align-items:flex-start;gap:12px;margin-bottom:12px}
.val-step:last-child{margin-bottom:0}
.val-num{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;
  justify-content:center;font-size:12px;font-weight:700;flex-shrink:0}
.val-num.done-step{background:var(--green);color:#fff}
.val-num.pending{background:rgba(26,92,56,.15);color:var(--green)}
.val-num.wait{background:rgba(224,123,0,.15);color:var(--orange)}
.val-text{font-size:13px;color:var(--dark);line-height:1.5;padding-top:4px}
.val-text strong{display:block;font-weight:600}
.val-text span{color:var(--mid);font-size:12px}

/* ERROR */
.err{background:var(--lred);border:1px solid #E8B4B0;color:var(--red);
  border-radius:8px;padding:10px 14px;font-size:13px;margin-bottom:16px}

/* LINES SECTION */
.lines-section{max-width:680px;margin:0 auto 48px;padding:0 16px}
.section-title{font-family:'Syne',sans-serif;font-size:20px;font-weight:700;
  color:var(--dark);margin-bottom:16px;display:flex;align-items:center;gap:8px}
.lines-grid{display:flex;flex-direction:column;gap:10px}
.line-card{background:#fff;border:1.5px solid var(--border);border-radius:14px;
  padding:16px 18px;display:flex;align-items:center;justify-content:space-between;
  cursor:pointer;transition:all .2s;box-shadow:var(--shadow2)}
.line-card:hover{border-color:var(--green);box-shadow:var(--shadow);transform:translateY(-1px)}
.line-route{display:flex;align-items:center;gap:10px;font-family:'Syne',sans-serif;
  font-size:15px;font-weight:700;color:var(--dark)}
.line-arrow{color:var(--green);font-size:18px}
.line-meta{font-size:12px;color:var(--mid);margin-top:3px}
.line-price{font-family:'Syne',sans-serif;font-size:17px;font-weight:800;
  color:var(--green);text-align:right}
.line-price-sub{font-size:11px;color:var(--mid);font-family:'DM Sans',sans-serif;font-weight:400}

/* FOOTER */
.footer{background:var(--dark);padding:32px 24px;text-align:center;
  color:rgba(255,255,255,.5);font-size:13px}
.footer strong{color:#fff;font-family:'Syne',sans-serif}

@media(max-width:480px){
  .row{grid-template-columns:1fr}
  .payment-grid{grid-template-columns:1fr}
  .card-body{padding:20px}
  .hero{padding:40px 16px 36px}
  .step{font-size:10px;padding:8px 4px}
}
`;

// ── Component ─────────────────────────────────────────────────────────────────
export default function KoyaMVP() {
  const [step, setStep]   = useState(1); // 1 trajet · 2 infos · 3 opérateur · 4 reçu
  const [form, setForm]   = useState({ from:"",to:"",date:"",hour:"",seats:"1",name:"",phone:"",operator:"" });
  const [err,  setErr]    = useState("");
  const [code, setCode]   = useState("");
  const [busy, setBusy]   = useState(false);

  const line     = LINES.find(l => l.from === form.from && l.to === form.to);
  const seats    = parseInt(form.seats) || 1;
  const total    = line ? (line.price + KOYA_FEES) * seats : 0;
  const today    = new Date().toISOString().split("T")[0];

  function set(k, v) { setForm(f => ({...f, [k]: v})); setErr(""); }

  function validate() {
    if (step === 1) {
      if (!form.from)              return "Choisis une ville de départ.";
      if (!form.to)                return "Choisis une destination.";
      if (form.from === form.to)   return "Départ et destination doivent être différents.";
      if (!line)                   return "Cette ligne n'est pas encore disponible. Écris-nous sur WhatsApp.";
      if (!form.date)              return "Choisis une date de voyage.";
      if (!form.hour)              return "Choisis une heure souhaitée.";
    }
    if (step === 2) {
      if (!form.name.trim())                    return "Entre ton nom complet.";
      if (!form.phone.trim() || form.phone.length < 8) return "Entre un numéro WhatsApp valide.";
    }
    if (step === 3) {
      if (!form.operator) return "Choisis ton opérateur Mobile Money.";
    }
    return "";
  }

  function next() {
    const e = validate();
    if (e) { setErr(e); return; }
    setErr("");
    if (step === 3) {
      setBusy(true);
      setTimeout(() => { setCode(genDemandeCode()); setStep(4); setBusy(false); }, 1400);
    } else {
      setStep(s => s + 1);
    }
  }

  function reset() {
    setStep(1);
    setForm({ from:"",to:"",date:"",hour:"",seats:"1",name:"",phone:"",operator:"" });
    setCode("");
    setErr("");
  }

  function pickLine(l) {
    setForm(f => ({...f, from: l.from, to: l.to}));
    setTimeout(() => document.getElementById("form-anchor")?.scrollIntoView({behavior:"smooth"}), 80);
  }

  const STEP_LABELS = ["Trajet","Mes infos","Opérateur","Demande"];

  return (
    <>
      <style>{css}</style>

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav className="nav">
        <div className="logo">KOYA<span>.</span></div>
        <div className="badge">🚌 Côte d'Ivoire</div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <div className="hero">
        <div className="hero-tag">✈ Voyage sans stress</div>
        <h1>Réserve ton car<br/>depuis ton <em>téléphone</em></h1>
        <p className="hero-sub">
          Envoie ta demande en 2 minutes. KOYA vérifie la disponibilité,
          te confirme la place sur WhatsApp, et tu paies seulement après.
        </p>
        <div className="hero-chips">
          <div className="chip">✅ Paiement après confirmation</div>
          <div className="chip">💸 MTN · Orange · Wave</div>
          <div className="chip">⚡ Réponse en 15 min</div>
          <div className="chip">🔄 Si confirmée : garantie ou remboursée</div>
        </div>
      </div>

      {/* ── FORM ────────────────────────────────────────────────────────── */}
      <div className="form-wrap" id="form-anchor">
        <div className="card">
          <div className="card-header">
            <div className="card-header-icon">📋</div>
            <div>
              <h2>Envoyer ma demande de réservation</h2>
              <p>KOYA vérifie la disponibilité · Réponse WhatsApp &lt; 15 minutes</p>
            </div>
          </div>

          {step < 4 && (
            <div className="steps">
              {STEP_LABELS.map((label, i) => (
                <div key={i} className={`step ${step===i+1?"active":step>i+1?"done":""}`}>
                  {step > i+1 ? "✓" : i+1} {label}
                </div>
              ))}
            </div>
          )}

          <div className="card-body">
            {err && <div className="err">⚠️ {err}</div>}

            {/* ── STEP 1 — TRAJET ───────────────────────────────────────── */}
            {step === 1 && (
              <>
                <div className="not-confirmed-notice">
                  <span>ℹ️</span>
                  <div>
                    Tu envoies une <strong>demande</strong> de réservation.
                    KOYA vérifie la disponibilité auprès du vendeur avant toute confirmation.
                    Si la place est confirmée, elle est garantie ou remboursée.
                  </div>
                </div>

                <div className="row">
                  <div className="field">
                    <label>Ville de départ <span>*</span></label>
                    <select value={form.from} onChange={e => set("from", e.target.value)}>
                      <option value="">Choisir...</option>
                      {CITIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label>Destination <span>*</span></label>
                    <select value={form.to} onChange={e => set("to", e.target.value)}>
                      <option value="">Choisir...</option>
                      {CITIES.filter(c => c !== form.from).map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {line && (
                  <div className="price-box">
                    <div className="price-left">
                      🚌 {line.from} → {line.to}<br/>
                      ⏱ Durée estimée : {line.duration}
                    </div>
                    <div className="price-right">
                      <div style={{fontSize:12,color:"var(--mid)"}}>Prix indicatif</div>
                      <div className="price-total">{line.price.toLocaleString()} FCFA</div>
                    </div>
                  </div>
                )}

                <div className="row">
                  <div className="field">
                    <label>Date de voyage <span>*</span></label>
                    <input type="date" min={today} value={form.date} onChange={e => set("date", e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Heure souhaitée <span>*</span></label>
                    <select value={form.hour} onChange={e => set("hour", e.target.value)}>
                      <option value="">Choisir...</option>
                      {HOURS.map(h => <option key={h}>{h}</option>)}
                    </select>
                  </div>
                </div>

                <div className="field">
                  <label>Nombre de places <span>*</span></label>
                  <select value={form.seats} onChange={e => set("seats", e.target.value)}>
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} place{n>1?"s":""}</option>)}
                  </select>
                </div>

                <button className="btn btn-primary" onClick={next}>
                  Continuer →
                </button>
              </>
            )}

            {/* ── STEP 2 — INFOS ────────────────────────────────────────── */}
            {step === 2 && (
              <>
                <div className="field">
                  <label>Nom complet <span>*</span></label>
                  <input placeholder="Ex : Koné Aminata" value={form.name}
                    onChange={e => set("name", e.target.value)} />
                </div>
                <div className="field">
                  <label>Numéro WhatsApp <span>*</span></label>
                  <input placeholder="+225 07 00 00 00 00" value={form.phone}
                    onChange={e => set("phone", e.target.value)} />
                </div>

                {line && (
                  <div className="price-box">
                    <div className="price-left">
                      🚌 {form.from} → {form.to}<br/>
                      📅 {form.date} · {form.hour}<br/>
                      💺 {form.seats} place{seats>1?"s":""}
                    </div>
                    <div className="price-right">
                      <div style={{fontSize:12,color:"var(--mid)"}}>Montant estimé</div>
                      <div className="price-total">{total.toLocaleString()} FCFA</div>
                      <div className="price-detail">ticket + {KOYA_FEES} FCFA frais</div>
                    </div>
                  </div>
                )}

                <div className="not-confirmed-notice">
                  <span>💳</span>
                  <div>
                    Le paiement se fait <strong>uniquement après confirmation</strong> de la disponibilité
                    par KOYA sur WhatsApp. Tu ne paies rien maintenant.
                  </div>
                </div>

                <button className="btn btn-secondary" onClick={() => { setStep(1); setErr(""); }}>← Retour</button>
                <button className="btn btn-primary" onClick={next}>Continuer →</button>
              </>
            )}

            {/* ── STEP 3 — OPÉRATEUR ────────────────────────────────────── */}
            {step === 3 && (
              <>
                <div className="payment-info">
                  <div className="payment-info-title">
                    💳 Comment fonctionne le paiement KOYA
                  </div>
                  <div className="payment-info-body">
                    1. Tu envoies ta demande maintenant<br/>
                    2. KOYA vérifie la disponibilité auprès du vendeur<br/>
                    3. Tu reçois la <strong>confirmation WhatsApp</strong> en moins de 15 min<br/>
                    4. <strong>Seulement après confirmation</strong>, tu envoies le paiement<br/>
                    5. Tu reçois ton code de voyage définitif
                  </div>
                </div>

                <p style={{fontSize:13,fontWeight:600,color:"var(--mid)",marginBottom:10}}>
                  Ton opérateur Mobile Money préféré <span style={{color:"var(--red)"}}>*</span>
                </p>
                <div className="payment-grid">
                  {OPERATORS.map(op => (
                    <div key={op}
                      className={`pay-opt ${form.operator===op?"sel":""}`}
                      onClick={() => set("operator", op)}>
                      <div className="pay-dot"></div>
                      {op}
                    </div>
                  ))}
                </div>

                {line && (
                  <div className="price-box">
                    <div className="price-left">
                      <strong>{form.name}</strong><br/>
                      {form.from} → {form.to} · {form.seats} place{seats>1?"s":""}<br/>
                      {form.date} à {form.hour}
                    </div>
                    <div className="price-right">
                      <div style={{fontSize:12,color:"var(--mid)"}}>Montant estimé</div>
                      <div className="price-total">{total.toLocaleString()} FCFA</div>
                      <div className="price-detail">payable après confirmation</div>
                    </div>
                  </div>
                )}

                <button className="btn btn-secondary" onClick={() => { setStep(2); setErr(""); }}>← Retour</button>
                <button className="btn btn-primary" onClick={next} disabled={busy}>
                  {busy ? "⏳ Préparation..." : "📤 Préparer ma demande WhatsApp"}
                </button>
              </>
            )}

            {/* ── STEP 4 — DEMANDE REÇUE ────────────────────────────────── */}
            {step === 4 && (
              <div className="success-wrap">
                <div className="success-icon">📨</div>
                <div className="success-title">Demande préparée !</div>
                <p className="success-sub">
                  Ta demande est prête, <strong>{form.name}</strong>.<br/>
                  Clique sur WhatsApp pour l'envoyer à KOYA.<br/>
                  KOYA vérifie ensuite la disponibilité et te répond en <strong>moins de 15 minutes</strong>.
                </p>

                <div className="demande-box">
                  <div className="demande-label">Numéro de ta demande</div>
                  <div className="demande-code">{code}</div>
                  <div className="demande-hint">Garde ce numéro pour suivre ta demande</div>
                </div>

                <div className="steps-validation">
                  <div className="steps-val-title">⏳ Validation KOYA en cours</div>

                  <div className="val-step">
                    <div className="val-num done-step">✓</div>
                    <div className="val-text">
                      <strong>Demande préparée</strong>
                      <span>Numéro {code}</span>
                    </div>
                  </div>

                  <div className="val-step">
                    <div className="val-num pending">⏳</div>
                    <div className="val-text">
                      <strong>Vérification auprès du vendeur de guichet</strong>
                      <span>KOYA vérifie la disponibilité réelle de ta place</span>
                    </div>
                  </div>

                  <div className="val-step">
                    <div className="val-num wait">→</div>
                    <div className="val-text">
                      <strong>Confirmation + paiement sur WhatsApp</strong>
                      <span>Tu recevras les instructions de paiement après confirmation</span>
                    </div>
                  </div>
                </div>

                <div className="not-confirmed-notice" style={{marginBottom:16}}>
                  <span>ℹ️</span>
                  <div>
                    Si ta place est <strong>confirmée par KOYA</strong>, elle est garantie ou remboursée.
                    Le paiement intervient uniquement après cette confirmation.
                  </div>
                </div>

                <a
                  href={buildWALink(form, code, total)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{display:"block",textDecoration:"none",marginBottom:8}}>
                  <button className="btn btn-wa">
                    <span>💬</span> Continuer sur WhatsApp
                  </button>
                </a>
                <p style={{fontSize:12,color:"var(--red)",textAlign:"center",marginBottom:16,fontWeight:500}}>
                  ⚠️ Cette étape est obligatoire pour que KOYA reçoive ta demande.
                </p>

                <button className="btn btn-secondary" onClick={reset}>
                  + Nouvelle demande
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── LIGNES DISPONIBLES ──────────────────────────────────────────── */}
      <div className="lines-section">
        <div className="section-title">🗺️ Lignes disponibles</div>
        <div className="lines-grid">
          {LINES.filter(l => l.from === "Abidjan").map((l, i) => (
            <div key={i} className="line-card" onClick={() => pickLine(l)}>
              <div>
                <div className="line-route">
                  {l.from} <span className="line-arrow">→</span> {l.to}
                </div>
                <div className="line-meta">⏱ {l.duration} · Plusieurs départs/jour</div>
              </div>
              <div className="line-price">
                {l.price.toLocaleString()} FCFA
                <div className="line-price-sub">+ {KOYA_FEES} FCFA frais</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="footer">
        <div style={{marginBottom:8}}><strong>KOYA</strong> · Ton car. Ta place.</div>
        <div>© 2026 KOYA — Côte d'Ivoire · Tous droits réservés</div>
        <div style={{marginTop:8,color:"rgba(255,255,255,.4)",fontSize:12}}>
          Le paiement intervient uniquement après confirmation de disponibilité par KOYA.
        </div>
      </footer>
    </>
  );
}
