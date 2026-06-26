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
          padding: 16px 5vw;
          background: rgba(10,10,12,0.7);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(212,175,55,0.2);
          width: 100%;
          max-width: 100vw;
        }

        .nav-logo {
          font-family: 'Syne', sans-serif;
          font-size: 24px;
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
          min-height: calc(100vh - 64px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 30px 20px 60px;
          width: 100%;
        }

        .sign-card {
          background: rgba(12, 12, 16, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(212,175,55,0.35);
          border-radius: 28px;
          padding: 32px 24px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.6);
          overflow: hidden;
        }

        @media (max-width: 480px) {
          .sign-card {
            padding: 24px 16px;
            border-radius: 20px;
            max-width: 94%;
          }
          .nav-logo {
            font-size: 20px;
          }
        }

        /* --- CLERK CUSTOM - VERSION PLUS COMPACTE --- */
        .clerk-custom .cl-signIn-root {
          width: 100% !important;
        }
        .clerk-custom .cl-card {
          background: transparent !important;
          padding: 0 !important;
        }

        /* Inputs plus petits */
        .clerk-custom .cl-formFieldInput {
          background: rgba(8,8,12,0.8) !important;
          border: 1px solid rgba(212,175,55,0.4) !important;
          border-radius: 14px !important;
          color: #ffffff !important;
          caret-color: var(--gold) !important;
          padding: 6px 12px !important;
          font-size: 0.82rem !important;
          height: 36px !important;
        }
        .clerk-custom .cl-formFieldInput::placeholder {
          color: rgba(255,255,255,0.5) !important;
          font-size: 0.78rem !important;
        }
        .clerk-custom .cl-formFieldInput:focus {
          border-color: var(--blue-neon) !important;
          box-shadow: 0 0 0 3px rgba(0,212,255,0.2) !important;
        }

        .clerk-custom .cl-formFieldLabel {
          color: rgba(244,241,236,0.8) !important;
          font-weight: 500 !important;
          font-size: 0.78rem !important;
          margin-bottom: 4px !important;
        }

        /* Bouton principal plus compact */
        .clerk-custom .cl-formButtonPrimary {
          background: linear-gradient(135deg, var(--gold), var(--gold-dark)) !important;
          color: #0A0A0C !important;
          font-weight: 700 !important;
          border-radius: 60px !important;
          padding: 0.5rem !important;
          text-transform: uppercase !important;
          letter-spacing: 1px !important;
          font-size: 0.83rem !important;
          height: 40px !important;
        }
        .clerk-custom .cl-formButtonPrimary:hover {
          background: linear-gradient(135deg, #E5C05A, #C9A142) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(212,175,55,0.3);
        }

        /* Bouton Google plus compact */
        .clerk-custom .cl-socialButtonsBlockButton {
          background: rgba(20,20,30,0.7) !important;
          border: 1px solid rgba(212,175,55,0.4) !important;
          border-radius: 60px !important;
          color: var(--off-white) !important;
          padding: 0.45rem !important;
          font-size: 0.8rem !important;
          height: 38px !important;
        }

        .clerk-custom .cl-dividerLine {
          background: linear-gradient(90deg, transparent, var(--gold), var(--blue-neon), transparent) !important;
        }
        .clerk-custom .cl-dividerText {
          color: rgba(244,241,236,0.6) !important;
          background: rgba(10,10,12,0.8) !important;
          font-size: 0.75rem !important;
          padding: 0 8px !important;
        }
        .clerk-custom .cl-footerActionLink {
          color: var(--blue-neon) !important;
          font-size: 0.8rem !important;
        }
        .clerk-custom .cl-footer {
          background: rgba(10,10,12,0.85) !important;
          border-top: 1px solid rgba(212,175,55,0.2) !important;
          border-radius: 0 0 20px 20px !important;
          padding: 12px 0 !important;
        }
        .clerk-custom .cl-footerText {
          color: rgba(244,241,236,0.4) !important;
          font-size: 0.7rem !important;
        }
        .clerk-custom .cl-badge {
          background: rgba(212,175,55,0.15) !important;
          color: var(--gold) !important;
          border: 1px solid rgba(212,175,55,0.3) !important;
          font-size: 0.6rem !important;
        }
        .clerk-custom .cl-formFieldErrorText {
          color: #FF2D75 !important;
          font-size: 0.75rem !important;
        }
        .clerk-custom .cl-alert {
          background: rgba(255,45,117,0.1) !important;
          border: 1px solid #FF2D75 !important;
          color: var(--off-white) !important;
          padding: 8px !important;
          font-size: 0.8rem !important;
        }

        /* Espacement réduit entre les champs */
        .clerk-custom .cl-formField {
          margin-bottom: 0.6rem !important;
        }
      `}</style>

      <div className="sign-root">
        <div className="sign-vid">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          >
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
                  formButtonPrimary: "cl-formButtonPrimary",
                  socialButtonsBlockButton: "cl-socialButtonsBlockButton",
                  formFieldInput: "cl-formFieldInput",
                  formFieldLabel: "cl-formFieldLabel",
                  dividerLine: "cl-dividerLine",
                  dividerText: "cl-dividerText",
                  footerActionLink: "cl-footerActionLink",
                  footer: "cl-footer",
                  footerText: "cl-footerText",
                  badge: "cl-badge",
                  alert: "cl-alert",
                  formFieldErrorText: "cl-formFieldErrorText",
                  formField: "cl-formField",
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