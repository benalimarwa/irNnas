// app/sign-up/[[...sign-up]]/page.tsx
"use client";
import "@/app/globals.css";
import { SignUp, useUser } from "@clerk/nextjs";
import { Users, Shield } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [selectedRole, setSelectedRole] = useState<"CLIENT" | "ADMIN">("CLIENT");
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(e => console.log("Autoplay bloqué:", e));
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user?.id || syncing) return;

    const syncAfterSignUp = async () => {
      setSyncing(true);
      try {
        const res = await fetch("/api/sync-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        if (data.success) {
          router.push(data.role === "ADMIN" ? "/admin" : "/client");
        } else {
          router.push("/client");
        }
      } catch (err) {
        console.error("Erreur sync:", err);
        router.push("/client");
      } finally {
        setSyncing(false);
      }
    };
    syncAfterSignUp();
  }, [isLoaded, isSignedIn, user?.id, router, syncing]);

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
        }

        .signup-root {
          position: relative;
          min-height: 100vh;
          font-family: 'Instrument Sans', sans-serif;
          background: var(--ink);
          overflow-x: hidden;
        }

        /* Vidéo */
        .signup-vid {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          overflow: hidden;
        }
        .signup-vid video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.35;
          filter: brightness(0.7) contrast(1.1) saturate(1.3);
        }
        .signup-vid::after {
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

        /* Particules */
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
        .signup-nav {
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

        /* Container */
        .signup-container {
          position: relative;
          z-index: 15;
          min-height: calc(100vh - 85px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
        }

        /* Carte */
        .signup-card {
          background: rgba(12, 12, 16, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(212,175,55,0.3);
          border-radius: 40px;
          padding: 48px 40px;
          width: 100%;
          max-width: 520px;
          box-shadow: 0 30px 50px -20px black;
          transition: all 0.4s;
          animation: cardGlow 4s infinite alternate;
        }
        @keyframes cardGlow {
          0% { box-shadow: 0 30px 50px -20px black, 0 0 0 1px rgba(212,175,55,0.2) inset; border-color: rgba(212,175,55,0.3); }
          100% { box-shadow: 0 30px 60px -15px rgba(212,175,55,0.3), 0 0 0 2px rgba(0,212,255,0.3) inset; border-color: rgba(0,212,255,0.5); }
        }

        /* Boutons de rôle avec couleurs distinctes */
        .role-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .role-btn {
          background: rgba(20,20,30,0.6);
          border: 1px solid rgba(212,175,55,0.4);
          border-radius: 28px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .role-btn.client.active {
          background: linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.05));
          border-color: var(--gold);
          box-shadow: 0 0 12px rgba(212,175,55,0.4);
        }
        .role-btn.admin.active {
          background: linear-gradient(135deg, rgba(0,212,255,0.25), rgba(0,212,255,0.05));
          border-color: var(--blue-neon);
          box-shadow: 0 0 12px rgba(0,212,255,0.4);
        }
        .role-btn.client .role-icon { color: var(--gold); }
        .role-btn.admin .role-icon { color: var(--blue-neon); }
        .role-btn span { font-weight: 600; font-size: 0.9rem; }
        .role-btn.client span { color: var(--gold); }
        .role-btn.admin span { color: var(--blue-neon); }

        /* ============================================ */
        /* Personnalisation Clerk - fond sombre forcé   */
        /* sur TOUS les écrans (form + vérification OTP)*/
        /* ============================================ */
        .clerk-sign-up {
          background: transparent !important;
          width: 100%;
        }

        /* Conteneurs principaux Clerk - on neutralise tous les fonds blancs */
        .clerk-sign-up .cl-rootBox,
        .clerk-sign-up .cl-cardBox,
        .clerk-sign-up .cl-card,
        .clerk-sign-up .cl-main,
        .clerk-sign-up .cl-form,
        .clerk-sign-up .cl-formContainer,
        .clerk-sign-up .cl-header,
        .clerk-sign-up [class*="cl-internal"] {
          background: transparent !important;
          box-shadow: none !important;
        }

        .clerk-sign-up .cl-card {
          padding: 0 !important;
        }
        .clerk-sign-up .cl-headerTitle,
        .clerk-sign-up .cl-headerSubtitle {
          display: none;
        }

        /* Champs de formulaire : texte en blanc */
        .clerk-sign-up .cl-formFieldInput {
          background: rgba(8,8,12,0.8) !important;
          border: 1px solid rgba(212,175,55,0.4) !important;
          border-radius: 20px !important;
          color: #ffffff !important;
          caret-color: var(--gold) !important;
          padding: 12px 18px !important;
          font-size: 0.95rem !important;
        }
        .clerk-sign-up .cl-formFieldInput::placeholder {
          color: rgba(255,255,255,0.5) !important;
        }
        .clerk-sign-up .cl-formFieldInput:focus {
          border-color: var(--blue-neon) !important;
          box-shadow: 0 0 0 3px rgba(0,212,255,0.2) !important;
        }
        .clerk-sign-up .cl-formFieldLabel {
          color: rgba(244,241,236,0.9) !important;
          font-weight: 500 !important;
        }

        /* Champs OTP (code de vérification par email) */
        .clerk-sign-up .cl-otpCodeField,
        .clerk-sign-up .cl-otpCodeFieldInputs {
          background: transparent !important;
        }
        .clerk-sign-up .cl-otpCodeFieldInput {
          background: rgba(8,8,12,0.8) !important;
          border: 1px solid rgba(212,175,55,0.4) !important;
          border-radius: 12px !important;
          color: #ffffff !important;
          caret-color: var(--gold) !important;
        }
        .clerk-sign-up .cl-otpCodeFieldInput:focus {
          border-color: var(--blue-neon) !important;
          box-shadow: 0 0 0 3px rgba(0,212,255,0.2) !important;
        }

        /* Bloc affichant l'email pendant la vérification */
        .clerk-sign-up .cl-identityPreview {
          background: rgba(20,20,30,0.6) !important;
          border: 1px solid rgba(212,175,55,0.3) !important;
          border-radius: 16px !important;
        }
        .clerk-sign-up .cl-identityPreviewText {
          color: var(--off-white) !important;
        }
        .clerk-sign-up .cl-identityPreviewEditButton {
          color: var(--blue-neon) !important;
        }

        /* Bouton principal */
        .clerk-sign-up .cl-formButtonPrimary {
          background: linear-gradient(135deg, var(--gold), var(--gold-dark)) !important;
          color: #0A0A0C !important;
          font-weight: 700 !important;
          border-radius: 60px !important;
          padding: 0.8rem !important;
          text-transform: uppercase !important;
          letter-spacing: 1px !important;
        }
        .clerk-sign-up .cl-formButtonPrimary:hover {
          background: linear-gradient(135deg, #E5C05A, #C9A142) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(212,175,55,0.3);
        }

        /* Boutons sociaux */
        .clerk-sign-up .cl-socialButtonsBlockButton {
          background: rgba(20,20,30,0.7) !important;
          border: 1px solid rgba(212,175,55,0.4) !important;
          border-radius: 60px !important;
          color: var(--off-white) !important;
        }
        .clerk-sign-up .cl-socialButtonsBlockButton:hover {
          background: rgba(212,175,55,0.15) !important;
          border-color: var(--gold);
        }

        /* Diviseur "ou" */
        .clerk-sign-up .cl-dividerLine {
          background: linear-gradient(90deg, transparent, var(--gold), var(--blue-neon), transparent) !important;
        }
        .clerk-sign-up .cl-dividerText {
          color: rgba(244,241,236,0.7) !important;
          background: rgba(10,10,12,0.8) !important;
        }

        /* Liens */
        .clerk-sign-up .cl-footerActionLink {
          color: var(--blue-neon) !important;
        }
        .clerk-sign-up .cl-footerActionLink:hover {
          color: var(--gold) !important;
        }
        .clerk-sign-up .cl-formResendCodeLink {
          color: var(--blue-neon) !important;
        }
        .clerk-sign-up .cl-formResendCodeLink:hover {
          color: var(--gold) !important;
        }

        /* Footer Clerk : "Secured by Clerk" + badge "Development mode" */
        .clerk-sign-up .cl-footer {
          background: rgba(10,10,12,0.85) !important;
          border-top: 1px solid rgba(212,175,55,0.2) !important;
          border-radius: 0 0 24px 24px !important;
        }
        .clerk-sign-up .cl-footerText,
        .clerk-sign-up .cl-internal-b3fm6y {
          color: rgba(244,241,236,0.5) !important;
        }
        .clerk-sign-up .cl-badge {
          background: rgba(212,175,55,0.15) !important;
          color: var(--gold) !important;
          border: 1px solid rgba(212,175,55,0.3) !important;
        }

        /* Messages d'erreur */
        .clerk-sign-up .cl-formFieldErrorText {
          color: var(--rose) !important;
        }
        .clerk-sign-up .cl-alert {
          background: rgba(255,45,117,0.1) !important;
          border: 1px solid var(--rose) !important;
          color: var(--off-white) !important;
        }

        @media (max-width: 640px) {
          .signup-card { padding: 32px 24px; }
        }
      `}</style>

      <div className="signup-root">
        <div className="signup-vid">
          <video ref={videoRef} autoPlay muted loop playsInline preload="auto">
            <source src="/video/mm.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="particle" style={{ width: '300px', height: '300px', background: 'var(--gold)', top: '10%', left: '-5%', animationDuration: '18s' }}></div>
        <div className="particle" style={{ width: '200px', height: '200px', background: 'var(--blue-neon)', bottom: '15%', right: '-3%', animationDuration: '22s' }}></div>
        <div className="particle" style={{ width: '250px', height: '250px', background: 'var(--violet)', top: '60%', left: '80%', animationDuration: '25s' }}></div>

        <nav className="signup-nav">
          <Link href="/" className="nav-logo">irNas</Link>
        </nav>

        <div className="signup-container">
          <div className="signup-card">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gold to-blue-neon bg-clip-text text-transparent">
                Créer un compte
              </h2>
              <p className="text-off-white/70 mt-2">Rejoignez la communauté irNas</p>
            </div>

            {/* Sélecteur de rôle avec couleurs personnalisées */}
            <div className="mb-6">
              <p className="text-center text-off-white/60 mb-3 text-sm">Vous êtes ?</p>
              <div className="role-buttons">
                <button
                  onClick={() => setSelectedRole("CLIENT")}
                  className={`role-btn client ${selectedRole === "CLIENT" ? "active" : ""}`}
                >
                  <Users className="w-6 h-6 role-icon" />
                  <span>Client</span>
                </button>
                <button
                  onClick={() => setSelectedRole("ADMIN")}
                  className={`role-btn admin ${selectedRole === "ADMIN" ? "active" : ""}`}
                >
                  <Shield className="w-6 h-6 role-icon" />
                  <span>Administrateur</span>
                </button>
              </div>
            </div>

            <SignUp
  unsafeMetadata={{ role: selectedRole }}
  appearance={{
    elements: {
      rootBox: "clerk-sign-up",
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
      identityPreview: "cl-identityPreview",
      identityPreviewText: "cl-identityPreviewText",
      identityPreviewEditButton: "cl-identityPreviewEditButton",
      otpCodeFieldInput: "cl-otpCodeFieldInput",
      formResendCodeLink: "cl-formResendCodeLink",
      footer: "cl-footer",
      footerText: "cl-footerText",
      badge: "cl-badge",
      alert: "cl-alert",
      formFieldErrorText: "cl-formFieldErrorText",
    },
    options: { socialButtonsVariant: "blockButton" }
  }}
  fallbackRedirectUrl="/"
/>

            <div className="mt-6 text-center">
              <p className="text-off-white/60 text-sm">
                Déjà membre ?{" "}
                <Link href="/sign-in" className="text-blue-neon hover:text-gold transition">
                  Se connecter
                </Link>
              </p>
              <Link href="/" className="inline-block mt-4 text-xs text-off-white/40 hover:text-off-white/70">
                ← Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}