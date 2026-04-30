// @ts-nocheck
import { useState } from "react";

const LINES = [
  { from: "Abidjan", to: "Bouaké", price: 5000, duration: "4h30" },
  { from: "Abidjan", to: "Yamoussoukro", price: 3500, duration: "2h30" },
  { from: "Abidjan", to: "San-Pédro", price: 7000, duration: "6h00" },
  { from: "Abidjan", to: "Man", price: 8000, duration: "7h00" },
  { from: "Abidjan", to: "Daloa", price: 6000, duration: "5h00" },
  { from: "Bouaké", to: "Abidjan", price: 5000, duration: "4h30" },
  { from: "Yamoussoukro", to: "Abidjan", price: 3500, duration: "2h30" },
];

const HOURS = ["06h00", "06h30", "07h00", "08h00", "09h00", "10h00", "12h00", "13h00", "14h00", "15h00"];
const OPERATORS = ["Orange Money", "MTN Money", "Wave", "Moov Money"];
const PREFS = ["Rapide", "Confort", "Économique"];

const KOYA_FEES = 1000;
const KOYA_WA = "2250142299949";
const SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbxbepaP2hrm7zOlbJcWnAdJzKT4wICASUs4sj5x8orc5iNcQTmmNB11eiBby2w4-_QV3g/exec";

const DEPARTURES = [...new Set(LINES.map((l) => l.from))];

function getDestinations(from) {
  if (!from) return [];
  return LINES.filter((l) => l.from === from).map((l) => l.to);
}

function genCode() {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  return `DEMANDE-KOYA-${dd}${mm}-${String(Math.floor(Math.random() * 900) + 100)}`;
}

function formatTel(tel) {
  if (!tel || !tel.trim()) return "Non renseigné";
  let digits = tel.replace(/\D/g, "");
  if (digits.startsWith("00225")) digits = digits.slice(5);
  if (digits.startsWith("225")) digits = digits.slice(3);

  if (digits.length === 10) {
    return "+225 " + digits.slice(0, 2) + " " + digits.slice(2, 4) + " " + digits.slice(4, 6) + " " + digits.slice(6, 8) + " " + digits.slice(8, 10);
  }

  return "+225 " + digits;
}

function buildWA(form, code, total) {
  const urgent = form.urgent ? "URGENT - Voyage aujourd'hui\n\n" : "";
  const besoin = form.besoin ? `\nBesoin : ${form.besoin}` : "";
  const pref = form.pref ? `\nPréférence : ${form.pref}` : "";

  const lines = [
    urgent + "Demande KOYA - " + code,
    "",
    "Nom : " + form.name,
    "Tel : " + formatTel(form.phone),
    "",
    "Trajet : " + form.from + " -> " + form.to,
    "Date : " + form.date,
    "Heure : " + form.hour,
    "Places : " + form.seats,
    "",
    "Montant estime : " + total.toLocaleString() + " FCFA",
    "(ticket + 1 000 FCFA service de réservation par place)",
    "Operateur : " + form.operator,
    besoin,
    pref,
    "",
    "En attente de confirmation de disponibilite.",
  ];

  return "https://wa.me/" + KOYA_WA + "?text=" + encodeURIComponent(lines.join("\n"));
}

function buildSheetUrl(form, code, total) {
  const params = new URLSearchParams();
  params.append("code", code);
  params.append("name", form.name);
  params.append("phone", formatTel(form.phone));
  params.append("from", form.from);
  params.append("to", form.to);
  params.append("date", form.date);
  params.append("hour", form.hour);
  params.append("seats", form.seats);
  params.append("total", String(total));
  params.append("operator", form.operator);
  params.append("pref", form.pref || "");
  params.append("besoin", form.besoin || "");
  params.append("urgent", form.urgent ? "OUI" : "NON");
  return `${SHEET_WEBHOOK_URL}?${params.toString()}`;
}

const css = `
*{box-sizing:border-box}
body{margin:0;font-family:Arial,sans-serif;background:#F2F7F3;color:#0D1B0F}
.nav{height:64px;background:#1A5C38;color:white;display:flex;align-items:center;justify-content:space-between;padding:0 24px;position:sticky;top:0;z-index:10}
.logo{font-size:26px;font-weight:900;letter-spacing:2px}.logo span{color:#E07B00}
.badge{background:rgba(255,255,255,.15);padding:6px 12px;border-radius:20px;font-size:12px}
.hero{background:linear-gradient(135deg,#1A5C38,#0D3D24);color:white;text-align:center;padding:48px 20px}
.hero-tag{display:inline-block;color:#E07B00;background:rgba(224,123,0,.18);padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;margin-bottom:18px}
.hero h1{font-size:38px;line-height:1.1;margin:0 0 12px}.hero em{color:#E07B00;font-style:normal}
.hero-sub{opacity:.8;max-width:520px;margin:0 auto 22px;line-height:1.6}
.hero-chips{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:20px}
.chip{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);padding:7px 12px;border-radius:20px;font-size:12px}
.hero-cta,.cta-final-btn{background:#E07B00;color:white;border:0;border-radius:12px;padding:14px 28px;font-weight:800;font-size:16px;cursor:pointer}
.proof-bar{display:inline-flex;align-items:center;gap:8px;margin-top:18px;background:rgba(255,255,255,.1);border-radius:10px;padding:10px 16px;font-size:12px}
.proof-dot{width:8px;height:8px;border-radius:50%;background:#4ADE80}
.section{max-width:680px;margin:0 auto;padding:24px 16px}
.grid2{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
.card-mini,.how-step{background:white;border:1px solid #C8DDD0;border-radius:14px;padding:16px}
.check{width:22px;height:22px;border-radius:50%;background:#1A5C38;color:white;display:inline-flex;align-items:center;justify-content:center;margin-right:8px}
.how-title{text-align:center;font-size:22px;font-weight:900;margin-bottom:18px}
.how-num{width:36px;height:36px;border-radius:50%;background:#1A5C38;color:white;display:flex;align-items:center;justify-content:center;font-weight:900;margin-bottom:10px}
.how-step-title{font-weight:800;margin-bottom:6px}.how-step-desc{font-size:13px;color:#3D5445;line-height:1.5}
.band{background:#EAF7EE;border-top:1px solid #C8DDD0;border-bottom:1px solid #C8DDD0;text-align:center;padding:20px}
.price-band{background:white;padding:20px}.price-inner{max-width:680px;margin:0 auto;background:#FFF4E6;border:1px solid rgba(224,123,0,.25);border-radius:14px;padding:16px;display:flex;justify-content:space-between;gap:12px}.price-inner strong{color:#E07B00;font-size:18px}
.human,.danger{max-width:648px;margin:16px auto;background:#FFF4E6;border-left:4px solid #E07B00;border-radius:12px;padding:16px;line-height:1.6}
.danger{background:#FDF0EF;border:1px solid rgba(192,57,43,.25);border-left:4px solid #C0392B}
.form-wrap{max-width:680px;margin:0 auto 40px;padding:0 16px}
.form-card{background:white;border-radius:20px;box-shadow:0 4px 24px rgba(26,92,56,.12);overflow:hidden}
.form-header{background:#EAF7EE;border-bottom:1px solid #C8DDD0;padding:18px 22px;display:flex;gap:12px;align-items:center}
.form-icon{width:42px;height:42px;border-radius:12px;background:#1A5C38;color:white;display:flex;align-items:center;justify-content:center;font-size:22px}
.form-body{padding:22px}.steps{display:flex;border-bottom:1px solid #C8DDD0}.step{flex:1;text-align:center;padding:10px 4px;font-size:11px;background:#F2F7F3}.step.active{background:#1A5C38;color:white;font-weight:800}.step.done{background:#EAF7EE;color:#1A5C38}
.err{background:#FDF0EF;color:#C0392B;border:1px solid #E8B4B0;border-radius:8px;padding:10px;margin-bottom:14px}
.notice{background:#EAF7EE;border:1px solid rgba(26,92,56,.2);padding:12px;border-radius:10px;margin-bottom:14px;font-size:13px;line-height:1.5}
.notice.orange{background:#FFF4E6;border-color:rgba(224,123,0,.2)}
.field{margin-bottom:16px}.field label{display:block;font-weight:800;color:#3D5445;font-size:13px;margin-bottom:6px}.field input,.field select,.field textarea{width:100%;height:48px;border:1.5px solid #C8DDD0;border-radius:10px;padding:0 14px;font-size:15px}.field textarea{height:80px;padding:12px}
.row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.urgent{display:flex;gap:12px;align-items:center;background:#FDF0EF;border:1px solid rgba(192,57,43,.25);border-radius:10px;padding:12px;margin-bottom:16px;cursor:pointer}
.urgent.active{border-color:#C0392B}.box{width:20px;height:20px;border:2px solid #C8DDD0;border-radius:6px;display:flex;align-items:center;justify-content:center}.urgent.active .box{background:#C0392B;color:white;border-color:#C0392B}
.pref-grid,.payment-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.payment-grid{grid-template-columns:repeat(2,1fr)}
.pref,.pay{border:1.5px solid #C8DDD0;border-radius:10px;padding:11px;text-align:center;cursor:pointer;font-size:13px;font-weight:700}
.pref.sel,.pay.sel{background:#EAF7EE;border-color:#1A5C38;color:#1A5C38}
.price-box{background:#EAF7EE;border:1.5px solid #C8DDD0;border-radius:12px;padding:14px;margin-bottom:16px;display:flex;justify-content:space-between;gap:10px;align-items:center}.price-total{font-size:21px;font-weight:900;color:#1A5C38}
.btn{width:100%;height:54px;border:0;border-radius:12px;font-weight:900;font-size:15px;cursor:pointer;margin-top:8px}
.btn-g{background:#1A5C38;color:white}.btn-sec{background:white;color:#3D5445;border:1.5px solid #C8DDD0}.btn-wa{background:#25D366;color:white}
.success{text-align:center;padding:28px 20px}.success-icon{width:76px;height:76px;border-radius:50%;background:#EAF7EE;border:3px solid #1A5C38;display:flex;align-items:center;justify-content:center;margin:0 auto 18px;font-size:34px}.success-title{font-size:24px;font-weight:900;color:#1A5C38}
.code-box{background:#0D1B0F;color:white;border-radius:12px;padding:18px;margin:18px 0}.code{color:#E07B00;font-weight:900;letter-spacing:1px}
.line-card{background:white;border:1.5px solid #C8DDD0;border-radius:14px;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;cursor:pointer}.line-route{font-weight:900}.line-price{font-weight:900;color:#1A5C38;text-align:right}
.footer{background:#0D1B0F;color:rgba(255,255,255,.55);text-align:center;padding:28px;font-size:13px}
@media(max-width:520px){.grid2,.row,.payment-grid{grid-template-columns:1fr}.pref-grid{grid-template-columns:repeat(3,1fr)}.price-inner{flex-direction:column}.hero h1{font-size:30px}}
`;

export default function KoyaMVP() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    from: "",
    to: "",
    date: "",
    hour: "",
    seats: "1",
    name: "",
    phone: "",
    operator: "",
    besoin: "",
    pref: "",
    urgent: false,
  });

  const [err, setErr] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const line = LINES.find((l) => l.from === form.from && l.to === form.to);
  const seats = parseInt(form.seats) || 1;
  const total = line ? (line.price + KOYA_FEES) * seats : 0;
  const today = new Date().toISOString().split("T")[0];

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
    setErr("");
  }

  function setDeparture(value) {
    setForm((f) => ({ ...f, from: value, to: "" }));
    setErr("");
  }

  function validate() {
    if (step === 1) {
      if (!form.from) return "Choisis une ville de départ.";
      if (!form.to) return "Choisis une destination.";
      if (!line) return "Ce trajet n’est pas encore disponible.";
      if (!form.date) return "Choisis une date de voyage.";
      if (!form.hour) return "Choisis une heure souhaitée.";
    }

    if (step === 2 && !form.name.trim()) return "Entre ton nom complet.";
    if (step === 3 && !form.operator) return "Choisis ton opérateur Mobile Money.";

    return "";
  }

  function next() {
    const e = validate();
    if (e) {
      setErr(e);
      return;
    }

    if (step === 3) {
      setBusy(true);
      setTimeout(() => {
        setCode(genCode());
        setStep(4);
        setBusy(false);
      }, 700);
      return;
    }

    setStep((s) => s + 1);
  }

  function reset() {
    setStep(1);
    setForm({
      from: "",
      to: "",
      date: "",
      hour: "",
      seats: "1",
      name: "",
      phone: "",
      operator: "",
      besoin: "",
      pref: "",
      urgent: false,
    });
    setCode("");
    setErr("");
  }

  function scrollToForm() {
    document.getElementById("form-anchor")?.scrollIntoView({ behavior: "smooth" });
  }

  function pickLine(l) {
    setForm((f) => ({ ...f, from: l.from, to: l.to }));
    setErr("");
    setTimeout(scrollToForm, 80);
  }

  const STEP_LABELS = ["Trajet", "Infos", "Paiement", "Demande"];

  return (
    <>
      <style>{css}</style>

      <nav className="nav">
        <div className="logo">KOYA<span>.</span></div>
        <div className="badge">🚌 Côte d'Ivoire</div>
      </nav>

      <section className="hero">
        <div className="hero-tag">🚌 Service de réservation</div>
        <h1>Réserve ta place<br />sans te <em>déplacer</em></h1>
        <p className="hero-sub">KOYA t’aide à trouver une place disponible auprès d’une compagnie fiable avant tout paiement.</p>
        <div className="hero-chips">
          <div className="chip">✅ Place vérifiée</div>
          <div className="chip">✅ Paiement après confirmation</div>
          <div className="chip">✅ Assistance jusqu’au départ</div>
        </div>
        <button className="hero-cta" onClick={scrollToForm}>Réserver ma place</button>
        <div className="proof-bar"><div className="proof-dot" />Phase test · Abidjan ↔ Bouaké</div>
      </section>

      <section className="section">
        <div className="grid2">
          {["Place vérifiée", "Départ confirmé", "Compagnie fiable sélectionnée", "Assistance KOYA jusqu’au départ"].map((item) => (
            <div className="card-mini" key={item}><span className="check">✓</span>{item}</div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="how-title">Comment ça marche ?</div>
        <div className="grid2">
          {[
            ["1", "Tu fais ta demande", "Remplis le formulaire en 2 minutes."],
            ["2", "KOYA vérifie", "Nous cherchons une place disponible."],
            ["3", "Tu paies après confirmation", "Aucun paiement avant validation."],
            ["4", "Tu voyages", "Tu reçois les informations utiles."],
          ].map(([n, t, d]) => (
            <div className="how-step" key={n}>
              <div className="how-num">{n}</div>
              <div className="how-step-title">{t}</div>
              <div className="how-step-desc">{d}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="band">KOYA sélectionne une compagnie fiable avec places disponibles. Les détails utiles sont communiqués après confirmation.</div>

      <div className="price-band">
        <div className="price-inner">
          <div><strong>Service de réservation : 1 000 FCFA / place</strong><br />Prix du ticket selon la destination</div>
          <div>Tu paies uniquement après confirmation.</div>
        </div>
      </div>

      <div className="human"><strong>👤 Une vraie personne suit ta demande</strong><br />Ta demande est traitée par un opérateur KOYA, pas automatiquement par une machine.</div>

      <div className="danger">
        <strong>❌ Ce que KOYA ne fait pas</strong><br />
        ✗ KOYA ne prend pas ton argent avant confirmation.<br />
        ✗ KOYA ne promet pas une place sans vérification.<br />
        ✗ KOYA ne remplace pas la compagnie : KOYA sécurise la réservation.
      </div>

      <div className="form-wrap" id="form-anchor">
        <div className="form-card">
          <div className="form-header">
            <div className="form-icon">📋</div>
            <div>
              <h2>Envoyer ma demande de réservation</h2>
              <p>Réponse rapide pendant les horaires d’ouverture</p>
            </div>
          </div>

          {step < 4 && (
            <div className="steps">
              {STEP_LABELS.map((label, i) => (
                <div key={label} className={`step ${step === i + 1 ? "active" : step > i + 1 ? "done" : ""}`}>
                  {step > i + 1 ? "✓" : i + 1} {label}
                </div>
              ))}
            </div>
          )}

          <div className="form-body">
            {err && <div className="err">⚠️ {err}</div>}

            {step === 1 && (
              <>
                <div className="notice">ℹ️ Tu envoies une demande. KOYA vérifie la disponibilité avant paiement.</div>

                <div className={`urgent ${form.urgent ? "active" : ""}`} onClick={() => set("urgent", !form.urgent)}>
                  <div className="box">{form.urgent ? "✓" : ""}</div>
                  <div>
                    <strong>🚨 Je voyage aujourd’hui</strong>
                    <div style={{ fontSize: 12, color: "#3D5445" }}>Ta demande sera marquée urgente.</div>
                  </div>
                </div>

                <div className="row">
                  <div className="field">
                    <label>Ville de départ *</label>
                    <select value={form.from} onChange={(e) => setDeparture(e.target.value)}>
                      <option value="">Choisir...</option>
                      {DEPARTURES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="field">
                    <label>Destination *</label>
                    <select value={form.to} onChange={(e) => set("to", e.target.value)} disabled={!form.from}>
                      <option value="">{form.from ? "Choisir..." : "Choisis d’abord le départ"}</option>
                      {getDestinations(form.from).map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {line && (
                  <div className="price-box">
                    <div>🚌 {line.from} → {line.to}<br />⏱ {line.duration}</div>
                    <div className="price-total">{line.price.toLocaleString()} FCFA</div>
                  </div>
                )}

                <div className="row">
                  <div className="field">
                    <label>Date de voyage *</label>
                    <input type="date" min={today} value={form.date} onChange={(e) => set("date", e.target.value)} />
                  </div>

                  <div className="field">
                    <label>Heure souhaitée *</label>
                    <select value={form.hour} onChange={(e) => set("hour", e.target.value)}>
                      <option value="">Choisir...</option>
                      {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                </div>

                <div className="field">
                  <label>Nombre de places *</label>
                  <select value={form.seats} onChange={(e) => set("seats", e.target.value)}>
                    {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} place{n > 1 ? "s" : ""}</option>)}
                  </select>
                </div>

                <div className="field">
                  <label>Préférence</label>
                  <div className="pref-grid">
                    {PREFS.map((p) => (
                      <div key={p} className={`pref ${form.pref === p ? "sel" : ""}`} onClick={() => set("pref", form.pref === p ? "" : p)}>
                        {p}
                      </div>
                    ))}
                  </div>
                </div>

                <button className="btn btn-g" onClick={next}>Continuer →</button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="field">
                  <label>Nom complet *</label>
                  <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Ex : Koné Aminata" />
                </div>

                <div className="field">
                  <label>Numéro WhatsApp</label>
                  <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+225 07 00 00 00 00" />
                </div>

                <div className="field">
                  <label>Besoin particulier</label>
                  <textarea value={form.besoin} onChange={(e) => set("besoin", e.target.value)} placeholder="Ex : bagages lourds, enfant, personne âgée..." />
                </div>

                <div className="notice orange">💳 Le paiement se fait uniquement après confirmation par KOYA.</div>

                <button className="btn btn-sec" onClick={() => setStep(1)}>← Retour</button>
                <button className="btn btn-g" onClick={next}>Continuer →</button>
              </>
            )}

            {step === 3 && (
              <>
                <div className="payment-info">
                  <div className="payment-info-title">💳 Paiement après confirmation</div>
                  <div className="payment-info-body">
                    1. Tu prépares ta demande<br />
                    2. KOYA vérifie la disponibilité<br />
                    3. Tu paies seulement après confirmation
                  </div>
                </div>

                <div className="payment-grid">
                  {OPERATORS.map((op) => (
                    <div key={op} className={`pay ${form.operator === op ? "sel" : ""}`} onClick={() => set("operator", op)}>
                      <span translate="no">{op}</span>
                    </div>
                  ))}
                </div>

                {line && (
                  <div className="price-box">
                    <div>
                      <strong>{form.name}</strong><br />
                      {form.from} → {form.to}<br />
                      {form.date} à {form.hour}<br />
                      {form.seats} place{seats > 1 ? "s" : ""}
                    </div>
                    <div>
                      <div className="price-total">{total.toLocaleString()} FCFA</div>
                      <div className="price-detail">après confirmation</div>
                    </div>
                  </div>
                )}

                <button className="btn btn-sec" onClick={() => setStep(2)}>← Retour</button>
                <button className="btn btn-g" onClick={next} disabled={busy}>
                  {busy ? "Préparation..." : "Préparer ma demande"}
                </button>
              </>
            )}

            {step === 4 && (
              <div className="success">
                <div className="success-icon">📨</div>
                <div className="success-title">Demande préparée !</div>
                <p>Ta demande est prête, <strong>{form.name}</strong>.</p>

                <div className="code-box">
                  <div>Numéro de demande</div>
                  <div className="code">{code}</div>
                </div>

                <a href={buildSheetUrl(form, code, total)} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                  <button className="btn btn-wa">✅ Enregistrer ma demande</button>
                </a>

                <a href={buildWA(form, code, total)} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                  <button className="btn btn-g">💬 Envoyer ensuite sur WhatsApp</button>
                </a>

                <div className="wa-mandatory">Clique d’abord sur “Enregistrer ma demande”, puis sur WhatsApp.</div>

                <button className="btn btn-sec" onClick={reset}>+ Nouvelle demande</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="lines-section">
        <div className="section-title">🗺️ Lignes disponibles</div>
        {LINES.filter((l) => l.from === "Abidjan").map((l, i) => (
          <div className="line-card" key={i} onClick={() => pickLine(l)}>
            <div>
              <div className="line-route">{l.from} <span className="line-arrow">→</span> {l.to}</div>
              <div className="line-meta">⏱ {l.duration} · Plusieurs départs/jour</div>
            </div>
            <div className="line-price">
              {l.price.toLocaleString()} FCFA
              <div className="line-price-sub">+ {KOYA_FEES.toLocaleString()} FCFA service KOYA</div>
            </div>
          </div>
        ))}
      </section>

      <div className="cta-final">
        <button className="cta-final-btn" onClick={scrollToForm}>🚌 Réserver ma place maintenant</button>
      </div>

      <footer className="footer">
        <div><strong>KOYA</strong> · Ton car. Ta place.</div>
        <div>© 2026 KOYA — Côte d'Ivoire</div>
      </footer>
    </>
  );
}