"use client";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useRef } from "react";
import "@/app/globals.css";
export default function SignInPage() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Force la lecture de la vidéo (certains navigateurs bloquent autoplay)
    if (videoRef.current) {
      videoRef.current.play().catch(e => console.log("Autoplay bloqué:", e));
    }
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=Instrument+Sans:wght@300;400;500;600;700&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
          --ink: #0A0A0C;
          --off-white: #F4F1EC;
          --gold: #D4AF37;
          --gold-dark: #B8942E;
          --blue-neon: #00D4FF;
          --violet: #B026FF;
          --rose: #FF2D75;
          --teal: #00E5B8;
        }

        .sign-root {
          position: relative;
          min-height: 100vh;
          font-family: 'Instrument Sans', sans-serif;
          background: var(--ink);
          overflow-x: hidden;
        }

        /* Vidéo background - assure le chargement */
        .sign-vid {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          overflow: hidden;
        }

        .sign-vid video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.4;
          filter: brightness(0.7) contrast(1.1) saturate(1.3);
        }

        /* Overlay dégradé dynamique (multicolore) */
        .sign-vid::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 20% 30%, rgba(212,175,55,0.15), rgba(0,212,255,0.1), rgba(176,38,255,0.08), rgba(10,10,12,0.92));
          z-index: 1;
          animation: hueShift 12s infinite alternate;
        }

        @keyframes hueShift {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(15deg); }
        }

        /* Animations flottantes de particules colorées */
        .particle {
          position: fixed;
          border-radius: 50%;
          pointer-events: none;
          z-index: 1;
          filter: blur(40px);
          opacity: 0.3;
          animation: floatParticle 20s infinite alternate ease-in-out;
        }

        @keyframes floatParticle {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(100px, -80px) scale(1.2); }
        }

        /* Navigation */
        .sign-nav {
          position: relative;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 5vw;
          background: rgba(10,10,12,0.6);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(212,175,55,0.2);
        }

        .nav-logo {
          font-family: 'Syne', sans-serif;
          font-size: 30px;
          font-weight: 800;
          letter-spacing: -1.5px;
          background: linear-gradient(135deg, var(--gold), var(--blue-neon), var(--violet));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-decoration: none;
          animation: shimmer 3s infinite;
        }

        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* Conteneur principal */
        .sign-container {
          position: relative;
          z-index: 15;
          min-height: calc(100vh - 85px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
        }

        /* Carte glassmorphique avec dégradé animé sur le bord */
        .sign-card {
          background: rgba(12, 12, 16, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(212,175,55,0.3);
          border-radius: 40px;
          padding: 48px 40px;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 30px 50px -20px black, 0 0 0 1px rgba(212,175,55,0.2) inset;
          transition: all 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1);
          animation: cardGlow 4s infinite alternate;
        }

        @keyframes cardGlow {
          0% { box-shadow: 0 30px 50px -20px black, 0 0 0 1px rgba(212,175,55,0.2) inset; border-color: rgba(212,175,55,0.3); }
          100% { box-shadow: 0 30px 60px -15px rgba(212,175,55,0.3), 0 0 0 2px rgba(0,212,255,0.3) inset; border-color: rgba(0,212,255,0.5); }
        }

        .sign-card:hover {
          transform: translateY(-6px) scale(1.01);
          border-color: var(--gold);
        }

        /* Personnalisation Clerk (couleurs vives) */
        .clerk-custom {
          --clerk-form-button-primary-background: linear-gradient(135deg, var(--gold), var(--gold-dark));
          --clerk-form-button-primary-color: #0A0A0C;
        }

        .clerk-sign-in {
          background: transparent !important;
          width: 100%;
        }

        .clerk-sign-in .cl-card {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
        }

        .clerk-sign-in .cl-headerTitle {
          color: var(--off-white) !important;
          font-family: 'Syne', sans-serif !important;
          font-size: 2rem !important;
          font-weight: 700 !important;
          letter-spacing: -0.5px !important;
          background: linear-gradient(135deg, var(--gold), var(--blue-neon));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent !important;
        }

        .clerk-sign-in .cl-headerSubtitle {
          color: rgba(244,241,236,0.8) !important;
          font-size: 0.9rem !important;
        }

        .clerk-sign-in .cl-formButtonPrimary {
          background: linear-gradient(135deg, var(--gold), var(--gold-dark)) !important;
          color: #0A0A0C !important;
          font-weight: 700 !important;
          border-radius: 60px !important;
          padding: 0.8rem !important;
          transition: all 0.3s ease !important;
          text-transform: uppercase !important;
          letter-spacing: 1px !important;
        }

        .clerk-sign-in .cl-formButtonPrimary:hover {
          background: linear-gradient(135deg, #E5C05A, #C9A142) !important;
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(212,175,55,0.4);
        }

        .clerk-sign-in .cl-socialButtonsBlockButton {
          background: rgba(20,20,30,0.7) !important;
          border: 1px solid rgba(212,175,55,0.4) !important;
          border-radius: 60px !important;
          color: var(--off-white) !important;
          transition: all 0.3s ease !important;
        }

        .clerk-sign-in .cl-socialButtonsBlockButton:hover {
          background: linear-gradient(135deg, rgba(212,175,55,0.2), rgba(0,212,255,0.2)) !important;
          border-color: var(--blue-neon) !important;
          transform: translateY(-2px);
        }

        .clerk-sign-in .cl-formFieldInput {
          background: rgba(8,8,12,0.8) !important;
          border: 1px solid rgba(212,175,55,0.4) !important;
          border-radius: 20px !important;
          color: var(--off-white) !important;
          padding: 12px 18px !important;
          transition: all 0.3s;
        }

        .clerk-sign-in .cl-formFieldInput:focus {
          border-color: var(--blue-neon) !important;
          box-shadow: 0 0 0 3px rgba(0,212,255,0.2) !important;
          outline: none;
        }

        .clerk-sign-in .cl-formFieldLabel {
          color: rgba(244,241,236,0.9) !important;
          font-weight: 500 !important;
        }

        .clerk-sign-in .cl-dividerLine {
          background: linear-gradient(90deg, transparent, var(--gold), var(--blue-neon), transparent) !important;
          height: 1px !important;
        }

        .clerk-sign-in .cl-dividerText {
          color: rgba(244,241,236,0.7) !important;
          background: rgba(10,10,12,0.8) !important;
          padding: 0 12px !important;
        }

        .clerk-sign-in .cl-footerActionLink {
          color: var(--blue-neon) !important;
          font-weight: 600;
          transition: color 0.2s;
        }

        .clerk-sign-in .cl-footerActionLink:hover {
          color: var(--gold) !important;
          text-decoration: underline;
        }

        @media (max-width: 640px) {
          .sign-card { padding: 32px 24px; max-width: 90%; }
        }
      `}</style>

      <div className="sign-root">
        {/* Vidéo background - chemin absolu depuis public */}
        <div className="sign-vid">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
           
          >
            <source src="/video/mm.mp4" type="video/mp4" />
            Votre navigateur ne supporte pas la vidéo.
          </video>
        </div>

        {/* Particules colorées animées */}
        <div className="particle" style={{ width: '300px', height: '300px', background: 'var(--gold)', top: '10%', left: '-5%', animationDuration: '18s' }}></div>
        <div className="particle" style={{ width: '200px', height: '200px', background: 'var(--blue-neon)', bottom: '15%', right: '-3%', animationDuration: '22s', animationDelay: '-5s' }}></div>
        <div className="particle" style={{ width: '250px', height: '250px', background: 'var(--violet)', top: '60%', left: '80%', animationDuration: '25s' }}></div>
        <div className="particle" style={{ width: '180px', height: '180px', background: 'var(--rose)', top: '30%', right: '20%', animationDuration: '20s', animationDelay: '-10s' }}></div>

        <nav className="sign-nav">
          <Link href="/" className="nav-logo">
            irNas
          </Link>
        </nav>

        <div className="sign-container">
          <div className="sign-card clerk-custom">
           <SignIn 
  appearance={{
  elements: {
    rootBox: "clerk-sign-in",
    card: "cl-card",
    headerTitle: "cl-headerTitle",
    headerSubtitle: "cl-headerSubtitle",
    formButtonPrimary: "cl-formButtonPrimary",
    socialButtonsBlockButton: "cl-socialButtonsBlockButton",
    formFieldInput: "cl-formFieldInput",
    formFieldLabel: "cl-formFieldLabel",
    dividerLine: "cl-dividerLine",
    dividerText: "cl-dividerText",
    footerActionLink: "cl-footerActionLink",
  },
  options: {
    socialButtonsVariant: "blockButton",
  }
}}
 fallbackRedirectUrl="/"
/>
          </div>
        </div>
      </div>
    </>
  );
}