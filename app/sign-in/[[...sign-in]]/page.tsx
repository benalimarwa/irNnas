"use client";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useRef } from "react";
import Image from "next/image";

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
        html, body {
          margin: 0;
          padding: 0;
          overflow-x: hidden !important;
          width: 100%;
          background: #0a1628;
        }
        * { box-sizing: border-box; }

        /* ── Clerk overrides ─────────────────────────────── */
        .clerk-wrap .cl-card {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .clerk-wrap .cl-rootBox,
        .clerk-wrap .cl-signIn-root {
          width: 100% !important;
        }
        .clerk-wrap .cl-headerTitle {
          color: #ffffff !important;
          font-size: 1.1rem !important;
          font-weight: 300 !important;
          letter-spacing: 0.1em !important;
        }
        .clerk-wrap .cl-headerSubtitle {
          color: #4a6a8a !important;
          font-size: 0.78rem !important;
        }
        .clerk-wrap .cl-formFieldLabel {
          color: #4a6a8a !important;
          font-size: 0.7rem !important;
          text-transform: uppercase !important;
          letter-spacing: 0.15em !important;
          font-weight: 300 !important;
        }
        .clerk-wrap .cl-formFieldInput {
          background: #0a1628 !important;
          border: 1px solid #1e3a5f !important;
          border-radius: 14px !important;
          color: #ffffff !important;
          font-size: 0.875rem !important;
          height: 44px !important;
          padding: 0 14px !important;
          transition: border-color 0.2s !important;
        }
        .clerk-wrap .cl-formFieldInput::placeholder {
          color: #2a3f6a !important;
        }
        .clerk-wrap .cl-formFieldInput:focus {
          border-color: rgba(59,130,246,0.5) !important;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1) !important;
          outline: none !important;
        }
        .clerk-wrap .cl-formButtonPrimary {
          background: #3b82f6 !important;
          border-radius: 50px !important;
          font-size: 0.72rem !important;
          font-weight: 400 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.2em !important;
          height: 46px !important;
          transition: background 0.2s, transform 0.2s !important;
          box-shadow: 0 4px 20px rgba(59,130,246,0.15) !important;
        }
        .clerk-wrap .cl-formButtonPrimary:hover {
          background: #2563eb !important;
          transform: translateY(-1px) !important;
        }
        .clerk-wrap .cl-socialButtonsBlockButton {
          background: #0f1f33 !important;
          border: 1px solid #1e3a5f !important;
          border-radius: 14px !important;
          color: #8aabca !important;
          font-size: 0.8rem !important;
          height: 42px !important;
          transition: border-color 0.2s !important;
        }
        .clerk-wrap .cl-socialButtonsBlockButton:hover {
          border-color: rgba(59,130,246,0.4) !important;
          color: #ffffff !important;
        }
        .clerk-wrap .cl-dividerLine {
          background: #1e3a5f !important;
        }
        .clerk-wrap .cl-dividerText {
          color: #4a6a8a !important;
          font-size: 0.72rem !important;
          background: #0f1f33 !important;
          padding: 0 10px !important;
        }
        .clerk-wrap .cl-footerActionLink {
          color: #3b82f6 !important;
          font-size: 0.8rem !important;
        }
        .clerk-wrap .cl-footerActionLink:hover {
          color: #60a5fa !important;
        }
        .clerk-wrap .cl-footer {
          background: transparent !important;
          border-top: 1px solid #1a2a44 !important;
          padding: 14px 0 !important;
        }
        .clerk-wrap .cl-footerText {
          color: #2a3f6a !important;
          font-size: 0.7rem !important;
        }
        .clerk-wrap .cl-formFieldErrorText {
          color: #f87171 !important;
          font-size: 0.72rem !important;
        }
        .clerk-wrap .cl-alert {
          background: rgba(248,113,113,0.08) !important;
          border: 1px solid rgba(248,113,113,0.3) !important;
          border-radius: 12px !important;
          color: #fca5a5 !important;
          font-size: 0.8rem !important;
        }
        .clerk-wrap .cl-identityPreviewText {
          color: #8aabca !important;
        }
        .clerk-wrap .cl-identityPreviewEditButton {
          color: #3b82f6 !important;
        }
        .clerk-wrap .cl-formResendCodeLink {
          color: #3b82f6 !important;
        }
      `}</style>

      <div className="min-h-screen bg-[#0a1628] text-white relative overflow-hidden">

        {/* Dot grid */}
        <div
          className="fixed inset-0 pointer-events-none opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(#3b82f6 0.8px,transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Glow blobs */}
        <div className="fixed top-[-120px] left-[-80px] w-[500px] h-[500px] bg-[#3b82f6]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="fixed bottom-[-100px] right-[-60px] w-[400px] h-[400px] bg-[#1e3a5f]/20 rounded-full blur-[100px] pointer-events-none" />

        {/* Video background */}
        <div className="fixed inset-0 z-0 overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="w-full h-full object-cover opacity-[0.08]"
          >
            <source src="/video/pp.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Navbar */}
        <header className="relative z-20 flex items-center justify-between px-6 md:px-10 py-5 border-b border-[#1e3a5f] bg-[#0a1628]/80 backdrop-blur-sm">
          <Link href="/" className="flex items-center gap-2 group">
            <Image
              src="/llogo.png"
              alt="IRNAS"
              width={120}
              height={40}
              className="object-contain h-9 w-auto transition-transform duration-300 group-hover:scale-105"
              priority
            />
            <span className="text-2xl font-light tracking-[0.2em] text-white group-hover:text-[#3b82f6] transition duration-300">
              IRNAS
            </span>
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#60a5fa]/50 font-light hidden sm:block">
              Fashion
            </span>
          </Link>

          <Link
            href="/client"
            className="text-[11px] uppercase tracking-[0.2em] text-[#4a6a8a] hover:text-[#3b82f6] transition font-light"
          >
            ← Retour
          </Link>
        </header>

        {/* Main */}
        <main className="relative z-10 flex min-h-[calc(100vh-73px)]">

          {/* LEFT — branding */}
          <div className="hidden lg:flex flex-col justify-center px-16 xl:px-24 flex-1">
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#3b82f6] font-light mb-4">
              Bienvenue
            </p>
            <h1 className="text-5xl xl:text-6xl font-light tracking-tight text-white leading-tight mb-6">
              Connectez-vous<br />
              à votre <span className="text-[#3b82f6]">espace</span>
            </h1>
            <p className="text-[#4a6a8a] font-light text-sm leading-relaxed max-w-sm">
              Accédez à vos commandes, gérez vos favoris et profitez d'une expérience shopping personnalisée.
            </p>

            {/* Decorative items */}
            <div className="mt-12 space-y-4 max-w-xs">
              {[
                { label: "Suivi de commandes en temps réel" },
                { label: "Accès à vos favoris sauvegardés" },
                { label: "Historique d'achats complet" },
              ].map(({ label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] flex-shrink-0" />
                  <span className="text-[#8aabca] text-xs font-light tracking-wide">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Vertical divider */}
          <div className="hidden lg:block w-px bg-[#1a2a44] self-stretch my-10" />

          {/* RIGHT — form */}
          <div className="flex flex-col justify-center items-center flex-1 px-6 py-12">
            <div className="w-full max-w-[400px]">

              {/* Card header */}
              <div className="mb-8 text-center lg:text-left">
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#4a6a8a] font-light mb-2">
                  Connexion
                </p>
                <h2 className="text-2xl font-light text-white tracking-tight">
                  Content de vous revoir
                </h2>
              </div>

              {/* Clerk form */}
              <div className="bg-[#0f1f33] border border-[#1a2a44] rounded-3xl p-7 hover:border-[#3b82f6]/20 transition clerk-wrap">
                <SignIn
                  appearance={{
                    elements: {
                      rootBox:                 "w-full",
                      card:                    "cl-card",
                      headerTitle:             "cl-headerTitle",
                      headerSubtitle:          "cl-headerSubtitle",
                      formButtonPrimary:       "cl-formButtonPrimary",
                      socialButtonsBlockButton:"cl-socialButtonsBlockButton",
                      formFieldInput:          "cl-formFieldInput",
                      formFieldLabel:          "cl-formFieldLabel",
                      dividerLine:             "cl-dividerLine",
                      dividerText:             "cl-dividerText",
                      footerActionLink:        "cl-footerActionLink",
                      footer:                  "cl-footer",
                      footerText:              "cl-footerText",
                      alert:                   "cl-alert",
                      formFieldErrorText:      "cl-formFieldErrorText",
                    },
                  }}
                  fallbackRedirectUrl="/"
                />
              </div>

              {/* Guest hint */}
              <p className="text-center text-[10px] text-[#2a3f6a] tracking-widest font-light mt-6 uppercase">
                Pas encore de compte ?{" "}
                <Link href="/sign-up" className="text-[#3b82f6] hover:text-[#60a5fa] transition">
                  S'inscrire
                </Link>
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 border-t border-[#1a2a44] py-6 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-light tracking-[0.2em] text-white">IRNAS</span>
              <span className="text-[9px] uppercase tracking-[0.4em] text-[#60a5fa]/50 font-light">Fashion</span>
            </div>
            <p className="text-[10px] text-[#2a3f6a] tracking-widest font-light">
              © 2026 IRNAS — Tous droits réservés
            </p>
            <div className="flex items-center gap-5 text-[10px] text-[#2a3f6a] tracking-widest font-light uppercase">
              <Link href="#" className="hover:text-[#3b82f6] transition">Mentions</Link>
              <Link href="#" className="hover:text-[#3b82f6] transition">Confidentialité</Link>
              <Link href="#" className="hover:text-[#3b82f6] transition">Contact</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}