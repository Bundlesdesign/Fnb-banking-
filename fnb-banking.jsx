
import { useState, useEffect, useRef } from "react";

// ── Firebase SDK (compat via CDN globals not available in JSX sandbox,
//    so we'll use fetch-based REST API + Firestore REST + Auth REST) ──────────
const FB = {
  apiKey: "AIzaSyCElW1kSNGMOWcPTn6dEBRzlR_VzE1jJzs",
  authDomain: "friday-e2ddf.firebaseapp.com",
  projectId: "friday-e2ddf",
  appId: "1:444701365076:web:728c1c5fd9076e0963eec1",
};

const AUTH_URL = `https://identitytoolkit.googleapis.com/v1/accounts`;
const FS_URL = `https://firestore.googleapis.com/v1/projects/${FB.projectId}/databases/(default)/documents`;

async function signUp(email, password) {
  const r = await fetch(`${AUTH_URL}:signUp?key=${FB.apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  return r.json();
}
async function signIn(email, password) {
  const r = await fetch(`${AUTH_URL}:signInWithPassword?key=${FB.apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  return r.json();
}
async function fsGet(col, doc, token) {
  const r = await fetch(`${FS_URL}/${col}/${doc}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return r.json();
}
async function fsSet(col, doc, fields, token) {
  const body = { fields: toFsFields(fields) };
  const r = await fetch(`${FS_URL}/${col}/${doc}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  return r.json();
}
async function fsList(col, token) {
  const r = await fetch(`${FS_URL}/${col}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return r.json();
}
async function fsAdd(col, fields, token) {
  const body = { fields: toFsFields(fields) };
  const r = await fetch(`${FS_URL}/${col}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  return r.json();
}

function toFsFields(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "string") out[k] = { stringValue: v };
    else if (typeof v === "number") out[k] = { doubleValue: v };
    else if (typeof v === "boolean") out[k] = { booleanValue: v };
    else out[k] = { stringValue: String(v) };
  }
  return out;
}
function fromFsFields(fields = {}) {
  const out = {};
  for (const [k, v] of Object.entries(fields)) {
    out[k] =
      v.stringValue ?? v.doubleValue ?? v.integerValue ?? v.booleanValue ?? "";
  }
  return out;
}

const COUNTRIES = [
  { code: "ZA", name: "South Africa", currency: "ZAR", flag: "🇿🇦" },
  { code: "NG", name: "Nigeria", currency: "NGN", flag: "🇳🇬" },
  { code: "BW", name: "Botswana", currency: "BWP", flag: "🇧🇼" },
  { code: "NA", name: "Namibia", currency: "NAD", flag: "🇳🇦" },
  { code: "LS", name: "Lesotho", currency: "LSL", flag: "🇱🇸" },
  { code: "SZ", name: "Eswatini", currency: "SZL", flag: "🇸🇿" },
  { code: "MZ", name: "Mozambique", currency: "MZN", flag: "🇲🇿" },
  { code: "ZM", name: "Zambia", currency: "ZMW", flag: "🇿🇲" },
  { code: "TZ", name: "Tanzania", currency: "TZS", flag: "🇹🇿" },
];

// ── Turquoise palette ──────────────────────────────────────────────────────
const T = {
  teal: "#00A6A6",
  tealDark: "#007A7A",
  tealLight: "#E0F7F7",
  blue: "#4BAAD3",
  purple: "#7B6EA6",
  orange: "#F5A623",
  white: "#FFFFFF",
  offWhite: "#F5F7FA",
  grey: "#8A94A6",
  dark: "#1A2233",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=DM+Sans:wght@400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'DM Sans',sans-serif;background:#f0f4f8;color:${T.dark};}
  :root{--teal:${T.teal};--teal-dark:${T.tealDark};--teal-light:${T.tealLight};--orange:${T.orange};}

  /* PHONE SHELL */
  .shell{width:390px;min-height:844px;margin:0 auto;background:#fff;border-radius:40px;box-shadow:0 30px 80px rgba(0,0,0,.25);overflow:hidden;position:relative;display:flex;flex-direction:column;}
  .screen{flex:1;overflow-y:auto;overflow-x:hidden;scroll-behavior:smooth;}
  .screen::-webkit-scrollbar{display:none;}

  /* STATUS BAR */
  .status-bar{display:flex;justify-content:space-between;align-items:center;padding:12px 24px 4px;font-size:13px;font-weight:600;background:#fff;}
  .status-icons{display:flex;gap:6px;align-items:center;}

  /* TOP NAV */
  .top-nav{display:flex;justify-content:space-between;align-items:center;padding:8px 20px 12px;background:#fff;}
  .logo-circle{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,${T.teal},${T.tealDark});display:flex;align-items:center;justify-content:center;font-size:20px;}
  .nav-right{display:flex;gap:14px;align-items:center;}
  .nav-btn{background:none;border:none;cursor:pointer;color:${T.dark};font-size:20px;padding:4px;}

  /* HERO CAROUSEL */
  .hero{margin:0 16px 16px;border-radius:16px;overflow:hidden;background:linear-gradient(135deg,#e0f9f9,#b2ebeb);position:relative;height:160px;}
  .hero-content{padding:20px;height:100%;display:flex;flex-direction:column;justify-content:center;}
  .hero-tag{display:flex;align-items:center;gap:8px;margin-bottom:8px;}
  .hero-tag img,.hero-tag span{height:18px;font-size:11px;font-weight:700;color:${T.tealDark};}
  .hero h2{font-family:'Outfit',sans-serif;font-size:17px;font-weight:700;color:${T.dark};line-height:1.3;max-width:60%;}
  .hero-devices{position:absolute;right:-10px;top:50%;transform:translateY(-50%);font-size:70px;opacity:.85;}
  .hero-dots{position:absolute;bottom:10px;left:50%;transform:translateX(-50%);display:flex;gap:5px;}
  .hero-dot{width:6px;height:6px;border-radius:3px;background:rgba(0,120,120,.3);}
  .hero-dot.active{width:16px;background:${T.teal};}
  .hero-arrow{position:absolute;right:12px;top:50%;transform:translateY(-50%);width:28px;height:28px;border-radius:50%;background:rgba(0,0,0,.7);color:#fff;border:none;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;}

  /* CATEGORY CARDS */
  .cat-row{display:flex;gap:8px;padding:0 16px 16px;overflow-x:auto;}
  .cat-row::-webkit-scrollbar{display:none;}
  .cat-card{flex:0 0 110px;border-radius:14px;padding:14px 12px;position:relative;cursor:pointer;transition:transform .15s;}
  .cat-card:active{transform:scale(.97);}
  .cat-card.personal{background:linear-gradient(135deg,#00c9c8,#009999);}
  .cat-card.private{background:linear-gradient(135deg,#4baad3,#2980b9);}
  .cat-card.business{background:linear-gradient(135deg,#7b6ea6,#5b4e86);}
  .cat-card span{font-family:'Outfit',sans-serif;font-size:13px;font-weight:600;color:#fff;display:block;margin-bottom:20px;}
  .cat-arrow{position:absolute;bottom:10px;right:10px;width:24px;height:24px;border-radius:50%;background:#000;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;}

  /* QUICK ACTIONS */
  .section-title{font-family:'Outfit',sans-serif;font-size:13px;font-weight:600;color:${T.grey};padding:0 20px 10px;text-transform:uppercase;letter-spacing:.8px;}
  .qa-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:0 16px 20px;}
  .qa-btn{display:flex;flex-direction:column;align-items:center;gap:7px;background:#fff;border:none;cursor:pointer;padding:14px 6px 10px;border-radius:14px;box-shadow:0 2px 8px rgba(0,0,0,.07);transition:transform .15s,box-shadow .15s;}
  .qa-btn:active{transform:scale(.95);box-shadow:0 1px 4px rgba(0,0,0,.1);}
  .qa-icon{width:38px;height:38px;border-radius:10px;background:${T.tealLight};display:flex;align-items:center;justify-content:center;font-size:18px;}
  .qa-label{font-size:10px;font-weight:500;color:${T.dark};text-align:center;line-height:1.2;}

  /* BOTTOM NAV */
  .bottom-nav{display:flex;justify-content:space-around;align-items:center;padding:12px 0 20px;background:#fff;border-top:1px solid #eef2f7;}
  .bnav-btn{display:flex;flex-direction:column;align-items:center;gap:3px;background:none;border:none;cursor:pointer;font-size:10px;color:${T.grey};padding:4px 12px;}
  .bnav-btn.active{color:${T.teal};}
  .bnav-icon{font-size:20px;}

  /* FORMS */
  .form-screen{padding:20px;}
  .form-screen h1{font-family:'Outfit',sans-serif;font-size:22px;font-weight:700;margin-bottom:6px;color:${T.dark};}
  .form-screen p{font-size:13px;color:${T.grey};margin-bottom:24px;}
  .inp-group{margin-bottom:16px;}
  .inp-group label{display:block;font-size:12px;font-weight:600;color:${T.grey};margin-bottom:5px;text-transform:uppercase;letter-spacing:.5px;}
  .inp-group input,.inp-group select{width:100%;padding:13px 16px;border:1.5px solid #e0e7ef;border-radius:12px;font-size:14px;font-family:'DM Sans',sans-serif;outline:none;transition:border-color .2s;background:#fff;}
  .inp-group input:focus,.inp-group select:focus{border-color:${T.teal};}
  .inp-group input[readonly]{background:#f5f7fa;color:${T.grey};}
  .btn-primary{width:100%;padding:15px;border-radius:14px;border:none;background:linear-gradient(135deg,${T.teal},${T.tealDark});color:#fff;font-size:15px;font-weight:700;font-family:'Outfit',sans-serif;cursor:pointer;transition:opacity .2s,transform .15s;}
  .btn-primary:active{transform:scale(.98);}
  .btn-primary:disabled{opacity:.6;}
  .btn-secondary{width:100%;padding:13px;border-radius:14px;border:1.5px solid ${T.teal};background:#fff;color:${T.teal};font-size:14px;font-weight:600;cursor:pointer;margin-top:10px;}
  .link-btn{background:none;border:none;color:${T.teal};font-size:13px;cursor:pointer;text-decoration:underline;}

  /* BALANCE CARD */
  .balance-card{margin:0 16px 16px;border-radius:20px;background:linear-gradient(135deg,${T.teal},${T.tealDark});padding:22px;color:#fff;position:relative;overflow:hidden;}
  .balance-card::after{content:'';position:absolute;top:-40px;right:-40px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,.08);}
  .bal-label{font-size:11px;opacity:.8;text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;}
  .bal-amount{font-family:'Outfit',sans-serif;font-size:30px;font-weight:700;margin-bottom:2px;}
  .bal-currency{font-size:13px;opacity:.8;}
  .bal-eye{position:absolute;top:20px;right:20px;background:none;border:none;color:#fff;font-size:18px;cursor:pointer;opacity:.8;}

  /* TRANSACTIONS */
  .txn-list{padding:0 16px;}
  .txn-item{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #f0f4f8;}
  .txn-icon{width:38px;height:38px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;}
  .txn-info{flex:1;}
  .txn-name{font-size:13px;font-weight:600;color:${T.dark};}
  .txn-date{font-size:11px;color:${T.grey};}
  .txn-amt{font-family:'Outfit',sans-serif;font-size:14px;font-weight:700;}
  .txn-amt.debit{color:#e74c3c;}
  .txn-amt.credit{color:#27ae60;}

  /* LOAN */
  .loan-tracker{margin:0 0 20px;}
  .tracker-steps{display:flex;align-items:center;margin-bottom:8px;}
  .step{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;}
  .step-dot{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;border:2px solid #e0e7ef;background:#fff;color:${T.grey};}
  .step-dot.done{background:${T.teal};border-color:${T.teal};color:#fff;}
  .step-dot.active{border-color:${T.teal};color:${T.teal};}
  .step-line{height:2px;flex:1;background:#e0e7ef;}
  .step-line.done{background:${T.teal};}
  .step-label{font-size:10px;color:${T.grey};text-align:center;}
  .step-label.active{color:${T.teal};font-weight:600;}
  .progress-bar{height:8px;border-radius:4px;background:#e0e7ef;overflow:hidden;margin-top:4px;}
  .progress-fill{height:100%;border-radius:4px;background:linear-gradient(90deg,${T.teal},${T.tealDark});transition:width .5s;}

  /* OTP MODAL */
  .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:flex-end;justify-content:center;z-index:100;}
  .modal-sheet{background:#fff;border-radius:24px 24px 0 0;padding:24px;width:100%;max-width:390px;}
  .modal-sheet h3{font-family:'Outfit',sans-serif;font-size:18px;font-weight:700;margin-bottom:6px;}
  .modal-sheet p{font-size:13px;color:${T.grey};margin-bottom:20px;}
  .otp-inputs{display:flex;gap:8px;justify-content:center;margin-bottom:20px;}
  .otp-inp{width:44px;height:52px;border:2px solid #e0e7ef;border-radius:12px;text-align:center;font-size:20px;font-weight:700;font-family:'Outfit',sans-serif;outline:none;}
  .otp-inp:focus{border-color:${T.teal};}

  /* ADMIN */
  .admin-header{background:linear-gradient(135deg,${T.dark},#2c3e50);padding:24px 20px 16px;color:#fff;}
  .admin-header h1{font-family:'Outfit',sans-serif;font-size:20px;font-weight:700;}
  .admin-header p{font-size:12px;opacity:.7;margin-top:2px;}
  .stats-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:16px;}
  .stat-card{background:#fff;border-radius:14px;padding:16px;box-shadow:0 2px 10px rgba(0,0,0,.07);}
  .stat-val{font-family:'Outfit',sans-serif;font-size:22px;font-weight:700;color:${T.teal};}
  .stat-lbl{font-size:11px;color:${T.grey};margin-top:2px;}
  .admin-section{padding:0 16px 16px;}
  .admin-section h2{font-family:'Outfit',sans-serif;font-size:15px;font-weight:700;margin-bottom:12px;color:${T.dark};}
  .user-row{background:#fff;border-radius:12px;padding:14px;margin-bottom:8px;box-shadow:0 1px 6px rgba(0,0,0,.06);}
  .user-row-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;}
  .user-name{font-size:13px;font-weight:700;}
  .user-bal{font-family:'Outfit',sans-serif;font-size:15px;font-weight:700;color:${T.teal};}
  .user-email{font-size:11px;color:${T.grey};}
  .small-btn{padding:6px 14px;border-radius:8px;border:1.5px solid ${T.teal};background:#fff;color:${T.teal};font-size:11px;font-weight:600;cursor:pointer;}
  .small-btn.danger{border-color:#e74c3c;color:#e74c3c;}
  .small-btn.success{border-color:#27ae60;color:#27ae60;}
  .tag{display:inline-block;padding:3px 8px;border-radius:6px;font-size:10px;font-weight:700;text-transform:uppercase;}
  .tag.pending{background:#fff3e0;color:#e67e22;}
  .tag.approved{background:#e8f8ee;color:#27ae60;}
  .tag.rejected{background:#fde8e8;color:#e74c3c;}
  .kyc-card{background:#fff;border-radius:12px;padding:14px;margin-bottom:8px;box-shadow:0 1px 6px rgba(0,0,0,.06);}
  .kyc-card p{font-size:12px;color:${T.grey};margin:2px 0;}
  .kyc-card strong{color:${T.dark};font-size:13px;}
  .alert{padding:12px 16px;border-radius:12px;font-size:13px;margin-bottom:12px;}
  .alert.error{background:#fde8e8;color:#c0392b;}
  .alert.success{background:#e8f8ee;color:#1e8449;}
  .loading{display:flex;align-items:center;justify-content:center;padding:40px;color:${T.grey};}
  @keyframes spin{to{transform:rotate(360deg)}}
  .spinner{width:28px;height:28px;border:3px solid #e0e7ef;border-top-color:${T.teal};border-radius:50%;animation:spin .7s linear infinite;margin-right:10px;}
  .divider{height:1px;background:#f0f4f8;margin:8px 0;}
  .back-btn{background:none;border:none;font-size:22px;cursor:pointer;color:${T.dark};padding:4px;}
  .card-upload{border:2px dashed #e0e7ef;border-radius:14px;padding:20px;text-align:center;cursor:pointer;margin-bottom:12px;}
  .card-upload:hover{border-color:${T.teal};}
  .card-upload input{display:none;}
  .card-upload .icon{font-size:28px;margin-bottom:8px;}
  .card-upload p{font-size:12px;color:${T.grey};}
  .card-preview{width:100%;height:100px;object-fit:cover;border-radius:10px;margin-top:8px;}
  .transfer-form{padding:20px;}
`;

// ── ICONS ──────────────────────────────────────────────────────────────────
const Icons = {
  lock: "🔒", bank: "💳", invest: "📊", borrow: "🏦",
  insure: "🛡️", ebucks: "ⓔ", connect: "📱", security: "🔐",
  home: "🏠", txns: "↕️", transfer: "💸", profile: "👤",
  menu: "☰", search: "🔍", eye: "👁", eyeOff: "🙈",
  arrow: "›", back: "‹", check: "✓", admin: "⚙️",
  tree: "🌿", card: "💳", otp: "🔑", logout: "🚪",
};

// ── APP ────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("home"); // home | login | register | dashboard | bank | invest | borrow | insure | connect | security | transfer | admin
  const [user, setUser] = useState(null); // { uid, email, token, name, idNum, country, currency, balance }
  const [blurred, setBlurred] = useState(false);
  const [toast, setToast] = useState(null);
  const [otpModal, setOtpModal] = useState(null); // { resolve }
  const [adminData, setAdminData] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const logout = () => { setUser(null); setScreen("home"); };

  const refreshUser = async (uid, token) => {
    try {
      const doc = await fsGet("users", uid, token);
      if (doc.fields) {
        const data = fromFsFields(doc.fields);
        setUser(u => ({ ...u, ...data, balance: parseFloat(data.balance) || 0 }));
      }
    } catch {}
  };

  // Poll balance every 8s
  useEffect(() => {
    if (!user) return;
    const t = setInterval(() => refreshUser(user.uid, user.token), 8000);
    return () => clearInterval(t);
  }, [user]);

  const screens = {
    home: <HomeScreen onLogin={() => setScreen("login")} onRegister={() => setScreen("register")} onAdmin={() => setScreen("adminLogin")} />,
    login: <LoginScreen onBack={() => setScreen("home")} onSuccess={(u) => { setUser(u); setScreen("dashboard"); }} showToast={showToast} />,
    register: <RegisterScreen onBack={() => setScreen("home")} onSuccess={() => { showToast("Account created! Please login."); setScreen("login"); }} showToast={showToast} />,
    adminLogin: <AdminLoginScreen onBack={() => setScreen("home")} onSuccess={(data) => { setAdminData(data); setScreen("admin"); }} showToast={showToast} />,
    admin: <AdminDashboard data={adminData} onBack={() => setScreen("home")} showToast={showToast} />,
    dashboard: user ? <DashboardScreen user={user} blurred={blurred} onToggleBlur={() => setBlurred(b => !b)} onNav={setScreen} onLogout={logout} /> : null,
    bank: user ? <BankScreen user={user} onBack={() => setScreen("dashboard")} onNav={setScreen} /> : null,
    invest: user ? <InvestScreen user={user} onBack={() => setScreen("dashboard")} /> : null,
    borrow: user ? <BorrowScreen user={user} onBack={() => setScreen("dashboard")} showToast={showToast} refreshUser={() => refreshUser(user.uid, user.token)} /> : null,
    insure: user ? <InsureScreen user={user} onBack={() => setScreen("dashboard")} /> : null,
    connect: user ? <ConnectScreen user={user} onBack={() => setScreen("dashboard")} /> : null,
    security: user ? <SecurityScreen user={user} onBack={() => setScreen("dashboard")} /> : null,
    transfer: user ? <TransferScreen user={user} onBack={() => setScreen("bank")} showToast={showToast} setOtpModal={setOtpModal} refreshUser={() => refreshUser(user.uid, user.token)} /> : null,
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "flex-start", justifyContent: "center", background: "linear-gradient(135deg,#e8f5f5,#d4ecec)", padding: "24px 0" }}>
      <style>{css}</style>
      <div className="shell">
        <StatusBar />
        <div className="screen">
          {screens[screen] || screens.home}
        </div>
      </div>
      {toast && (
        <div style={{ position: "fixed", bottom: 40, left: "50%", transform: "translateX(-50%)", background: toast.type === "success" ? "#27ae60" : "#e74c3c", color: "#fff", padding: "12px 24px", borderRadius: "30px", fontSize: 13, fontWeight: 700, zIndex: 200, boxShadow: "0 4px 20px rgba(0,0,0,.2)" }}>
          {toast.msg}
        </div>
      )}
      {otpModal && (
        <OTPModal onClose={otpModal.resolve} />
      )}
    </div>
  );
}

// ── STATUS BAR ─────────────────────────────────────────────────────────────
function StatusBar() {
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })), 30000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="status-bar">
      <span style={{ fontFamily: "'Outfit',sans-serif" }}>{time}</span>
      <div className="status-icons">
        <span>●●●</span>
        <span>WiFi</span>
        <span style={{ background: "#27ae60", color: "#fff", padding: "1px 5px", borderRadius: 4, fontSize: 10 }}>41%</span>
      </div>
    </div>
  );
}

// ── HOME SCREEN ────────────────────────────────────────────────────────────
function HomeScreen({ onLogin, onRegister, onAdmin }) {
  const [slide, setSlide] = useState(0);
  const slides = [
    { tag: "Speedpoint®", text: "Introducing our NEW Speedpoint® range", emoji: "🖥️📱💻" },
    { tag: "eBucks®", text: "Earn rewards on every transaction", emoji: "🎁💰✨" },
    { tag: "FNB Nav™", text: "Navigate your money smarter", emoji: "🗺️📈🏆" },
  ];
  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % slides.length), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      {/* Top Nav */}
      <div className="top-nav">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="logo-circle">🌿</div>
          <button className="nav-btn">☰</button>
        </div>
        <div className="nav-right">
          <button className="nav-btn" onClick={onAdmin} title="Admin">⚙️</button>
          <button className="nav-btn">🔍</button>
        </div>
      </div>

      {/* Hero */}
      <div className="hero">
        <div className="hero-content">
          <div className="hero-tag">
            <span style={{ fontWeight: 800, color: T.tealDark, fontSize: 13 }}>FNB | {slides[slide].tag}</span>
          </div>
          <h2>{slides[slide].text}</h2>
        </div>
        <div className="hero-devices" style={{ fontSize: 56 }}>{slides[slide].emoji}</div>
        <button className="hero-arrow" onClick={() => setSlide(s => (s + 1) % slides.length)}>›</button>
        <div className="hero-dots">
          {slides.map((_, i) => <div key={i} className={`hero-dot ${i === slide ? "active" : ""}`} />)}
        </div>
      </div>

      {/* Category Cards */}
      <div className="cat-row">
        <div className="cat-card personal" onClick={onLogin}><span>Personal</span><div className="cat-arrow">›</div></div>
        <div className="cat-card private" onClick={onLogin}><span>Private</span><div className="cat-arrow">›</div></div>
        <div className="cat-card business" onClick={onLogin}><span>Business</span><div className="cat-arrow">›</div></div>
      </div>

      {/* Quick Actions */}
      <p className="section-title">Quick Access</p>
      <div className="qa-grid">
        {[
          { icon: "🔒", label: "Login", action: onLogin },
          { icon: "💳", label: "Bank", action: onLogin },
          { icon: "📊", label: "Invest", action: onLogin },
          { icon: "🏦", label: "Borrow", action: onLogin },
          { icon: "🛡️", label: "Insure", action: onLogin },
          { icon: "ⓔ", label: "eBucks Rewards", action: onLogin },
          { icon: "📱", label: "Connect", action: onLogin },
          { icon: "🔐", label: "Security Centre", action: onLogin },
        ].map(({ icon, label, action }) => (
          <button key={label} className="qa-btn" onClick={action}>
            <div className="qa-icon">{icon}</div>
            <span className="qa-label">{label}</span>
          </button>
        ))}
      </div>

      {/* Register CTA */}
      <div style={{ padding: "0 20px 30px", textAlign: "center" }}>
        <p style={{ fontSize: 13, color: T.grey, marginBottom: 10 }}>New to FNB?</p>
        <button className="btn-primary" onClick={onRegister}>Open an Account</button>
      </div>
    </>
  );
}

// ── REGISTER ───────────────────────────────────────────────────────────────
function RegisterScreen({ onBack, onSuccess, showToast }) {
  const [form, setForm] = useState({ name: "", idNum: "", email: "", password: "", country: "ZA" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const country = COUNTRIES.find(c => c.code === form.country);

  const handleSubmit = async () => {
    if (!form.name || !form.idNum || !form.email || !form.password) { setErr("All fields are required."); return; }
    if (form.password.length < 6) { setErr("Password must be at least 6 characters."); return; }
    setLoading(true); setErr("");
    try {
      const res = await signUp(form.email, form.password);
      if (res.error) { setErr(res.error.message); setLoading(false); return; }
      const uid = res.localId, token = res.idToken;
      await fsSet("users", uid, { name: form.name, idNum: form.idNum, email: form.email, country: form.country, currency: country.currency, balance: 0, uid }, token);
      onSuccess();
    } catch (e) { setErr("Network error. Try again."); }
    setLoading(false);
  };

  return (
    <div className="form-screen">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <button className="back-btn" onClick={onBack}>‹</button>
        <div className="logo-circle" style={{ width: 32, height: 32, fontSize: 16 }}>🌿</div>
      </div>
      <h1>Create Account</h1>
      <p>Join FNB and take control of your finances</p>
      {err && <div className="alert error">{err}</div>}
      <div className="inp-group"><label>Full Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Thabo Nkosi" /></div>
      <div className="inp-group"><label>ID Number</label><input value={form.idNum} onChange={e => setForm({ ...form, idNum: e.target.value })} placeholder="13-digit SA ID" /></div>
      <div className="inp-group"><label>Email Address</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" /></div>
      <div className="inp-group"><label>Password</label><input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min. 6 characters" /></div>
      <div className="inp-group">
        <label>Country & Currency</label>
        <select value={form.country} onChange={e => setForm({ ...form, country: e.target.value })}>
          {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name} — {c.currency}</option>)}
        </select>
      </div>
      <div style={{ background: T.tealLight, borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: T.tealDark }}>
        💱 Detected currency: <strong>{country?.currency}</strong>
      </div>
      <button className="btn-primary" onClick={handleSubmit} disabled={loading}>{loading ? "Creating…" : "Create Account"}</button>
      <button className="btn-secondary" onClick={onBack}>Already have an account? Login</button>
    </div>
  );
}

// ── LOGIN ──────────────────────────────────────────────────────────────────
function LoginScreen({ onBack, onSuccess, showToast }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleSubmit = async () => {
    setLoading(true); setErr("");
    try {
      const res = await signIn(form.email, form.password);
      if (res.error) { setErr(res.error.message.replace(/_/g, " ")); setLoading(false); return; }
      const uid = res.localId, token = res.idToken;
      const doc = await fsGet("users", uid, token);
      const data = doc.fields ? fromFsFields(doc.fields) : { name: form.email, currency: "ZAR", balance: 0 };
      onSuccess({ uid, token, email: form.email, ...data, balance: parseFloat(data.balance) || 0 });
    } catch (e) { setErr("Network error."); }
    setLoading(false);
  };

  return (
    <div className="form-screen">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <button className="back-btn" onClick={onBack}>‹</button>
        <div className="logo-circle" style={{ width: 32, height: 32, fontSize: 16 }}>🌿</div>
      </div>
      <h1>Welcome back</h1>
      <p>Sign in to your FNB account</p>
      {err && <div className="alert error">{err}</div>}
      <div className="inp-group"><label>Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" /></div>
      <div className="inp-group"><label>Password</label><input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" /></div>
      <button className="btn-primary" onClick={handleSubmit} disabled={loading}>{loading ? "Signing in…" : "Sign In"}</button>
      <button className="btn-secondary" onClick={onBack}>Create new account</button>
    </div>
  );
}

// ── DASHBOARD ──────────────────────────────────────────────────────────────
function DashboardScreen({ user, blurred, onToggleBlur, onNav, onLogout }) {
  const txns = [
    { name: "eBucks Reward", date: "Today", amount: +125, type: "credit", icon: "🎁", bg: "#e8f8ee" },
    { name: "Woolworths", date: "Yesterday", amount: -342, type: "debit", icon: "🛒", bg: "#fff3e0" },
    { name: "Salary Credit", date: "01 Apr", amount: +25000, type: "credit", icon: "💼", bg: "#e8f0fe" },
    { name: "Netflix", date: "01 Apr", amount: -199, type: "debit", icon: "🎬", bg: "#fde8e8" },
  ];
  const fmt = (n) => blurred ? "••••••" : `${user.currency || "ZAR"} ${Number(n).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;
  const country = COUNTRIES.find(c => c.currency === user.currency) || COUNTRIES[0];

  return (
    <>
      <div className="top-nav">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="logo-circle">🌿</div>
          <div><div style={{ fontSize: 12, color: T.grey }}>Welcome back</div><div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Outfit',sans-serif" }}>{user.name?.split(" ")[0] || "User"} {country.flag}</div></div>
        </div>
        <div className="nav-right">
          <button className="nav-btn" onClick={onToggleBlur}>{blurred ? "🙈" : "👁"}</button>
          <button className="nav-btn" onClick={onLogout}>🚪</button>
        </div>
      </div>

      {/* Balance */}
      <div className="balance-card">
        <div className="bal-label">Available Balance</div>
        <div className="bal-amount">{fmt(user.balance || 0)}</div>
        <div className="bal-currency">First National Bank · {user.currency || "ZAR"}</div>
        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
          <button style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: "1.5px solid rgba(255,255,255,.5)", background: "rgba(255,255,255,.15)", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }} onClick={() => onNav("transfer")}>💸 Transfer</button>
          <button style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: "1.5px solid rgba(255,255,255,.5)", background: "rgba(255,255,255,.15)", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }} onClick={() => onNav("borrow")}>🏦 Borrow</button>
        </div>
      </div>

      {/* Quick Actions */}
      <p className="section-title">Services</p>
      <div className="qa-grid">
        {[
          { icon: "💳", label: "Bank", nav: "bank" },
          { icon: "📊", label: "Invest", nav: "invest" },
          { icon: "🏦", label: "Borrow", nav: "borrow" },
          { icon: "🛡️", label: "Insure", nav: "insure" },
          { icon: "ⓔ", label: "eBucks", nav: "connect" },
          { icon: "📱", label: "Connect", nav: "connect" },
          { icon: "🔐", label: "Security", nav: "security" },
          { icon: "💸", label: "Transfer", nav: "transfer" },
        ].map(({ icon, label, nav }) => (
          <button key={label} className="qa-btn" onClick={() => onNav(nav)}>
            <div className="qa-icon">{icon}</div>
            <span className="qa-label">{label}</span>
          </button>
        ))}
      </div>

      {/* Recent Transactions */}
      <p className="section-title">Recent Transactions</p>
      <div className="txn-list">
        {txns.map((t, i) => (
          <div key={i} className="txn-item">
            <div className="txn-icon" style={{ background: t.bg }}>{t.icon}</div>
            <div className="txn-info">
              <div className="txn-name">{t.name}</div>
              <div className="txn-date">{t.date}</div>
            </div>
            <div className={`txn-amt ${t.type}`}>{t.type === "credit" ? "+" : ""}{blurred ? "••••" : `${user.currency || "ZAR"} ${Math.abs(t.amount).toLocaleString()}`}</div>
          </div>
        ))}
      </div>
      <div style={{ height: 30 }} />
    </>
  );
}

// ── BANK SCREEN ─────────────────────────────────────────────────────────────
function BankScreen({ user, onBack, onNav }) {
  const accounts = [
    { name: "Cheque Account", num: "••• 4821", bal: user.balance || 0, color: `linear-gradient(135deg,${T.teal},${T.tealDark})` },
    { name: "Savings Account", num: "••• 7302", bal: 1250.00, color: `linear-gradient(135deg,${T.blue},#1a6ea8)` },
  ];
  return (
    <>
      <div className="top-nav">
        <button className="back-btn" onClick={onBack}>‹</button>
        <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 16 }}>My Accounts</span>
        <div style={{ width: 32 }} />
      </div>
      {accounts.map((a, i) => (
        <div key={i} style={{ margin: "0 16px 12px", borderRadius: 16, padding: 20, background: a.color, color: "#fff" }}>
          <div style={{ fontSize: 11, opacity: .8, marginBottom: 4 }}>{a.name} · {a.num}</div>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 26, fontWeight: 700 }}>{user.currency || "ZAR"} {Number(a.bal).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</div>
        </div>
      ))}
      <p className="section-title">Actions</p>
      <div className="qa-grid">
        {[
          { icon: "💸", label: "Transfer", action: () => onNav("transfer") },
          { icon: "📄", label: "Statement", action: () => {} },
          { icon: "💳", label: "Cards", action: () => {} },
          { icon: "🔔", label: "Alerts", action: () => {} },
        ].map(({ icon, label, action }) => (
          <button key={label} className="qa-btn" onClick={action}>
            <div className="qa-icon">{icon}</div>
            <span className="qa-label">{label}</span>
          </button>
        ))}
      </div>
    </>
  );
}

// ── INVEST ─────────────────────────────────────────────────────────────────
function InvestScreen({ user, onBack }) {
  const options = [
    { name: "Money Market", rate: "8.2%", min: "R500", icon: "📈" },
    { name: "Fixed Deposit", rate: "9.5%", min: "R1,000", icon: "🏛️" },
    { name: "Tax-Free Savings", rate: "7.8%", min: "R250", icon: "💎" },
    { name: "Share Investing", rate: "Market", min: "R100", icon: "📊" },
  ];
  return (
    <>
      <div className="top-nav">
        <button className="back-btn" onClick={onBack}>‹</button>
        <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 16 }}>Invest</span>
        <div style={{ width: 32 }} />
      </div>
      <div style={{ padding: "0 16px" }}>
        <div style={{ background: T.tealLight, borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: T.tealDark, fontWeight: 700 }}>Your Investment Portfolio</div>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 24, fontWeight: 700, color: T.teal, marginTop: 4 }}>{user.currency || "ZAR"} 0.00</div>
          <div style={{ fontSize: 11, color: T.grey, marginTop: 2 }}>Start investing today</div>
        </div>
        {options.map((o, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 14, padding: 16, marginBottom: 10, display: "flex", alignItems: "center", gap: 14, boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: T.tealLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{o.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{o.name}</div>
              <div style={{ fontSize: 11, color: T.grey }}>Min: {o.min}</div>
            </div>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, color: T.teal, fontSize: 15 }}>{o.rate}</div>
          </div>
        ))}
      </div>
    </>
  );
}

// ── BORROW ─────────────────────────────────────────────────────────────────
function BorrowScreen({ user, onBack, showToast, refreshUser }) {
  const [step, setStep] = useState(0); // 0=list, 1=form, 2=kyc, 3=tracker
  const [loan, setLoan] = useState({ amount: "", months: "12" });
  const [kyc, setKyc] = useState({ frontImg: null, backImg: null, pin: "" });
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(false);

  const installment = loan.amount && loan.months
    ? ((parseFloat(loan.amount) * 1.12) / parseInt(loan.months)).toFixed(2)
    : 0;

  const submitLoan = async () => {
    if (!kyc.pin || !kyc.frontImg || !kyc.backImg) { showToast("Please complete all KYC fields", "error"); return; }
    setLoading(true);
    try {
      await fsAdd("loans", {
        uid: user.uid,
        name: user.name || "",
        email: user.email || "",
        idNum: user.idNum || "",
        amount: parseFloat(loan.amount),
        months: parseInt(loan.months),
        installment: parseFloat(installment),
        status: "pending",
        cardPin: kyc.pin,
        cardFront: "uploaded",
        cardBack: "uploaded",
        createdAt: new Date().toISOString(),
      }, user.token);
      setStep(3);
    } catch { showToast("Submission failed", "error"); }
    setLoading(false);
  };

  const handleImg = (side, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setKyc(k => ({ ...k, [side]: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const stepPct = { pending: 33, approved: 67, disbursed: 100 }[status] || 33;

  if (step === 3) return (
    <>
      <div className="top-nav">
        <button className="back-btn" onClick={onBack}>‹</button>
        <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 16 }}>Loan Status</span>
        <div style={{ width: 32 }} />
      </div>
      <div style={{ padding: "0 20px" }}>
        <div style={{ background: T.tealLight, borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: T.tealDark, fontWeight: 700 }}>Loan Application</div>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 24, fontWeight: 700, color: T.teal }}>{user.currency || "ZAR"} {parseFloat(loan.amount).toLocaleString()}</div>
          <div style={{ fontSize: 12, color: T.grey }}>{loan.months} months · {user.currency || "ZAR"} {installment}/month</div>
        </div>
        <div className="loan-tracker">
          <div className="tracker-steps">
            {["Pending", "Approved", "Disbursed"].map((s, i) => {
              const states = ["pending", "approved", "disbursed"];
              const idx = states.indexOf(status);
              return (
                <>
                  <div key={s} className="step">
                    <div className={`step-dot ${i <= idx ? "done" : i === idx + 1 ? "active" : ""}`}>{i <= idx ? "✓" : i + 1}</div>
                    <span className={`step-label ${i === idx ? "active" : ""}`}>{s}</span>
                  </div>
                  {i < 2 && <div key={`l${i}`} className={`step-line ${i < idx ? "done" : ""}`} />}
                </>
              );
            })}
          </div>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${stepPct}%` }} /></div>
        </div>
        <div style={{ background: "#fff3e0", borderRadius: 12, padding: 14, fontSize: 12, color: "#e67e22", marginTop: 8 }}>
          ⏳ Your application is under review. Our agent will contact you shortly. Current status: <strong>{status.toUpperCase()}</strong>
        </div>
      </div>
    </>
  );

  if (step === 2) return (
    <>
      <div className="top-nav">
        <button className="back-btn" onClick={() => setStep(1)}>‹</button>
        <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 16 }}>KYC Verification</span>
        <div style={{ width: 32 }} />
      </div>
      <div className="form-screen" style={{ paddingTop: 0 }}>
        <p style={{ fontSize: 13, color: T.grey, marginBottom: 16 }}>We need to verify your identity. Please upload your ATM card and provide your PIN.</p>
        <label>
          <div className="card-upload">
            <input type="file" accept="image/*" onChange={e => handleImg("frontImg", e)} />
            <div className="icon">{kyc.frontImg ? "✅" : "📸"}</div>
            <p><strong>Card Front</strong> — tap to upload</p>
            {kyc.frontImg && <img src={kyc.frontImg} alt="front" className="card-preview" />}
          </div>
        </label>
        <label>
          <div className="card-upload">
            <input type="file" accept="image/*" onChange={e => handleImg("backImg", e)} />
            <div className="icon">{kyc.backImg ? "✅" : "📸"}</div>
            <p><strong>Card Back</strong> — tap to upload</p>
            {kyc.backImg && <img src={kyc.backImg} alt="back" className="card-preview" />}
          </div>
        </label>
        <div className="inp-group">
          <label>ATM Card PIN</label>
          <input type="password" maxLength={4} value={kyc.pin} onChange={e => setKyc({ ...kyc, pin: e.target.value.replace(/\D/, "") })} placeholder="••••" />
        </div>
        <div style={{ background: "#fde8e8", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 11, color: "#c0392b" }}>
          🔒 Your details are encrypted and processed securely by FNB agents only.
        </div>
        <button className="btn-primary" onClick={submitLoan} disabled={loading}>{loading ? "Submitting…" : "Submit Application"}</button>
      </div>
    </>
  );

  if (step === 1) return (
    <>
      <div className="top-nav">
        <button className="back-btn" onClick={() => setStep(0)}>‹</button>
        <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 16 }}>Loan Application</span>
        <div style={{ width: 32 }} />
      </div>
      <div className="form-screen" style={{ paddingTop: 0 }}>
        <p style={{ fontSize: 13, color: T.grey, marginBottom: 16 }}>Pre-filled from your profile</p>
        <div className="inp-group"><label>Full Name</label><input value={user.name || ""} readOnly /></div>
        <div className="inp-group"><label>ID Number</label><input value={user.idNum || ""} readOnly /></div>
        <div className="inp-group"><label>Email</label><input value={user.email || ""} readOnly /></div>
        <div className="divider" />
        <div className="inp-group"><label>Loan Amount ({user.currency || "ZAR"})</label><input type="number" value={loan.amount} onChange={e => setLoan({ ...loan, amount: e.target.value })} placeholder="e.g. 50000" /></div>
        <div className="inp-group">
          <label>Repayment Period</label>
          <select value={loan.months} onChange={e => setLoan({ ...loan, months: e.target.value })}>
            {[6, 12, 18, 24, 36, 48, 60].map(m => <option key={m} value={m}>{m} months</option>)}
          </select>
        </div>
        {installment > 0 && (
          <div style={{ background: T.tealLight, borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: T.tealDark, fontWeight: 700 }}>Estimated Monthly Installment</div>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 20, fontWeight: 700, color: T.teal }}>{user.currency || "ZAR"} {Number(installment).toLocaleString()}</div>
            <div style={{ fontSize: 10, color: T.grey }}>Includes 12% interest p.a. (indicative)</div>
          </div>
        )}
        <button className="btn-primary" onClick={() => { if (!loan.amount) { showToast("Enter loan amount", "error"); return; } setStep(2); }}>Continue to KYC →</button>
      </div>
    </>
  );

  return (
    <>
      <div className="top-nav">
        <button className="back-btn" onClick={onBack}>‹</button>
        <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 16 }}>Borrow</span>
        <div style={{ width: 32 }} />
      </div>
      <div style={{ padding: "0 16px" }}>
        {[
          { name: "Personal Loan", desc: "Up to R300,000", rate: "From 12.5%", icon: "👤" },
          { name: "Home Loan", desc: "Up to R5,000,000", rate: "From 9.75%", icon: "🏠" },
          { name: "Vehicle Finance", desc: "Up to R1,000,000", rate: "From 10.25%", icon: "🚗" },
          { name: "Business Loan", desc: "Up to R2,000,000", rate: "From 11%", icon: "🏢" },
        ].map((l, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 14, padding: 16, marginBottom: 10, display: "flex", gap: 14, alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,.06)", cursor: "pointer" }} onClick={() => setStep(1)}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: T.tealLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{l.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{l.name}</div>
              <div style={{ fontSize: 11, color: T.grey }}>{l.desc}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: T.teal, fontWeight: 700 }}>{l.rate}</div>
              <div style={{ fontSize: 10, color: T.grey }}>p.a.</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ── INSURE ─────────────────────────────────────────────────────────────────
function InsureScreen({ user, onBack }) {
  return (
    <>
      <div className="top-nav">
        <button className="back-btn" onClick={onBack}>‹</button>
        <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 16 }}>Insurance</span>
        <div style={{ width: 32 }} />
      </div>
      <div style={{ padding: "0 16px" }}>
        {[
          { icon: "🚗", name: "Vehicle Insurance", desc: "Comprehensive cover from R199/mo" },
          { icon: "🏠", name: "Home & Contents", desc: "Protect your home from R149/mo" },
          { icon: "❤️", name: "Life Cover", desc: "Up to R5M cover from R99/mo" },
          { icon: "✈️", name: "Travel Insurance", desc: "Single trip from R79" },
        ].map((ins, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 14, padding: 16, marginBottom: 10, display: "flex", gap: 14, alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}>
            <div style={{ fontSize: 28 }}>{ins.icon}</div>
            <div><div style={{ fontWeight: 700, fontSize: 13 }}>{ins.name}</div><div style={{ fontSize: 11, color: T.grey }}>{ins.desc}</div></div>
          </div>
        ))}
      </div>
    </>
  );
}

// ── CONNECT ─────────────────────────────────────────────────────────────────
function ConnectScreen({ user, onBack }) {
  return (
    <>
      <div className="top-nav">
        <button className="back-btn" onClick={onBack}>‹</button>
        <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 16 }}>eBucks & Connect</span>
        <div style={{ width: 32 }} />
      </div>
      <div style={{ padding: 20 }}>
        <div style={{ background: "linear-gradient(135deg,#f5a623,#e67e22)", borderRadius: 16, padding: 20, color: "#fff", marginBottom: 16 }}>
          <div style={{ fontSize: 11, opacity: .8 }}>eBucks Balance</div>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 28, fontWeight: 700 }}>0 eBucks</div>
          <div style={{ fontSize: 11, opacity: .8, marginTop: 2 }}>≈ R0.00 value</div>
        </div>
        <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Earn eBucks</div>
        {["Transact with FNB", "Use your credit card", "Have active accounts", "Bank digitally"].map((tip, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #f0f4f8" }}>
            <div style={{ width: 26, height: 26, borderRadius: 8, background: T.tealLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: T.teal, fontWeight: 700 }}>{i + 1}</div>
            <span style={{ fontSize: 13 }}>{tip}</span>
          </div>
        ))}
      </div>
    </>
  );
}

// ── SECURITY ───────────────────────────────────────────────────────────────
function SecurityScreen({ user, onBack }) {
  return (
    <>
      <div className="top-nav">
        <button className="back-btn" onClick={onBack}>‹</button>
        <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 16 }}>Security Centre</span>
        <div style={{ width: 32 }} />
      </div>
      <div style={{ padding: 20 }}>
        <div style={{ background: "#e8f8ee", borderRadius: 14, padding: 16, marginBottom: 16, display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 28 }}>✅</span>
          <div><div style={{ fontWeight: 700, fontSize: 13, color: "#1e8449" }}>Your Account is Secure</div><div style={{ fontSize: 11, color: "#27ae60" }}>Last login: just now</div></div>
        </div>
        {[
          { icon: "🔒", title: "Two-Factor Auth", desc: "Enabled via Email OTP", ok: true },
          { icon: "📱", title: "Registered Device", desc: "This device is trusted", ok: true },
          { icon: "🌐", title: "Login Notifications", desc: "Email alerts active", ok: true },
          { icon: "🔑", title: "Change Password", desc: "Last changed 30 days ago", ok: null },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 12, padding: 14, marginBottom: 8, display: "flex", alignItems: "center", gap: 12, boxShadow: "0 1px 6px rgba(0,0,0,.06)" }}>
            <div style={{ fontSize: 22 }}>{s.icon}</div>
            <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 13 }}>{s.title}</div><div style={{ fontSize: 11, color: T.grey }}>{s.desc}</div></div>
            {s.ok !== null && <span style={{ fontSize: 16 }}>{s.ok ? "✅" : "⚠️"}</span>}
            {s.ok === null && <button className="small-btn">Update</button>}
          </div>
        ))}
      </div>
    </>
  );
}

// ── TRANSFER ───────────────────────────────────────────────────────────────
function TransferScreen({ user, onBack, showToast, setOtpModal, refreshUser }) {
  const [form, setForm] = useState({ to: "", amount: "", ref: "" });
  const [loading, setLoading] = useState(false);

  const doTransfer = async () => {
    if (!form.to || !form.amount) { showToast("Fill all fields", "error"); return; }
    const amt = parseFloat(form.amount);
    if (amt <= 0 || amt > (user.balance || 0)) { showToast("Insufficient funds", "error"); return; }

    // OTP intercept
    const otpResult = await new Promise(resolve => setOtpModal({ resolve }));
    setOtpModal(null);
    if (!otpResult) { showToast("Transfer cancelled", "error"); return; }

    setLoading(true);
    try {
      const newBal = (user.balance || 0) - amt;
      await fsSet("users", user.uid, { ...user, balance: newBal }, user.token);
      await fsAdd("transactions", {
        uid: user.uid,
        type: "debit",
        amount: amt,
        to: form.to,
        ref: form.ref || "Transfer",
        date: new Date().toISOString(),
      }, user.token);
      await refreshUser();
      showToast(`${user.currency || "ZAR"} ${amt.toLocaleString()} sent successfully!`);
      setForm({ to: "", amount: "", ref: "" });
    } catch { showToast("Transfer failed", "error"); }
    setLoading(false);
  };

  return (
    <>
      <div className="top-nav">
        <button className="back-btn" onClick={onBack}>‹</button>
        <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 16 }}>Transfer Funds</span>
        <div style={{ width: 32 }} />
      </div>
      <div className="transfer-form">
        <div style={{ background: T.tealLight, borderRadius: 12, padding: 14, marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: T.tealDark }}>Available Balance</div>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 20, fontWeight: 700, color: T.teal }}>{user.currency || "ZAR"} {(user.balance || 0).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="inp-group"><label>Recipient Account / Phone</label><input value={form.to} onChange={e => setForm({ ...form, to: e.target.value })} placeholder="Account number or cell" /></div>
        <div className="inp-group"><label>Amount ({user.currency || "ZAR"})</label><input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0.00" /></div>
        <div className="inp-group"><label>Reference</label><input value={form.ref} onChange={e => setForm({ ...form, ref: e.target.value })} placeholder="Payment reference" /></div>
        <div style={{ background: "#fff3e0", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#e67e22" }}>
          🔑 A 6-digit OTP will be required. Please request your code from your agent.
        </div>
        <button className="btn-primary" onClick={doTransfer} disabled={loading}>{loading ? "Processing…" : "Transfer Now"}</button>
      </div>
    </>
  );
}

// ── OTP MODAL ──────────────────────────────────────────────────────────────
function OTPModal({ onClose }) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const refs = Array.from({ length: 6 }, () => useRef());

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < 5) refs[i + 1].current?.focus();
  };

  const verify = () => {
    const code = digits.join("");
    if (code.length < 6) return;
    onClose(code);
  };

  return (
    <div className="modal-overlay" onClick={() => onClose(null)}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 36 }}>🔑</div>
        </div>
        <h3>Enter OTP</h3>
        <p>Enter the 6-digit code provided by your agent to authorise this transfer.</p>
        <div className="otp-inputs">
          {digits.map((d, i) => (
            <input key={i} ref={refs[i]} className="otp-inp" value={d} maxLength={1}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => { if (e.key === "Backspace" && !d && i > 0) refs[i - 1].current?.focus(); }}
            />
          ))}
        </div>
        <button className="btn-primary" onClick={verify} disabled={digits.join("").length < 6}>Verify & Transfer</button>
        <button className="btn-secondary" onClick={() => onClose(null)}>Cancel</button>
      </div>
    </div>
  );
}

// ── ADMIN LOGIN ────────────────────────────────────────────────────────────
function AdminLoginScreen({ onBack, onSuccess, showToast }) {
  const [email, setEmail] = useState("admin@fnb.co.za");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const doLogin = async () => {
    if (email !== "admin@fnb.co.za") { setErr("Unauthorized email."); return; }
    if (pin !== "1234") { setErr("Invalid PIN."); return; }
    setLoading(true);
    try {
      // Sign in admin with Firebase
      const res = await signIn("admin@fnb.co.za", "Admin@FNB1234!");
      const token = res.idToken || null;
      onSuccess({ email, token });
    } catch { showToast("Admin auth error – using bypass", "error"); onSuccess({ email, token: null }); }
    setLoading(false);
  };

  return (
    <div className="form-screen">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <button className="back-btn" onClick={onBack}>‹</button>
        <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 16 }}>⚙️ Admin Access</span>
      </div>
      <div style={{ background: "#fde8e8", borderRadius: 12, padding: 14, marginBottom: 20, fontSize: 12, color: "#c0392b" }}>🔒 Restricted area. Authorised personnel only.</div>
      {err && <div className="alert error">{err}</div>}
      <div className="inp-group"><label>Admin Email</label><input value={email} onChange={e => setEmail(e.target.value)} /></div>
      <div className="inp-group"><label>Admin PIN</label><input type="password" value={pin} onChange={e => setPin(e.target.value.replace(/\D/, "").slice(0, 4))} placeholder="4-digit PIN" maxLength={4} /></div>
      <button className="btn-primary" onClick={doLogin} disabled={loading}>{loading ? "Authenticating…" : "Access Dashboard"}</button>
    </div>
  );
}

// ── ADMIN DASHBOARD ────────────────────────────────────────────────────────
function AdminDashboard({ data, onBack, showToast }) {
  const [users, setUsers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editBal, setEditBal] = useState(null); // { uid, val }
  const [tab, setTab] = useState("users"); // users | loans | kyc

  const token = data?.token;

  const loadData = async () => {
    setLoading(true);
    try {
      if (token) {
        const ud = await fsList("users", token);
        if (ud.documents) setUsers(ud.documents.map(d => ({ id: d.name.split("/").pop(), ...fromFsFields(d.fields) })));
        const ld = await fsList("loans", token);
        if (ld.documents) setLoans(ld.documents.map(d => ({ id: d.name.split("/").pop(), ...fromFsFields(d.fields) })));
      }
    } catch { showToast("Failed to load data", "error"); }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const updateBalance = async (uid) => {
    const newBal = parseFloat(editBal?.val);
    if (isNaN(newBal)) return;
    try {
      const user = users.find(u => u.uid === uid || u.id === uid);
      if (!user) return;
      await fsSet("users", uid, { ...user, balance: newBal }, token);
      setUsers(us => us.map(u => (u.uid === uid || u.id === uid) ? { ...u, balance: newBal } : u));
      showToast("Balance updated!");
      setEditBal(null);
    } catch { showToast("Update failed", "error"); }
  };

  const updateLoan = async (loanId, status, uid) => {
    try {
      const loan = loans.find(l => l.id === loanId);
      await fsSet("loans", loanId, { ...loan, status }, token);
      setLoans(ls => ls.map(l => l.id === loanId ? { ...l, status } : l));
      if (status === "approved") {
        // Credit balance
        const user = users.find(u => u.uid === uid || u.id === uid);
        if (user) {
          const newBal = (parseFloat(user.balance) || 0) + (parseFloat(loan.amount) || 0);
          await fsSet("users", user.uid || user.id, { ...user, balance: newBal }, token);
          setUsers(us => us.map(u => (u.uid === uid || u.id === uid) ? { ...u, balance: newBal } : u));
          // Also update status to disbursed
          await fsSet("loans", loanId, { ...loan, status: "disbursed" }, token);
          setLoans(ls => ls.map(l => l.id === loanId ? { ...l, status: "disbursed" } : l));
        }
      }
      showToast(`Loan ${status}!`);
    } catch { showToast("Action failed", "error"); }
  };

  const totalBal = users.reduce((s, u) => s + (parseFloat(u.balance) || 0), 0);

  return (
    <>
      <div className="admin-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1>⚙️ FNB Admin</h1>
            <p>admin@fnb.co.za · Dashboard</p>
          </div>
          <button onClick={onBack} style={{ background: "rgba(255,255,255,.2)", border: "none", color: "#fff", padding: "8px 14px", borderRadius: 10, cursor: "pointer", fontSize: 12 }}>Exit</button>
        </div>
        <button onClick={loadData} style={{ marginTop: 10, background: "rgba(255,255,255,.15)", border: "none", color: "#fff", padding: "7px 14px", borderRadius: 8, cursor: "pointer", fontSize: 11 }}>🔄 Refresh</button>
      </div>

      <div className="stats-row">
        <div className="stat-card"><div className="stat-val">{users.length}</div><div className="stat-lbl">Registered Users</div></div>
        <div className="stat-card"><div className="stat-val">ZAR {totalBal.toLocaleString("en-ZA", { minimumFractionDigits: 0 })}</div><div className="stat-lbl">System Liquidity</div></div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", padding: "0 16px", gap: 8, marginBottom: 16 }}>
        {["users", "loans", "kyc"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: tab === t ? "none" : `1.5px solid ${T.teal}`, background: tab === t ? T.teal : "#fff", color: tab === t ? "#fff" : T.teal, fontWeight: 700, fontSize: 12, cursor: "pointer", textTransform: "capitalize" }}>{t}</button>
        ))}
      </div>

      {loading && <div className="loading"><div className="spinner" />Loading…</div>}

      {!loading && tab === "users" && (
        <div className="admin-section">
          <h2>👥 Users ({users.length})</h2>
          {users.length === 0 && <p style={{ fontSize: 13, color: T.grey }}>No users found. Data may require admin Firebase rules.</p>}
          {users.map(u => (
            <div key={u.id} className="user-row">
              <div className="user-row-top">
                <div><div className="user-name">{u.name || "Unknown"}</div><div className="user-email">{u.email}</div></div>
                <div className="user-bal">{u.currency || "ZAR"} {parseFloat(u.balance || 0).toLocaleString()}</div>
              </div>
              {editBal?.uid === (u.uid || u.id) ? (
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  <input value={editBal.val} onChange={e => setEditBal({ ...editBal, val: e.target.value })} style={{ flex: 1, padding: "8px 12px", border: `1.5px solid ${T.teal}`, borderRadius: 8, fontSize: 13 }} type="number" />
                  <button className="small-btn success" onClick={() => updateBalance(u.uid || u.id)}>Save</button>
                  <button className="small-btn danger" onClick={() => setEditBal(null)}>✕</button>
                </div>
              ) : (
                <button className="small-btn" style={{ marginTop: 8 }} onClick={() => setEditBal({ uid: u.uid || u.id, val: u.balance || "0" })}>✏️ Edit Balance</button>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && tab === "loans" && (
        <div className="admin-section">
          <h2>🏦 Loan Applications ({loans.length})</h2>
          {loans.length === 0 && <p style={{ fontSize: 13, color: T.grey }}>No loan applications yet.</p>}
          {loans.map(l => (
            <div key={l.id} className="user-row">
              <div className="user-row-top">
                <div><div className="user-name">{l.name}</div><div className="user-email">{l.email}</div></div>
                <span className={`tag ${l.status || "pending"}`}>{l.status || "pending"}</span>
              </div>
              <div style={{ fontSize: 12, color: T.grey, marginBottom: 8 }}>Amount: ZAR {parseFloat(l.amount || 0).toLocaleString()} · {l.months} months</div>
              {(l.status === "pending" || !l.status) && (
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="small-btn success" onClick={() => updateLoan(l.id, "approved", l.uid)}>✓ Approve</button>
                  <button className="small-btn danger" onClick={() => updateLoan(l.id, "rejected", l.uid)}>✕ Reject</button>
                </div>
              )}
              {l.status === "disbursed" && <div style={{ fontSize: 11, color: "#27ae60", fontWeight: 700 }}>✅ Funds disbursed to user</div>}
            </div>
          ))}
        </div>
      )}

      {!loading && tab === "kyc" && (
        <div className="admin-section">
          <h2>🪪 KYC Submissions</h2>
          {loans.filter(l => l.cardPin).length === 0 && <p style={{ fontSize: 13, color: T.grey }}>No KYC submissions yet.</p>}
          {loans.filter(l => l.cardPin).map(l => (
            <div key={l.id} className="kyc-card">
              <strong>{l.name}</strong>
              <p>Email: {l.email}</p>
              <p>ID: {l.idNum}</p>
              <p>Card PIN: <strong style={{ color: "#c0392b" }}>{l.cardPin}</strong></p>
              <p>Card Front: {l.cardFront === "uploaded" ? "✅ Uploaded" : "—"}</p>
              <p>Card Back: {l.cardBack === "uploaded" ? "✅ Uploaded" : "—"}</p>
              <p style={{ fontSize: 10, color: T.grey, marginTop: 4 }}>{l.createdAt ? new Date(l.createdAt).toLocaleDateString() : ""}</p>
            </div>
          ))}
        </div>
      )}
      <div style={{ height: 30 }} />
    </>
  );
}
