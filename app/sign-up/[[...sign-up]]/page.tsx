"use client";

import { SignUp } from "@clerk/nextjs";
import { Users, Shield } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function SignUpPage() {
  const [selectedRole, setSelectedRole] = useState<"CLIENT" | "ADMIN">("CLIENT");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=Instrument+Sans:wght@300;400;500;600;700&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        .signup-root {
          min-height: 100vh;
          font-family: 'Instrument Sans', sans-serif;
          background: #0A0A0C;
          overflow-x: hidden;
          width: 100%;
          position: relative;
        }

        .signup-vid {
          position: fixed;
          inset: 0;
          z-index: 0;
        }
        .signup-vid video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.35;
        }

        .signup-nav {
          position: relative;
          z-index: 20;
          padding: 1.25rem 5vw;
          background: rgba(10,10,12,0.9);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(212,175,55,0.2);
        }

        .nav-logo {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.6rem, 5.5vw, 2.1rem);
          font-weight: 800;
          background: linear-gradient(135deg, #D4AF37, #00D4FF, #B026FF);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .signup-container {
          position: relative;
          z-index: 15;
          min-height: calc(100vh - 80px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
        }

        .signup-card {
          background: rgba(12, 12, 16, 0.92);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(212,175,55,0.35);
          border-radius: 28px;
          padding: 2.5rem 1.75rem;
          width: 100%;
          max-width: 460px;
          box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.5);
        }

        .role-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin: 1.8rem 0;
        }

        .role-btn {
          padding: 1.1rem 0.8rem;
          border-radius: 20px;
          border: 1px solid rgba(212,175,55,0.4);
          background: rgba(20,20,30,0.6);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .role-btn.active {
          border-color: #D4AF37;
          background: rgba(212,175,55,0.15);
          box-shadow: 0 0 15px rgba(212,175,55,0.3);
        }

        .role-btn.admin.active {
          border-color: #00D4FF;
          background: rgba(0,212,255,0.12);
        }

        /* Clerk Styles */
        .clerk-sign-up {
          width: 100% !important;
        }

        .clerk-sign-up .cl-headerTitle,
        .clerk-sign-up .cl-headerSubtitle {
          display: none;
        }

        .clerk-sign-up .cl-formButtonPrimary {
          padding: 1rem !important;
          font-size: 1rem !important;
          border-radius: 9999px !important;
        }

        .clerk-sign-up .cl-formFieldInput {
          padding: 1rem 1.1rem !important;
          border-radius: 9999px !important;
          font-size: 1rem !important;
        }

        .clerk-sign-up .cl-otpCodeFieldInput {
          border-radius: 12px !important;
        }

        @media (max-width: 480px) {
          .signup-card {
            padding: 2rem 1.25rem;
            border-radius: 24px;
          }
          .role-btn {
            padding: 0.9rem 0.6rem;
          }
        }
      `}</style>

      <div className="signup-root">
        <div className="signup-vid">
          <video autoPlay muted loop playsInline>
            <source src="/video/mm.mp4" type="video/mp4" />
          </video>
        </div>

        <nav className="signup-nav">
          <Link href="/" className="nav-logo">irNas</Link>
        </nav>

        <div className="signup-container">
          <div className="signup-card">
            <div className="text-center mb-6">
              <h2 style={{ fontSize: 'clamp(1.6rem, 5.5vw, 2.2rem)', fontWeight: 700, marginBottom: '0.5rem' }}>
                Créer un compte
              </h2>
              <p style={{ color: 'rgba(244,241,236,0.7)' }}>Rejoignez irNas</p>
            </div>

            {/* Sélecteur de rôle */}
            <div className="role-buttons">
              <button
                onClick={() => setSelectedRole("CLIENT")}
                className={`role-btn ${selectedRole === "CLIENT" ? "active" : ""}`}
              >
                <Users size={28} />
                <span>Client</span>
              </button>

              <button
                onClick={() => setSelectedRole("ADMIN")}
                className={`role-btn ${selectedRole === "ADMIN" ? "active" : ""}`}
              >
                <Shield size={28} />
                <span>Administrateur</span>
              </button>
            </div>

            <SignUp 
              unsafeMetadata={{ role: selectedRole }}
              appearance={{
                elements: {
                  rootBox: "clerk-sign-up",
                  formButtonPrimary: "cl-formButtonPrimary",
                  formFieldInput: "cl-formFieldInput",
                  socialButtonsBlockButton: "cl-socialButtonsBlockButton",
                }
              }}
              fallbackRedirectUrl="/"
            />

            <div className="text-center mt-6 text-sm" style={{ color: 'rgba(244,241,236,0.7)' }}>
              Déjà un compte ?{" "}
              <Link href="/sign-in" style={{ color: "#00D4FF", fontWeight: 600 }}>
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}