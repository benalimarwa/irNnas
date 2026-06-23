"use client";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useRef } from "react";

export default function SignInPage() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=Instrument+Sans:wght@300;400;500;600;700&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        .sign-root {
          min-height: 100vh;
          font-family: 'Instrument Sans', sans-serif;
          background: #0A0A0C;
          overflow-x: hidden;
          width: 100%;
          position: relative;
        }

        .sign-vid {
          position: fixed;
          inset: 0;
          z-index: 0;
        }
        .sign-vid video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.35;
        }

        .sign-nav {
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

        .sign-container {
          position: relative;
          z-index: 15;
          min-height: calc(100vh - 80px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
        }

        .sign-card {
          background: rgba(12, 12, 16, 0.92);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(212,175,55,0.35);
          border-radius: 28px;
          padding: 2.5rem 1.75rem;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.5);
        }

        /* Centrage et adaptation Clerk */
        .clerk-sign-in {
          width: 100% !important;
        }

        .clerk-sign-in .cl-headerTitle {
          font-size: clamp(1.5rem, 5vw, 2rem) !important;
          text-align: center !important;
        }

        .clerk-sign-in .cl-formButtonPrimary {
          padding: 1rem !important;
          font-size: 1rem !important;
          border-radius: 9999px !important;
        }

        .clerk-sign-in .cl-formFieldInput {
          padding: 1rem 1.1rem !important;
          border-radius: 9999px !important;
          font-size: 1rem !important;
        }

        @media (max-width: 480px) {
          .sign-card {
            padding: 2rem 1.25rem;
            border-radius: 24px;
          }
        }
      `}</style>

      <div className="sign-root">
        <div className="sign-vid">
          <video ref={videoRef} autoPlay muted loop playsInline>
            <source src="/video/mm.mp4" type="video/mp4" />
          </video>
        </div>

        <nav className="sign-nav">
          <Link href="/" className="nav-logo">irNas</Link>
        </nav>

        <div className="sign-container">
          <div className="sign-card">
            <SignIn 
              appearance={{
                elements: {
                  rootBox: "clerk-sign-in",
                  card: "cl-card",
                  headerTitle: "cl-headerTitle",
                  formButtonPrimary: "cl-formButtonPrimary",
                  formFieldInput: "cl-formFieldInput",
                  socialButtonsBlockButton: "cl-socialButtonsBlockButton",
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