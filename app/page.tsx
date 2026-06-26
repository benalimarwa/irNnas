import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import {
  Sparkles, ArrowRight, Package, LogIn, UserPlus, Shirt, ChevronRight,
  Gem, Shield, Truck, Star, Zap, Clock, Layers, Award, Palette, Heart, TrendingUp
} from "lucide-react";
import ClientAnimations from "@/components/ClientAnimations";

export default async function Home() {
  const clerkUser = await currentUser();
  const isAdmin = clerkUser?.publicMetadata?.role === "ADMIN";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@300;400;500;600;700&family=Syne:wght@500;600;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        :root {
          --bg-primary: #0A0A0A;
          --bg-secondary: #111111;
          --bg-elevated: rgba(20, 20, 25, 0.7);
          --border-light: rgba(255, 255, 255, 0.08);
          --text-primary: #F8F6F2;
          --text-secondary: rgba(248, 246, 242, 0.65);
          --text-muted: rgba(248, 246, 242, 0.4);
          --accent-gold: #D4AF37;
          --accent-gold-dark: #B8942E;
          --accent-gold-glow: rgba(212, 175, 55, 0.2);
          --accent-coral: #FF6B6B;
          --accent-teal: #4ECDC4;
          --accent-violet: #9B59B6;
          --accent-amber: #FFB347;
          --accent-rose: #FF85A1;
          --accent-lime: #A8E6CF;
          --accent-indigo: #5D9BEC;
          --gradient-gold: linear-gradient(135deg, #D4AF37 0%, #F5E6A3 50%, #D4AF37 100%);
          --gradient-coral: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%);
          --gradient-teal: linear-gradient(135deg, #4ECDC4 0%, #6EE7DE 100%);
          --gradient-violet: linear-gradient(135deg, #9B59B6 0%, #C084FC 100%);
          --gradient-amber: linear-gradient(135deg, #FFB347 0%, #FFCC80 100%);
          --gradient-rose: linear-gradient(135deg, #FF85A1 0%, #FFB7C5 100%);
          --gradient-multi: linear-gradient(135deg, #D4AF37, #FF6B6B, #4ECDC4, #9B59B6);
          --glass-bg: rgba(17, 17, 17, 0.7);
          --glass-border: rgba(255, 255, 255, 0.05);
        }
        body { background: var(--bg-primary); overflow-x: hidden; width: 100%; }
        .homepage {
          position: relative;
          min-height: 100vh;
          font-family: 'Instrument Sans', sans-serif;
          color: var(--text-primary);
          overflow-x: hidden;
          width: 100%;
        }
        .homepage::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: repeating-linear-gradient(45deg, rgba(255,255,255,0.01) 0px, rgba(255,255,255,0.01) 1px, transparent 1px, transparent 20px);
          pointer-events: none;
          z-index: 1;
        }
        .color-dot {
          position: fixed;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.4;
          pointer-events: none;
          z-index: 1;
        }
        .navbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          backdrop-filter: blur(20px);
          background: rgba(10, 10, 10, 0.8);
          border-bottom: 1px solid var(--border-light);
        }
        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 1rem;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }
        .logo {
          font-family: 'Syne', sans-serif;
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -1.5px;
          background: var(--gradient-multi);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-decoration: none;
          animation: shimmer 3s infinite;
          flex-shrink: 0;
        }
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .nav-links { display: none; gap: 2.5rem; align-items: center; }
        .nav-links a {
          font-size: 0.9rem;
          font-weight: 500;
          letter-spacing: 0.5px;
          color: var(--text-secondary);
          text-decoration: none;
          transition: color 0.3s ease;
        }
        .nav-links a:hover { color: var(--accent-gold); }
        .nav-cta {
          padding: 0.6rem 1.25rem;
          background: var(--gradient-gold);
          color: #0A0A0A;
          border-radius: 9999px;
          font-weight: 600;
          font-size: 0.8rem;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          text-decoration: none;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .main-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 1rem;
          width: 100%;
          overflow-x: hidden;
          position: relative;
          z-index: 10;
        }
        .hero {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr;
          align-items: center;
          gap: 2rem;
          padding-top: 80px;
          padding-bottom: 3rem;
          position: relative;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(212, 175, 55, 0.1);
          padding: 0.5rem 1.25rem;
          border-radius: 9999px;
          margin-bottom: 1.5rem;
          border: 1px solid rgba(212, 175, 55, 0.2);
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 1.5px;
          color: var(--accent-gold);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }
        .hero-badge span {
          width: 8px; height: 8px; min-width: 8px;
          background: var(--accent-gold);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        .hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2.2rem, 9vw, 5.5rem);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin-bottom: 1.5rem;
          word-break: break-word;
          overflow-wrap: break-word;
        }
        .gradient-text {
          background: var(--gradient-multi);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: shimmer 4s infinite;
        }
        .hero-description {
          font-size: 1rem;
          line-height: 1.6;
          color: var(--text-secondary);
          margin-bottom: 2rem;
          max-width: 100%;
        }
        .hero-buttons { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 2rem; }
        .btn-primary {
          background: var(--gradient-gold);
          color: #0A0A0A;
          padding: 0.75rem 1.5rem;
          border-radius: 9999px;
          font-weight: 600;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.4s ease;
          text-decoration: none;
          white-space: nowrap;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 20px 35px -10px rgba(212, 175, 55, 0.4); }
        .btn-secondary {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-light);
          color: var(--text-primary);
          padding: 0.75rem 1.5rem;
          border-radius: 9999px;
          font-weight: 600;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.4s ease;
          text-decoration: none;
          white-space: nowrap;
        }
        .btn-secondary:hover { border-color: var(--accent-coral); color: var(--accent-coral); }
        .hero-stats {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-light);
        }
        .hero-stat { display: flex; flex-direction: column; }
        .hero-stat-value {
          font-family: 'Syne', sans-serif;
          font-size: 1.4rem;
          font-weight: 700;
          background: var(--gradient-gold);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .hero-stat-label { font-size: 0.7rem; color: var(--text-muted); letter-spacing: 0.5px; }
        .hero-media { display: none; }
        .floating-card {
          position: absolute;
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
          border-radius: 1.5rem;
          padding: 1.5rem;
          animation: float 6s ease-in-out infinite;
        }
        .floating-card:nth-child(1) { top: 10%; right: 10%; animation-delay: 0s; border-top-color: var(--accent-gold); }
        .floating-card:nth-child(2) { bottom: 20%; left: 10%; animation-delay: 1s; border-top-color: var(--accent-coral); }
        .floating-card:nth-child(3) { top: 40%; left: 30%; animation-delay: 2s; border-top-color: var(--accent-teal); }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .card-icon { width: 48px; height: 48px; border-radius: 1rem; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; }
        .card-icon.gold { background: var(--gradient-gold); }
        .card-icon.coral { background: var(--gradient-coral); }
        .card-icon.teal { background: var(--gradient-teal); }
        .features-section { padding: 4rem 0; }
        .section-header { text-align: center; margin-bottom: 3rem; }
        .section-badge {
          display: inline-block;
          background: rgba(212, 175, 55, 0.1);
          color: var(--accent-gold);
          padding: 0.25rem 1rem;
          border-radius: 9999px;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 2px;
          margin-bottom: 1rem;
        }
        .section-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.6rem, 5vw, 3rem);
          font-weight: 700;
          letter-spacing: -0.02em;
          background: var(--gradient-multi);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .features-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
        .feature-card {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 1.5rem;
          padding: 1.5rem;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .feature-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          background: var(--gradient-gold);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }
        .feature-card:hover::before { transform: scaleX(1); }
        .feature-card:nth-child(1):hover { border-color: rgba(212, 175, 55, 0.3); }
        .feature-card:nth-child(2):hover { border-color: rgba(255, 107, 107, 0.3); }
        .feature-card:nth-child(3):hover { border-color: rgba(78, 205, 196, 0.3); }
        .feature-icon { width: 48px; height: 48px; border-radius: 1rem; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; }
        .feature-card:nth-child(1) .feature-icon { background: linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.05)); color: var(--accent-gold); }
        .feature-card:nth-child(2) .feature-icon { background: linear-gradient(135deg, rgba(255,107,107,0.2), rgba(255,107,107,0.05)); color: var(--accent-coral); }
        .feature-card:nth-child(3) .feature-icon { background: linear-gradient(135deg, rgba(78,205,196,0.2), rgba(78,205,196,0.05)); color: var(--accent-teal); }
        .feature-card h3 { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; }
        .feature-card p { color: var(--text-secondary); line-height: 1.6; margin-bottom: 1rem; font-size: 0.9rem; }
        .feature-link {
          text-decoration: none;
          font-weight: 600;
          font-size: 0.875rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: gap 0.3s ease;
        }
        .feature-card:nth-child(1) .feature-link { color: var(--accent-gold); }
        .feature-card:nth-child(2) .feature-link { color: var(--accent-coral); }
        .feature-card:nth-child(3) .feature-link { color: var(--accent-teal); }
        .feature-link:hover { gap: 0.75rem; }
        .color-showcase { display: flex; justify-content: center; gap: 1rem; margin-top: 2rem; flex-wrap: wrap; }
        .color-chip { width: 36px; height: 36px; border-radius: 50%; cursor: pointer; transition: transform 0.3s ease; }
        .color-chip:hover { transform: scale(1.1); }
        .color-chip.gold { background: var(--accent-gold); }
        .color-chip.coral { background: var(--accent-coral); }
        .color-chip.teal { background: var(--accent-teal); }
        .color-chip.violet { background: var(--accent-violet); }
        .color-chip.amber { background: var(--accent-amber); }
        .color-chip.rose { background: var(--accent-rose); }
        .stats-section {
          background: linear-gradient(135deg, rgba(212,175,55,0.08), rgba(255,107,107,0.05), rgba(78,205,196,0.05), rgba(155,89,182,0.05));
          border-radius: 1.5rem;
          padding: 2rem 1rem;
          margin: 2rem 0;
          border: 1px solid var(--glass-border);
          overflow: hidden;
        }
        .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; text-align: center; }
        .stat-item { transition: transform 0.3s ease; }
        .stat-item:hover { transform: translateY(-4px); }
        .stat-number {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2rem, 6vw, 3rem);
          font-weight: 800;
          background: var(--gradient-gold);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          margin-bottom: 0.5rem;
        }
        .stat-label { font-size: 0.75rem; color: var(--text-secondary); letter-spacing: 1px; }
        .cta-section {
          background: linear-gradient(135deg, rgba(212,175,55,0.15), rgba(255,107,107,0.1), rgba(78,205,196,0.1));
          border-radius: 1.5rem;
          padding: 2.5rem 1.5rem;
          text-align: center;
          margin: 2rem 0;
          border: 1px solid var(--glass-border);
          position: relative;
          overflow: hidden;
        }
        .cta-section::before {
          content: '';
          position: absolute;
          top: -50%; left: -50%;
          width: 200%; height: 200%;
          background: radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 70%);
          animation: rotate 20s linear infinite;
        }
        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .cta-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.4rem, 4vw, 2.5rem);
          font-weight: 700;
          margin-bottom: 1rem;
          position: relative;
          z-index: 1;
        }
        .cta-description {
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
          position: relative;
          z-index: 1;
          font-size: 0.95rem;
        }
        .footer { border-top: 1px solid var(--border-light); padding: 2rem 0; margin-top: 2rem; }
        .footer-content { display: flex; flex-direction: column; align-items: center; gap: 1.25rem; text-align: center; }
        .footer-links { display: flex; flex-wrap: wrap; justify-content: center; gap: 1rem; }
        .footer-links a { color: var(--text-muted); text-decoration: none; font-size: 0.875rem; transition: color 0.3s ease; }
        .footer-links a:hover { color: var(--accent-coral); }
        .animate-on-scroll { opacity: 0; transform: translateY(30px); transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
        .animate-on-scroll.visible { opacity: 1; transform: translateY(0); }
        @media (min-width: 768px) {
          .features-grid { grid-template-columns: repeat(3, 1fr); }
          .stats-grid { grid-template-columns: repeat(4, 1fr); }
        }
        @media (min-width: 1024px) {
          .nav-container { padding: 0 2rem; height: 80px; }
          .nav-links { display: flex; }
          .logo { font-size: 32px; }
          .main-container { padding: 0 2rem; }
          .hero { grid-template-columns: 1fr 1fr; gap: 4rem; padding-bottom: 0; }
          .hero-media { display: flex; position: relative; height: 500px; align-items: center; justify-content: center; }
          .stats-section { border-radius: 2rem; padding: 4rem 3rem; margin: 4rem 0; }
          .cta-section { border-radius: 2rem; padding: 4rem; margin: 4rem 0; }
          .footer-content { flex-direction: row; justify-content: space-between; text-align: left; }
          .hero-description { font-size: 1.1rem; }
        }
      `}</style>

      {/* ── VIDÉO BACKGROUND ── */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            minWidth: "100%",
            minHeight: "100%",
            width: "auto",
            height: "auto",
            objectFit: "cover",
            opacity: 0.2,
            filter: "brightness(0.5) contrast(1.1)",
          }}
        >
          <source src="/video/pp.mp4" type="video/mp4" />
        </video>
      </div>

      {/* ── OVERLAY RADIAL ── */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          background:
            "radial-gradient(circle at 30% 20%, rgba(212,175,55,0.1), rgba(0,0,0,0.85))",
          pointerEvents: "none",
        }}
      />

      <div className="homepage">
        {/* Points colorés */}
        <div className="color-dot" style={{ top: "20%", left: "10%", width: "300px", height: "300px", background: "var(--accent-gold)" }}></div>
        <div className="color-dot" style={{ bottom: "15%", right: "5%", width: "250px", height: "250px", background: "var(--accent-coral)" }}></div>
        <div className="color-dot" style={{ top: "60%", left: "80%", width: "200px", height: "200px", background: "var(--accent-teal)" }}></div>
        <div className="color-dot" style={{ top: "40%", left: "30%", width: "180px", height: "180px", background: "var(--accent-violet)" }}></div>

        <nav className="navbar">
          <div className="nav-container">
            <Link href="/" className="flex items-center gap-2 group">
              <img
                src="/llogo.png"
                alt="irNas"
                width={120}
                height={40}
                className="object-contain h-9 w-auto transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
            <div className="nav-links">
              <Link href="/catalogue">Collection</Link>
              <Link href="/client/quiz">Style Finder</Link>
              {clerkUser && <Link href="/orders">Commandes</Link>}
            </div>
            {clerkUser ? (
              <Link href={isAdmin ? "/admin/dashboard" : "/client"} className="nav-cta">
                {isAdmin ? <Layers size={14} /> : <UserPlus size={14} />}
                {isAdmin ? "Dashboard" : "Mon Espace"}
              </Link>
            ) : (
              <Link href="/sign-in" className="nav-cta">
                <LogIn size={14} /> Connexion
              </Link>
            )}
          </div>
        </nav>

        <main className="main-container">
          {/* Hero */}
          <section className="hero">
            <div className="hero-left animate-on-scroll">
              <div className="hero-badge">
                <span></span>
                COLLECTION PRINTEMPS — ÉTÉ 2025
              </div>
              <h1 className="hero-title">
                Marque<br />
                <span className="gradient-text">de Luxe</span>
              </h1>
              <div className="hero-buttons">
                {clerkUser ? (
                  <>
                    <Link href="/client/quiz" className="btn-primary">
                      <Sparkles size={16} /> Mon style
                    </Link>
                    <Link href="/catalogue" className="btn-secondary">
                      Explorer <ArrowRight size={16} />
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/sign-up" className="btn-primary">
                      <UserPlus size={16} /> Créer mon compte
                    </Link>
                    <Link href="/catalogue" className="btn-secondary">
                      Collection <ArrowRight size={16} />
                    </Link>
                  </>
                )}
              </div>
              <div className="hero-stats">
                <div className="hero-stat">
                  <span className="hero-stat-value">100+</span>
                  <span className="hero-stat-label">PIÈCES EXCLUSIVES</span>
                </div>
                <div className="hero-stat">
                  <span className="hero-stat-value">48H</span>
                  <span className="hero-stat-label">LIVRAISON EXPRESS</span>
                </div>
                <div className="hero-stat">
                  <span className="hero-stat-value">4.9 ★</span>
                  <span className="hero-stat-label">NOTE MOYENNE</span>
                </div>
              </div>
            </div>

            <div className="hero-media">
              <div className="floating-card">
                <div className="card-icon gold"><Sparkles size={24} color="#0A0A0A" /></div>
                <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Style Finder AI</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Diagnostic personnalisé</div>
              </div>
              <div className="floating-card">
                <div className="card-icon coral"><Shirt size={24} color="#0A0A0A" /></div>
                <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Nouvelle Collection</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>SS 2025</div>
              </div>
              <div className="floating-card">
                <div className="card-icon teal"><Gem size={24} color="#0A0A0A" /></div>
                <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Matières Nobles</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>100% durable</div>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="features-section">
            <div className="section-header animate-on-scroll">
              <div className="section-badge">POURQUOI NOUS CHOISIR</div>
              <h2 className="section-title">Une expérience unique</h2>
            </div>
            <div className="features-grid">
              <div className="feature-card animate-on-scroll">
                <div className="feature-icon"><Shield size={24} /></div>
                <h3>Qualité Premium</h3>
                <p>Des matières nobles sourcées auprès des meilleurs artisans italiens et français. Chaque pièce est vérifiée méticuleusement.</p>
                <Link href="/catalogue" className="feature-link">Voir la collection <ChevronRight size={16} /></Link>
              </div>
              <div className="feature-card animate-on-scroll">
                <div className="feature-icon"><Truck size={24} /></div>
                <h3>Livraison Express</h3>
                <p>Livraison en 48h chrono, retour sous 14 jours. Un service client dédié 7j/7 pour vous accompagner.</p>
                <Link href="/sign-in" className="feature-link">En savoir plus <ChevronRight size={16} /></Link>
              </div>
            </div>
            <div className="color-showcase animate-on-scroll">
              <div className="color-chip gold" title="Or"></div>
              <div className="color-chip coral" title="Corail"></div>
              <div className="color-chip teal" title="Teal"></div>
              <div className="color-chip violet" title="Violet"></div>
              <div className="color-chip amber" title="Ambre"></div>
              <div className="color-chip rose" title="Rose"></div>
            </div>
          </section>

          {/* Stats */}
          <div className="stats-section animate-on-scroll">
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">100+</div>
                <div className="stat-label">PIÈCES EXCLUSIVES</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">48<span style={{ fontSize: "1.2rem" }}>H</span></div>
                <div className="stat-label">LIVRAISON EXPRESS</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">4.9</div>
                <div className="stat-label">NOTE MOYENNE</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">14<span style={{ fontSize: "1.2rem" }}>J</span></div>
                <div className="stat-label">RETOUR GRATUIT</div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="cta-section animate-on-scroll">
            <div style={{ marginBottom: "1rem", position: "relative", zIndex: 1 }}>
              <Award size={44} color="#D4AF37" />
            </div>
            <h2 className="cta-title">Prêt à révéler votre style ?</h2>
            <p className="cta-description">
              Rejoignez une communauté qui valorise l'élégance authentique et la qualité exceptionnelle.
            </p>
            {!clerkUser && (
              <Link
                href="/sign-up"
                className="btn-primary"
                style={{ marginTop: "1rem", position: "relative", zIndex: 1, display: "inline-flex" }}
              >
                Créer mon compte <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </main>

        <footer className="footer">
          <div className="main-container">
            <div className="footer-content">
              <div className="logo" style={{ fontSize: "22px" }}>irNas</div>
              <div className="footer-links">
                <Link href="/catalogue">Collection</Link>
                <Link href="/client/quiz">Style Finder</Link>
                <Link href="/legal">Mentions légales</Link>
                <Link href="/contact">Contact</Link>
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                © 2020 irNas — Tous droits réservés
              </div>
            </div>
          </div>
        </footer>
      </div>

      <ClientAnimations />
    </>
  );
}