"use client";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useRef } from "react";

export default function SignInPage() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(e => console.log("Autoplay bloqué:", e));
    }
  }, []);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=Instrument+Sans:wght@300;400;500;600;700&display=swap');

        html, body {
          margin: 0;
          padding: 0;
          overflow-x: hidden !important;
          width: 100%;
          max-width: 100%;
          background: #0A0A0C;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        :root {
          --ink: #0A0A0C;
          --off-white: #F4F1EC;
          --gold: #D4AF37;
          --gold-dark: #B8942E;
          --blue-neon: #00D4FF;
        }

        .sign-root {
          position: relative;
          min-height: 100vh;
          width: 100%;
          max-width: 100vw;
          font-family: 'Instrument Sans', sans-serif;
          background: var(--ink);
          overflow-x: hidden;
        }

        .sign-vid {
          position: fixed;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          width: 100%;
          height: 100%;
        }
        .sign-vid video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.4;
          filter: brightness(0.7) contrast(1.1) saturate(1.3);
        }

        .sign-overlay {
          position: fixed;
          inset: 0;
          background: radial-gradient(circle at 20% 30%, rgba(212,175,55,0.15), rgba(0,212,255,0.1), rgba(10,10,12,0.92));
          z-index: 1;
        }

        .sign-nav {
          position: relative;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 5vw;
          background: rgba(10,10,12,0.7);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(212,175,55,0.2);
          width: 100%;
          max-width: 100vw;
        }

        .nav-logo {
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -1.5px;
          background: linear-gradient(135deg, var(--gold), var(--blue-neon));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-decoration: none;
        }

        .sign-container {
          position: relative;
          z-index: 15;
          min-height: calc(100vh - 56px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px 48px;
          width: 100%;
        }

        .sign-card {
          background: rgba(12, 12, 16, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(212,175,55,0.35);
          border-radius: 24px;
          padding: 28px 20px;
          width: 100%;
          max-width: 360px;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.6);
          overflow: hidden;
        }

        @media (max-width: 480px) {
          .sign-card {
            padding: 20px 14px;
            border-radius: 18px;
            max-width: 94%;
          }
          .nav-logo { font-size: 18px; }
        }

        /* =========================================
           CLERK OVERRIDES — sélecteurs renforcés
           ========================================= */

        /* Card wrapper */
        .clerk-custom .cl-card,
        .clerk-custom [data-localization-key] .cl-card {
          background: transparent !important;
          padding: 0 !important;
          box-shadow: none !important;
          border: none !important;
        }

        /* Header */
        .clerk-custom .cl-headerTitle {
          color: var(--off-white) !important;
          font-family: 'Syne', sans-serif !important;
          font-size: 1.05rem !important;
          font-weight: 700 !important;
        }
        .clerk-custom .cl-headerSubtitle {
          color: rgba(244,241,236,0.5) !important;
          font-size: 0.7rem !important;
        }

        /* Labels */
        .clerk-custom .cl-formFieldLabel,
        .clerk-custom label {
          color: rgba(244,241,236,0.75) !important;
          font-weight: 500 !important;
          font-size: 0.7rem !important;
          margin-bottom: 3px !important;
        }

        /* ---- INPUTS ---- */
        .clerk-custom input[type="email"],
        .clerk-custom input[type="password"],
        .clerk-custom input[type="text"],
        .clerk-custom .cl-formFieldInput,
        .clerk-custom .cl-formFieldInput__emailAddress,
        .clerk-custom .cl-formFieldInput__password {
          background: rgba(8,8,12,0.85) !important;
          border: 1px solid rgba(212,175,55,0.4) !important;
          border-radius: 8px !important;
          color: #ffffff !important;
          caret-color: var(--gold) !important;
          padding: 0 10px !important;
          font-size: 0.78rem !important;
          height: 32px !important;
          min-height: 32px !important;
          max-height: 32px !important;
          line-height: 32px !important;
          width: 100% !important;
          box-shadow: none !important;
          outline: none !important;
          transition: border-color 0.2s, box-shadow 0.2s !important;
          -webkit-appearance: none !important;
          appearance: none !important;
        }
        .clerk-custom input[type="email"]:focus,
        .clerk-custom input[type="password"]:focus,
        .clerk-custom input[type="text"]:focus,
        .clerk-custom .cl-formFieldInput:focus {
          border-color: var(--blue-neon) !important;
          box-shadow: 0 0 0 2px rgba(0,212,255,0.15) !important;
        }
        .clerk-custom input::placeholder {
          color: rgba(255,255,255,0.35) !important;
          font-size: 0.72rem !important;
        }

        /* Wrapper du champ input (pour la hauteur globale) */
        .clerk-custom .cl-formFieldInputGroup {
          height: 32px !important;
          min-height: 32px !important;
        }

        /* Espacement entre champs */
        .clerk-custom .cl-formField {
          margin-bottom: 10px !important;
        }
        .clerk-custom .cl-formFields {
          gap: 0 !important;
        }

        /* ---- BOUTON CONTINUER ---- */
        .clerk-custom button[data-localization-key="formButtonPrimary"],
        .clerk-custom .cl-formButtonPrimary,
        .clerk-custom button.cl-formButtonPrimary {
          background: linear-gradient(135deg, var(--gold), var(--gold-dark)) !important;
          color: #0A0A0C !important;
          font-weight: 700 !important;
          border-radius: 60px !important;
          padding: 0 !important;
          text-transform: uppercase !important;
          letter-spacing: 1.2px !important;
          font-size: 0.72rem !important;
          height: 34px !important;
          min-height: 34px !important;
          max-height: 34px !important;
          line-height: 34px !important;
          width: 100% !important;
          border: none !important;
          cursor: pointer !important;
          transition: transform 0.2s, box-shadow 0.2s !important;
          margin-top: 6px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          box-shadow: none !important;
        }
        .clerk-custom .cl-formButtonPrimary:hover {
          background: linear-gradient(135deg, #E5C05A, #C9A142) !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 6px 16px rgba(212,175,55,0.3) !important;
        }

        /* ---- BOUTON GOOGLE / SOCIAUX ---- */
        .clerk-custom .cl-socialButtonsBlockButton,
        .clerk-custom button.cl-socialButtonsBlockButton,
        .clerk-custom [data-provider] {
          background: rgba(20,20,30,0.75) !important;
          border: 1px solid rgba(212,175,55,0.4) !important;
          border-radius: 60px !important;
          color: var(--off-white) !important;
          padding: 0 12px !important;
          font-size: 0.72rem !important;
          height: 32px !important;
          min-height: 32px !important;
          max-height: 32px !important;
          line-height: 32px !important;
          width: 100% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 8px !important;
          cursor: pointer !important;
          transition: background 0.2s, border-color 0.2s !important;
          box-shadow: none !important;
        }
        .clerk-custom .cl-socialButtonsBlockButton:hover {
          background: rgba(212,175,55,0.15) !important;
          border-color: var(--gold) !important;
        }
        /* Icône Google dans le bouton */
        .clerk-custom .cl-socialButtonsBlockButton__google svg,
        .clerk-custom .cl-socialButtonsBlockButton svg {
          width: 14px !important;
          height: 14px !important;
        }
        /* Texte du bouton social */
        .clerk-custom .cl-socialButtonsBlockButtonText {
          font-size: 0.72rem !important;
          font-weight: 500 !important;
        }

        /* Zone sociale */
        .clerk-custom .cl-socialButtonsBlock {
          margin-bottom: 0 !important;
        }
        .clerk-custom .cl-socialButtonsBlockButtons {
          gap: 6px !important;
        }

        /* Divider */
        .clerk-custom .cl-dividerLine {
          background: linear-gradient(90deg, transparent, var(--gold), var(--blue-neon), transparent) !important;
          height: 1px !important;
        }
        .clerk-custom .cl-dividerText {
          color: rgba(244,241,236,0.5) !important;
          background: rgba(10,10,12,0.8) !important;
          font-size: 0.65rem !important;
          padding: 0 8px !important;
        }
        .clerk-custom .cl-dividerRow {
          margin: 8px 0 !important;
        }

        /* Footer */
        .clerk-custom .cl-footerActionLink {
          color: var(--blue-neon) !important;
          font-size: 0.72rem !important;
          text-decoration: none !important;
        }
        .clerk-custom .cl-footerActionLink:hover { color: var(--gold) !important; }
        .clerk-custom .cl-footer {
          background: rgba(10,10,12,0.85) !important;
          border-top: 1px solid rgba(212,175,55,0.2) !important;
          border-radius: 0 0 18px 18px !important;
          padding: 8px 0 !important;
        }
        .clerk-custom .cl-footerText {
          color: rgba(244,241,236,0.4) !important;
          font-size: 0.62rem !important;
        }
        .clerk-custom .cl-formFieldAction {
          color: rgba(0,212,255,0.8) !important;
          font-size: 0.65rem !important;
        }
        .clerk-custom .cl-formFieldAction:hover { color: var(--gold) !important; }

        /* Errors */
        .clerk-custom .cl-formFieldErrorText {
          color: #FF2D75 !important;
          font-size: 0.65rem !important;
          margin-top: 2px !important;
        }
        .clerk-custom .cl-alert {
          background: rgba(255,45,117,0.1) !important;
          border: 1px solid #FF2D75 !important;
          color: var(--off-white) !important;
          padding: 6px 10px !important;
          font-size: 0.72rem !important;
          border-radius: 8px !important;
        }

        /* Badge */
        .clerk-custom .cl-badge {
          background: rgba(212,175,55,0.15) !important;
          color: var(--gold) !important;
          border: 1px solid rgba(212,175,55,0.3) !important;
          font-size: 0.52rem !important;
        }
      `}</style>

      <div className="sign-root">
        <div className="sign-vid">
          <video ref={videoRef} autoPlay muted loop playsInline preload="metadata">
            <source src="/video/mm.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="sign-overlay" />

        <nav className="sign-nav">
          <Link href="/" className="nav-logo">irNas</Link>
        </nav>

        <div className="sign-container">
          <div className="sign-card clerk-custom">
            <SignIn
              appearance={{
                elements: {
                  rootBox: "cl-signIn-root",
                  card: "cl-card",
                  headerTitle: "cl-headerTitle",
                  headerSubtitle: "cl-headerSubtitle",
                  formButtonPrimary: "cl-formButtonPrimary",
                  socialButtonsBlockButton: "cl-socialButtonsBlockButton",
                  socialButtonsBlockButtonText: "cl-socialButtonsBlockButtonText",
                  socialButtonsBlock: "cl-socialButtonsBlock",
                  socialButtonsBlockButtons: "cl-socialButtonsBlockButtons",
                  formFieldInput: "cl-formFieldInput",
                  formFieldInputGroup: "cl-formFieldInputGroup",
                  formFieldLabel: "cl-formFieldLabel",
                  formField: "cl-formField",
                  formFields: "cl-formFields",
                  dividerLine: "cl-dividerLine",
                  dividerText: "cl-dividerText",
                  dividerRow: "cl-dividerRow",
                  footerActionLink: "cl-footerActionLink",
                  footer: "cl-footer",
                  footerText: "cl-footerText",
                  badge: "cl-badge",
                  alert: "cl-alert",
                  formFieldErrorText: "cl-formFieldErrorText",
                  formFieldAction: "cl-formFieldAction",
                },
              }}
              fallbackRedirectUrl="/"
            />
          </div>
        </div>
      </div>
    </>
  );
}