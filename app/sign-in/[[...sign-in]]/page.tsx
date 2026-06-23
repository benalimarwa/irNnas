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

        * { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
          --ink: #0A0A0C;
          --off-white: #F4F1EC;
          --gold: #D4AF37;
        }

        .sign-root {
          position: relative;
          min-height: 100vh;
          font-family: 'Instrument Sans', sans-serif;
          background: var(--ink);
          overflow-x: hidden;
        }

        /* Vidéo Background */
        .sign-vid {
          position: fixed;
          inset: 0;
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

        .sign-overlay {
          position: fixed;
          inset: 0;
          background: radial-gradient(circle at 20% 30%, rgba(212,175,55,0.15), rgba(0,212,255,0.1), rgba(10,10,12,0.92));
          z-index: 1;
        }

        /* Navigation */
        .sign-nav {
          position: relative;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 5vw;
          background: rgba(10,10,12,0.7);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(212,175,55,0.2);
        }

        .nav-logo {
          font-family: 'Syne', sans-serif;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -1.5px;
          background: linear-gradient(135deg, var(--gold), #00D4FF);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        /* Conteneur principal - Bien centré */
        .sign-container {
          position: relative;
          z-index: 15;
          min-height: calc(100vh - 80px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px 80px;
        }

        /* Carte SignIn - Optimisée mobile */
        .sign-card {
          background: rgba(12, 12, 16, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(212,175,55,0.35);
          border-radius: 32px;
          padding: 40px 24px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.6);
        }

        @media (max-width: 480px) {
          .sign-card {
            padding: 32px 20px;
            border-radius: 24px;
            max-width: 92%;
          }
          
          .nav-logo {
            font-size: 24px;
          }
        }

        /* Personnalisation Clerk */
        .clerk-custom .cl-signIn-root {
          width: 100% !important;
        }
      `}</style>

      <div className="sign-root">
        {/* Vidéo */}
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

        {/* Navigation */}
        <nav className="sign-nav">
          <Link href="/" className="nav-logo">
            irNas
          </Link>
        </nav>

        {/* Contenu centré */}
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
                
              }}
              fallbackRedirectUrl="/"
            />
          </div>
        </div>
      </div>
    </>
  );
}