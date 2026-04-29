// @ts-nocheck
import { useState } from "react";

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
const PREFS     = ["Rapide","Confort","Économique"];
const KOYA_FEES = 1000;
const KOYA_WA   = "2250142299949";

const SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbyQSV41nhrZVKcH53SKkfRh7zK8RA8PPDxKBy-zoO1OprkvhPv329z9cA9OT-r6b3GX8g/exec";

function genCode() {
  const now = new Date();
  const dd  = String(now.getDate()).padStart(2,"0");
  const mm  = String(now.getMonth()+1).padStart(2,"0");
  return `DEMANDE-KOYA-${dd}${mm}-${String(Math.floor(Math.random()*900)+100)}`;
}

function formatTel(tel) {
  if (!tel || !tel.trim()) return "Non renseigné";
  let digits = tel.replace(/\D/g, "");
  if (digits.startsWith("225")) digits = digits.slice(3);
  if (digits.startsWith("00225")) digits = digits.slice(5);
  if (digits.length === 10) return "+225 " + digits.slice(0,2) + " " + digits.slice(2,4) + " " + digits.slice(4,6) + " " + digits.slice(6,8) + " " + digits.slice(8,10);
  if (digits.length === 8)  return "+225 " + digits.slice(0,2) + " " + digits.slice(2,4) + " " + digits.slice(4,6) + " " + digits.slice(6,8);
  return "+225 " + digits;
}

function buildWA(form, code, total) {
  const urgent = form.urgent ? "URGENT - Voyage aujourd'hui\n\n" : "";
  const tel = "Tel : " + formatTel(form.phone);
  const besoin = form.besoin ? `\nBesoin : ${form.besoin}` : "";
  const pref = form.pref ? `\nPréférence : ${form.pref}` : "";
  const lines = [
    urgent + "Demande KOYA - " + code,
    "",
    "Nom : " + form.name,
    tel,
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

function saveToSheet(form, code, total) {
  return new Promise((resolve) => {
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

    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(true);
    img.src = `${SHEET_WEBHOOK_URL}?${params.toString()}`;

    setTimeout(() => resolve(true), 800);
  });
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --g:#1A5C38;--g2:#237A4B;--lg:#EAF7EE;
  --o:#E07B00;--lo:#FFF4E6;
  --dk:#0D1B0F;--mid:#3D5445;--lite:#F2F7F3;--w:#FFFFFF;
  --r:#C0392B;--lr:#FDF0EF;
  --bd:#C8DDD0;--wa:#25D366;
  --sh:0 4px 24px rgba(26,92,56,.10);
  --sh2:0 2px 8px rgba(26,92,56,.08);
}
body{font-family:'DM Sans',sans-serif;background:var(--lite);color:var(--dk);min-height:100vh}
.nav{background:var(--g);padding:0 24px;height:64px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100;box-shadow:0 2px 12px rgba(0,0,0,.18)}
.logo{font-family:'Syne',sans-serif;font-size:26px;font-weight:800;color:#fff;letter-spacing:2px}
.logo span{color:var(--o)}
.badge{background:rgba(255,255,255,.15);color:#fff;font-size:12px;font-weight:500;padding:4px 12px;border-radius:20px;border:1px solid rgba(255,255,255,.25)}
.hero{background:linear-gradient(135deg,var(--g) 0%,#0D3D24 100%);padding:52px 24px 44px;text-align:center;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;inset:0;opacity:.4;background:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")}
.hero-tag{display:inline-block;background:rgba(224,123,0,.2);border:1px solid rgba(224,123,0,.4);color:var(--o);font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;padding:5px 14px;border-radius:20px;margin-bottom:20px}
.hero h1{font-family:'Syne',sans-serif;font-size:clamp(26px,5vw,42px);font-weight:800;color:#fff;line-height:1.15;margin-bottom:14px}
.hero h1 em{font-style:normal;color:var(--o)}
.hero-sub{color:rgba(255,255,255,.75);font-size:15px;max-width:500px;margin:0 auto 24px;line-height:1.6}
.hero-chips{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:10px}
.chip{background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.20);color:#fff;font-size:12px;padding:5px 12px;border-radius:20px;display:flex;align-items:center;gap:5px}
.hero-cta{display:inline-block;margin-top:20px;background:var(--o);color:#fff;font-family:'Syne',sans-serif;font-size:16px;font-weight:700;padding:14px 32px;border-radius:12px;border:none;cursor:pointer;box-shadow:0 4px 16px rgba(224,123,0,.35);transition:all .2s}
.hero-cta:hover{background:#C96F00;transform:translateY(-1px)}
.confiance-band{background:var(--w);border-bottom:1px solid var(--bd);padding:18px 16px}
.confiance-inner{max-width:680px;margin:0 auto;display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.conf-item{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:500;color:var(--dk)}
.conf-check{width:22px;height:22px;border-radius:50%;background:var(--g);color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0}
.how-section{background:var(--lite);padding:32px 16px}
.how-inner{max-width:680px;margin:0 auto}
.how-title{font-family:'Syne',sans-serif;font-size:20px;font-weight:700;color:var(--dk);text-align:center;margin-bottom:24px}
.how-steps{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
.how-step{background:var(--w);border:1.5px solid var(--bd);border-radius:14px;padding:16px 14px;position:relative}
.how-num{width:36px;height:36px;border-radius:50%;background:var(--g);color:#fff;font-family:'Syne',sans-serif;font-weight:800;font-size:15px;display:flex;align-items:center;justify-content:center;margin-bottom:10px}
.how-step-title{font-size:13px;font-weight:700;color:var(--dk);margin-bottom:4px;line-height:1.3}
.how-step-desc{font-size:12px;color:var(--mid);line-height:1.4}
.positioning-band{background:var(--lg);border-top:1.5px solid var(--bd);border-bottom:1.5px solid var(--bd);padding:20px 16px;text-align:center}
.positioning-text{max-width:600px;margin:0 auto;font-size:14px;color:var(--dk);line-height:1.7;font-weight:500}
.price-band{background:var(--w);padding:20px 16px;border-bottom:1px solid var(--bd)}
.price-band-inner{max-width:680px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;background:var(--lo);border:1.5px solid rgba(224,123,0,.25);border-radius:14px;padding:16px 20px}
.price-band-left{font-size:14px;color:var(--dk);line-height:1.6}
.price-band-left strong{display:block;font-family:'Syne',sans-serif;font-size:18px;font-weight:800;color:var(--o);margin-bottom:2px}
.price-band-right{font-size:12px;color:var(--mid);text-align:right;max-width:160px;line-height:1.5}
.proof-bar{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);border-radius:10px;padding:10px 16px;margin-top:16px;display:inline-flex;align-items:center;gap:8px;font-size:12px;color:rgba(255,255,255,.8)}
.proof-dot{width:8px;height:8px;border-radius:50%;background:#4ADE80;flex-shrink:0;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.human-bar{background:var(--lo);border-left:4px solid var(--o);border-radius:10px;padding:14px 18px;margin:0 16px 0;max-width:648px;margin-left:auto;margin-right:auto;display:flex;align-items:flex-start;gap:12px;font-size:13px;color:var(--dk);line-height:1.6}
.human-icon{font-size:24px;flex-shrink:0;margin-top:2px}
.nodoes-section{background:var(--lr);border:1.5px solid rgba(192,57,43,.2);border-radius:14px;padding:18px 20px;margin:0 16px 16px;max-width:648px;margin-left:auto;margin-right:auto}
.nodoes-title{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:var(--r);margin-bottom:12px;display:flex;align-items:center;gap:6px}
.nodoes-item{display:flex;align-items:flex-start;gap:8px;font-size:13px;color:var(--dk);margin-bottom:8px;line-height:1.5}
.nodoes-item:last-child{margin-bottom:0}
.nodoes-x{color:var(--r);font-weight:700;flex-shrink:0;margin-top:1px}
.form-wrap{max-width:680px;margin:-20px auto 0;padding:0 16px 48px;position:relative;z-index:10}
.card{background:var(--w);border-radius:20px;box-shadow:var(--sh);overflow:hidden}
.card-header{background:var(--lg);border-bottom:1px solid var(--bd);padding:18px 24px;display:flex;align-items:center;gap:12px}
.card-hicon{width:40px;height:40px;background:var(--g);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
.card-header h2{font-family:'Syne',sans-serif;font-size:17px;font-weight:700;color:var(--g)}
.card-header p{font-size:12px;color:var(--mid);margin-top:2px}
.card-body{padding:24px}
.steps{display:flex;margin-bottom:24px;border-radius:10px;overflow:hidden;border:1px solid var(--bd)}
.step{flex:1;padding:9px 5px;text-align:center;font-size:10px;font-weight:500;color:var(--mid);background:var(--lite);border-right:1px solid var(--bd);display:flex;align-items:center;justify-content:center;gap:3px;line-height:1.3}
.step:last-child{border-right:none}
.step.active{background:var(--g);color:#fff;font-weight:700}
.step.done{background:var(--lg);color:var(--g)}
.field{margin-bottom:16px}
.field label{display:block;font-size:13px;font-weight:600;color:var(--mid);margin-bottom:5px;letter-spacing:.3px}
.field label span{color:var(--r)}
.field input,.field select,.field textarea{width:100%;padding:0 14px;border:1.5px solid var(--bd);border-radius:10px;font-size:15px;font-family:'DM Sans',sans-serif;color:var(--dk);background:var(--w);outline:none;transition:border-color .2s,box-shadow .2s;appearance:none}
.field input,.field select{height:48px}
.field textarea{height:80px;padding:12px 14px;resize:none}
.field input:focus,.field select:focus,.field textarea:focus{border-color:var(--g);box-shadow:0 0 0 3px rgba(26,92,56,.10)}
.field input::placeholder,.field textarea::placeholder{color:#9BAAA0}
.row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.pref-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px}
.pref-opt{border:1.5px solid var(--bd);border-radius:10px;padding:10px 8px;cursor:pointer;transition:all .2s;text-align:center;font-size:12px;font-weight:600;color:var(--mid)}
.pref-opt.sel{border-color:var(--g);background:var(--lg);color:var(--g)}
.urgent-toggle{display:flex;align-items:center;gap:12px;background:var(--lr);border:1.5px solid rgba(192,57,43,.25);border-radius:10px;padding:12px 14px;margin-bottom:16px;cursor:pointer;transition:all .2s}
.urgent-toggle.active{background:#FFF0F0;border-color:var(--r)}
.urgent-cb{width:20px;height:20px;border-radius:6px;border:2px solid var(--bd);flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all .2s}
.urgent-toggle.active .urgent-cb{background:var(--r);border-color:var(--r)}
.urgent-label{font-size:13px;font-weight:600;color:var(--dk)}
.urgent-sub{font-size:11px;color:var(--mid);margin-top:2px}
.price-box{background:var(--lg);border:1.5px solid var(--bd);border-radius:12px;padding:14px 16px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center}
.price-left{font-size:13px;color:var(--mid);line-height:1.7}
.price-right{text-align:right}
.price-total{font-family:'Syne',sans-serif;font-size:21px;font-weight:800;color:var(--g)}
.price-detail{font-size:11px;color:var(--mid)}
.notice{display:flex;align-items:flex-start;gap:8px;border-radius:10px;padding:11px 14px;margin-bottom:14px;font-size:13px;color:var(--dk);line-height:1.5}
.notice.blue{background:var(--lg);border:1px solid rgba(26,92,56,.2)}
.notice.orange{background:var(--lo);border:1px solid rgba(224,123,0,.2)}
.notice.red{background:var(--lr);border:1px solid rgba(192,57,43,.2)}
.notice-icon{flex-shrink:0;font-size:16px;margin-top:1px}
.payment-info{background:var(--lo);border:1.5px solid rgba(224,123,0,.3);border-radius:12px;padding:16px;margin-bottom:16px}
.payment-info-title{font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:var(--o);margin-bottom:8px;display:flex;align-items:center;gap:6px}
.payment-info-body{font-size:12px;color:var(--dk);line-height:1.8}
.payment-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:16px}
.pay-opt{border:2px solid var(--bd);border-radius:10px;padding:11px 12px;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:9px;font-size:13px;font-weight:500;color:var(--dk)}
.pay-opt.sel{border-color:var(--g);background:var(--lg);color:var(--g)}
.pay-dot{width:18px;height:18px;border-radius:50%;border:2px solid var(--bd);flex-shrink:0;display:flex;align-items:center;justify-content:center;position:relative;transition:all .2s}
.pay-opt.sel .pay-dot{border-color:var(--g);background:var(--g)}
.pay-dot::after{content:'';width:6px;height:6px;border-radius:50%;background:#fff;position:absolute;opacity:0;transition:opacity .2s}
.pay-opt.sel .pay-dot::after{opacity:1}
.btn{width:100%;height:52px;border:none;border-radius:12px;font-family:'Syne',sans-serif;font-size:15px;font-weight:700;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:8px}
.btn-g{background:var(--g);color:#fff;box-shadow:0 4px 16px rgba(26,92,56,.25)}
.btn-g:hover{background:var(--g2);transform:translateY(-1px);box-shadow:0 6px 20px rgba(26,92,56,.30)}
.btn-g:active{transform:translateY(0)}
.btn-g:disabled{opacity:.5;cursor:not-allowed;transform:none}
.btn-sec{background:transparent;color:var(--mid);border:1.5px solid var(--bd);margin-bottom:10px}
.btn-sec:hover{background:var(--lite)}
.btn-wa{background:var(--wa);color:#fff;box-shadow:0 4px 16px rgba(37,211,102,.30);height:58px;font-size:16px}
.btn-wa:hover{background:#1EB85A;transform:translateY(-1px)}
.wa-mandatory{font-size:12px;color:var(--r);font-weight:600;text-align:center;margin-top:8px;margin-bottom:16px;display:flex;align-items:center;justify-content:center;gap:5px}
.cta-final{max-width:680px;margin:0 auto 40px;padding:0 16px}
.cta-final-btn{width:100%;height:60px;background:var(--g);color:#fff;border:none;border-radius:14px;font-family:'Syne',sans-serif;font-size:17px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 6px 20px rgba(26,92,56,.30);transition:all .2s}
.cta-final-btn:hover{background:var(--g2);transform:translateY(-1px)}
.success-wrap{padding:32px 24px;text-align:center}
.success-icon{width:76px;height:76px;background:var(--lg);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:34px;margin:0 auto 18px;border:3px solid var(--g)}
.success-title{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;color:var(--g);margin-bottom:8px}
.success-sub{font-size:14px;color:var(--mid);line-height:1.7;margin-bottom:20px}
.demande-box{background:var(--dk);color:#fff;border-radius:12px;padding:18px;margin-bottom:18px}
.demande-label{font-size:11px;color:rgba(255,255,255,.5);letter-spacing:2px;text-transform:uppercase;margin-bottom:6px}
.demande-code{font-family:'Syne',sans-serif;font-size:18px;font-weight:800;color:var(--o);letter-spacing:2px;word-break:break-all}
.demande-hint{font-size:11px;color:rgba(255,255,255,.4);margin-top:5px}
.val-steps{background:var(--lg);border:1.5px solid var(--bd);border-radius:12px;padding:16px;margin-bottom:16px;text-align:left}
.val-title{font-size:13px;font-weight:700;color:var(--g);margin-bottom:12px;display:flex;align-items:center;gap:6px}
.val-step{display:flex;align-items:flex-start;gap:10px;margin-bottom:10px}
.val-step:last-child{margin-bottom:0}
.val-num{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0}
.vs-done{background:var(--g);color:#fff}
.vs-wait{background:rgba(26,92,56,.15);color:var(--g)}
.vs-next{background:rgba(224,123,0,.15);color:var(--o)}
.val-text{font-size:12px;color:var(--dk);line-height:1.5;padding-top:4px}
.val-text strong{display:block;font-weight:600;font-size:13px}
.val-text span{color:var(--mid);font-size:11px}
.lines-section{max-width:680px;margin:0 auto 40px;padding:0 16px}
.section-title{font-family:'Syne',sans-serif;font-size:18px;font-weight:700;color:var(--dk);margin-bottom:14px;display:flex;align-items:center;gap:8px}
.lines-grid{display:flex;flex-direction:column;gap:8px}
.line-card{background:var(--w);border:1.5px solid var(--bd);border-radius:14px;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;transition:all .2s;box-shadow:var(--sh2)}
.line-card:hover{border-color:var(--g);box-shadow:var(--sh);transform:translateY(-1px)}
.line-route{display:flex;align-items:center;gap:8px;font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:var(--dk)}
.line-arrow{color:var(--g);font-size:16px}
.line-meta{font-size:11px;color:var(--mid);margin-top:2px}
.line-price{font-family:'Syne',sans-serif;font-size:16px;font-weight:800;color:var(--g);text-align:right}
.line-price-sub{font-size:10px;color:var(--mid);font-family:'DM Sans',sans-serif;font-weight:400}
.err{background:var(--lr);border:1px solid #E8B4B0;color:var(--r);border-radius:8px;padding:10px 14px;font-size:13px;margin-bottom:14px}
.footer{background:var(--dk);padding:28px 24px;text-align:center;color:rgba(255,255,255,.5);font-size:13px}
.footer strong{color:#fff;font-family:'Syne',sans-serif}
@media(max-width:480px){
  .row{grid-template-columns:1fr}
  .payment-grid{grid-template-columns:1fr}
  .pref-grid{grid-template-columns:repeat(3,1fr)}
  .card-body{padding:18px}
  .how-steps{grid-template-columns:1fr}
  .confiance-inner{grid-template-columns:1fr}
  .hero{padding:36px 16px 32px}
  .step{font-size:9px;padding:7px 3px}
}
`;

export default function KoyaMVP() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    from:"",to:"",date:"",hour:"",seats:"1",
    name:"",phone:"",operator:"",besoin:"",pref:"",urgent:false
  });
  const [err, setErr] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [sendingSheet, setSendingSheet] = useState(false);

  const line  = LINES.find(l => l.from === form.from && l.to === form.to);
  const seats = parseInt(form.seats) || 1;
  const total = line ? (line.price + KOYA_FEES) * seats : 0;
  const today = new Date().toISOString().split("T")[0];

  function set(k, v) { setForm(f => ({...f, [k]: v})); setErr(""); }

  function validate() {
    if (step === 1) {
      if (!form.from)            return "Choisis une ville de départ.";
      if (!form.to)              return "Choisis une destination.";
      if (form.from === form.to) return "Départ et destination doivent être différents.";
      if (!line)                 return "Cette ligne n'est pas encore disponible. Contacte-nous sur WhatsApp.";
      if (!form.date)            return "Choisis une date de voyage.";
      if (!form.hour)            return "Choisis une heure souhaitée.";
    }
    if (step === 2) {
      if (!form.name.trim()) return "Entre ton nom complet.";
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
      setTimeout(() => { setCode(genCode()); setStep(4); setBusy(false); }, 1200);
    } else {
      setStep(s => s + 1);
    }
  }

  function reset() {
    setStep(1);
    setForm({from:"",to:"",date:"",hour:"",seats:"1",name:"",phone:"",operator:"",besoin:"",pref:"",urgent:false});
    setCode(""); setErr("");
  }

  function pickLine(l) {
    setForm(f => ({...f, from: l.from, to: l.to}));
    setTimeout(() => document.getElementById("form-anchor")?.scrollIntoView({behavior:"smooth"}), 80);
  }

  function scrollToForm() {
    document.getElementById("form-anchor")?.scrollIntoView({behavior:"smooth"});
  }

  async function handleWhatsAppSubmit() {
    if (sendingSheet) return;
  
    setSendingSheet(true);
  
    await saveToSheet(form, code, total);
  
    setSendingSheet(false);
  
    window.location.href = buildWA(form, code, total);
  }

  const STEP_LABELS = ["Trajet","Mes infos","Paiement","Demande"];

  return (
    <>
      <style>{css}</style>

      <nav className="nav">
        <div className="logo">KOYA<span>.</span></div>
        <div className="badge">🚌 Côte d'Ivoire</div>
      </nav>

      <div className="hero">
        <div className="hero-tag">🚌 Service de réservation</div>
        <h1>Réserve ta place<br/>sans te <em>déplacer</em></h1>
        <p className="hero-sub">
          On s'occupe de trouver ta place et de la sécuriser pour toi.
        </p>
        <div className="hero-chips">
          <div className="chip">✅ Place garantie</div>
          <div className="chip">✅ Départ confirmé</div>
          <div className="chip">✅ Compagnie sélectionnée pour toi</div>
          <div className="chip">✅ Assistance jusqu'au départ</div>
        </div>
        <button className="hero-cta" onClick={scrollToForm}>
          Réserver ma place
        </button>
        <div className="proof-bar" style={{marginTop:20}}>
          <div className="proof-dot"></div>
          Phase test · Premiers trajets suivis sur Abidjan ↔ Bouaké
        </div>
      </div>

      <div className="confiance-band">
        <div className="confiance-inner">
          {[
            "Place garantie",
            "Départ confirmé",
            "Compagnie fiable sélectionnée automatiquement",
            "Assistance KOYA jusqu'au départ",
          ].map((item, i) => (
            <div key={i} className="conf-item">
              <div className="conf-check">✓</div>
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="how-section">
        <div className="how-inner">
          <div className="how-title">Comment ça marche ?</div>
          <div className="how-steps">
            {[
              { n:"1", t:"Tu fais ta demande", d:"Remplis le formulaire en 2 minutes depuis ton téléphone" },
              { n:"2", t:"KOYA trouve et bloque ta place", d:"Un opérateur contacte une compagnie fiable et sécurise ta place" },
              { n:"3", t:"Tu paies une fois confirmé", d:"Zéro paiement avant confirmation — ton argent reste chez toi" },
              { n:"4", t:"Tu voyages sans stress", d:"Tu arrives en gare, ta place t'attend. C'est tout." },
            ].map((s, i) => (
              <div key={i} className="how-step">
                <div className="how-num">{s.n}</div>
                <div className="how-step-title">{s.t}</div>
                <div className="how-step-desc">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="positioning-band">
        <p className="positioning-text">
          Nous sélectionnons pour toi une compagnie fiable avec places disponibles.
          Le nom de la compagnie et les informations utiles du voyage te sont communiqués après confirmation.
        </p>
      </div>

      <div className="price-band">
        <div className="price-band-inner">
          <div className="price-band-left">
            <strong>Service de réservation : 1 000 FCFA / place</strong>
            Prix du ticket selon la destination
          </div>
          <div className="price-band-right">
            Tu paies uniquement une fois ta place confirmée.
          </div>
        </div>
      </div>

      <div style={{maxWidth:680,margin:"16px auto 0",padding:"0 16px"}}>
        <div className="human-bar">
          <div className="human-icon">👤</div>
          <div>
            <strong style={{display:"block",marginBottom:3}}>Une vraie personne suit ta demande</strong>
            Ta demande est traitée par un opérateur KOYA, pas automatiquement par une machine.
            C'est pourquoi KOYA peut sécuriser ta demande avant confirmation.
          </div>
        </div>
      </div>

      <div style={{maxWidth:680,margin:"12px auto 0",padding:"0 16px"}}>
        <div className="nodoes-section">
          <div className="nodoes-title">❌ Ce que KOYA ne fait pas</div>
          <div className="nodoes-item"><div className="nodoes-x">✗</div><div>KOYA ne prend pas ton argent avant confirmation de ta place</div></div>
          <div className="nodoes-item"><div className="nodoes-x">✗</div><div>KOYA ne promet pas une place sans preuve du vendeur</div></div>
          <div className="nodoes-item"><div className="nodoes-x">✗</div><div>KOYA ne remplace pas la compagnie — KOYA sécurise ta réservation</div></div>
        </div>
      </div>

      <div className="form-wrap" id="form-anchor">
        <div className="card">
          <div className="card-header">
            <div className="card-hicon">📋</div>
            <div>
              <h2>Envoyer ma demande de réservation</h2>
              <p>Opérateur KOYA disponible · Réponse rapide pendant les horaires d'ouverture</p>
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

            {step === 1 && (
              <>
                <div className="notice blue">
                  <span className="notice-icon">ℹ️</span>
                  <div>Tu envoies une <strong>demande</strong>. KOYA sélectionne une compagnie fiable et vérifie la disponibilité. Si confirmée — ta place est garantie ou remboursée.</div>
                </div>

                <div className={`urgent-toggle ${form.urgent?"active":""}`} onClick={() => set("urgent", !form.urgent)}>
                  <div className="urgent-cb">{form.urgent && <span style={{color:"#fff",fontSize:13,fontWeight:800}}>✓</span>}</div>
                  <div>
                    <div className="urgent-label">🚨 Je voyage aujourd'hui</div>
                    <div className="urgent-sub">Ta demande sera marquée URGENTE · Sous réserve de disponibilité immédiate.</div>
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
                    <div className="price-left">🚌 {line.from} → {line.to}<br/>⏱ {line.duration}</div>
                    <div className="price-right">
                      <div style={{fontSize:11,color:"var(--mid)"}}>Prix indicatif</div>
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

                <div className="field">
                  <label>Préférence <span style={{fontWeight:400,color:"var(--mid)"}}>(optionnel)</span></label>
                  <div className="pref-grid">
                    {PREFS.map(p => (
                      <div key={p} className={`pref-opt ${form.pref===p?"sel":""}`} onClick={() => set("pref", form.pref===p?"":p)}>
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
                  <label>Nom complet <span>*</span></label>
                  <input placeholder="Ex : Koné Aminata" value={form.name} onChange={e => set("name", e.target.value)} />
                </div>

                <div className="field">
                  <label>Numéro WhatsApp <span style={{fontWeight:400,color:"var(--mid)"}}>(facultatif)</span></label>
                  <input placeholder="+225 07 00 00 00 00" value={form.phone} onChange={e => set("phone", e.target.value)} />
                </div>

                <div className="field">
                  <label>Besoin particulier <span style={{fontWeight:400,color:"var(--mid)"}}>(facultatif)</span></label>
                  <textarea placeholder="Ex : bagages volumineux, voyage avec enfant, personne âgée..." value={form.besoin} onChange={e => set("besoin", e.target.value)} />
                </div>

                {line && (
                  <div className="price-box">
                    <div className="price-left">
                      🚌 {form.from} → {form.to}<br/>
                      📅 {form.date} · {form.hour}<br/>
                      💺 {form.seats} place{seats>1?"s":""}
                      {form.urgent && <><br/><span style={{color:"var(--r)",fontWeight:700}}>⚠️ URGENT</span></>}
                    </div>
                    <div className="price-right">
                      <div style={{fontSize:11,color:"var(--mid)"}}>Montant estimé</div>
                      <div className="price-total">{total.toLocaleString()} FCFA</div>
                      <div className="price-detail">payable après confirmation</div>
                    </div>
                  </div>
                )}

                <div className="notice orange">
                  <span className="notice-icon">💳</span>
                  <div>Le paiement se fait <strong>uniquement après confirmation</strong> par KOYA sur WhatsApp. Tu ne paies rien maintenant.</div>
                </div>

                <button className="btn btn-sec" onClick={() => { setStep(1); setErr(""); }}>← Retour</button>
                <button className="btn btn-g" onClick={next}>Continuer →</button>
              </>
            )}

            {step === 3 && (
              <>
                <div className="payment-info">
                  <div className="payment-info-title">💳 Comment fonctionne le paiement KOYA</div>
                  <div className="payment-info-body">
                    1. Tu prépares ta demande maintenant<br/>
                    2. Tu l'envoies sur WhatsApp KOYA<br/>
                    3. KOYA sélectionne une compagnie fiable et vérifie la place<br/>
                    4. Tu reçois la <strong>confirmation WhatsApp</strong> rapidement<br/>
                    5. <strong>Seulement après confirmation</strong> → tu envoies le paiement<br/>
                    6. Tu reçois ton code de voyage définitif
                  </div>
                </div>

                <p style={{fontSize:13,fontWeight:600,color:"var(--mid)",marginBottom:8}}>
                  Ton opérateur Mobile Money préféré <span style={{color:"var(--r)"}}>*</span>
                </p>

                <div className="payment-grid">
                  {OPERATORS.map(op => (
                    <div key={op} className={`pay-opt ${form.operator===op?"sel":""}`} onClick={() => set("operator", op)}>
                      <div className="pay-dot"></div>{op}
                    </div>
                  ))}
                </div>

                {line && (
                  <div className="price-box">
                    <div className="price-left">
                      <strong>{form.name}</strong><br/>
                      {form.from} → {form.to} · {form.seats} place{seats>1?"s":""}<br/>
                      {form.date} à {form.hour}
                      {form.urgent && <><br/><span style={{color:"var(--r)",fontWeight:700,fontSize:12}}>⚠️ URGENT</span></>}
                    </div>
                    <div className="price-right">
                      <div style={{fontSize:11,color:"var(--mid)"}}>Montant estimé</div>
                      <div className="price-total">{total.toLocaleString()} FCFA</div>
                      <div className="price-detail">payable après confirmation</div>
                    </div>
                  </div>
                )}

                <button className="btn btn-sec" onClick={() => { setStep(2); setErr(""); }}>← Retour</button>
                <button className="btn btn-g" onClick={next} disabled={busy}>
                  {busy ? "⏳ Préparation..." : "📤 Préparer ma demande WhatsApp"}
                </button>
              </>
            )}

            {step === 4 && (
              <div className="success-wrap">
                <div className="success-icon">📨</div>
                <div className="success-title">Demande préparée !</div>
                <p className="success-sub">
                  Ta demande est prête, <strong>{form.name}</strong>.<br/>
                  Clique sur WhatsApp pour l'envoyer à KOYA.<br/>
                  Un opérateur te répond rapidement <strong>pendant les horaires d'ouverture</strong>.
                </p>

                <div className="demande-box">
                  <div className="demande-label">Numéro de ta demande</div>
                  <div className="demande-code">{code}</div>
                  <div className="demande-hint">Garde ce numéro pour suivre ta demande</div>
                </div>

                <div className="val-steps">
                  <div className="val-title">⏳ Ce qui va se passer</div>
                  <div className="val-step"><div className="val-num vs-done">✓</div><div className="val-text"><strong>Demande préparée</strong><span>{code}</span></div></div>
                  <div className="val-step"><div className="val-num vs-wait">→</div><div className="val-text"><strong>Tu envoies sur WhatsApp</strong><span>Clique le bouton ci-dessous — étape obligatoire</span></div></div>
                  <div className="val-step"><div className="val-num vs-wait">⏳</div><div className="val-text"><strong>KOYA sélectionne une compagnie et vérifie ta place</strong><span>Preuve de disponibilité obligatoire avant confirmation</span></div></div>
                  <div className="val-step"><div className="val-num vs-next">→</div><div className="val-text"><strong>Confirmation + paiement sur WhatsApp</strong><span>Tu paies seulement après confirmation réelle</span></div></div>
                </div>

                <div className="notice orange" style={{marginBottom:14}}>
                  <span className="notice-icon">ℹ️</span>
                  <div>Si ta place est <strong>confirmée par KOYA</strong>, elle est garantie ou remboursée. Zéro paiement avant cette étape.</div>
                </div>

                <button className="btn btn-wa" onClick={handleWhatsAppSubmit} disabled={sendingSheet}>
                  <span>💬</span> {sendingSheet ? "Enregistrement..." : "Envoyer ma demande sur WhatsApp maintenant"}
                </button>

                <div className="wa-mandatory">
                  ⚠️ Sans envoi WhatsApp, KOYA ne reçoit pas ta demande.
                </div>

                <button className="btn btn-sec" onClick={reset}>+ Nouvelle demande</button>
              </div>
            )}
          </div>
        </div>
      </div>

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
                <div className="line-price-sub">+ {KOYA_FEES.toLocaleString()} FCFA service KOYA</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="cta-final">
        <button className="cta-final-btn" onClick={scrollToForm}>
          🚌 Réserver ma place maintenant
        </button>
      </div>

      <footer className="footer">
        <div style={{marginBottom:6}}><strong>KOYA</strong> · Ton car. Ta place.</div>
        <div>© 2026 KOYA — Côte d'Ivoire</div>
        <div style={{marginTop:6,fontSize:11,color:"rgba(255,255,255,.35)"}}>
          Le paiement intervient uniquement après confirmation de disponibilité par KOYA.
        </div>
      </footer>
    </>
  );
}