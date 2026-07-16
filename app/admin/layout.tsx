'use client';

import ClientNavbar from "@/components/ClientNavbar";
import { ClerkProvider } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { useSyncGuestCart } from "@/hooks/useSyncGuestCart";
import AdminNavbar from "@/components/AdminNavbar";
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    useSyncGuestCart();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((e) => console.log("Autoplay bloqué:", e));
    }
  }, []);

  return (
    <ClerkProvider>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@300;400;500;600;700&family=Syne:wght@500;600;700;800&display=swap');

        :root {
          --accent-gold: #D4AF37;
          --accent-coral: #FF6B6B;
          --accent-teal: #4ECDC4;
          --accent-rose: #FF85A1;
          --gradient-multi: linear-gradient(135deg, #D4AF37, #FF6B6B, #4ECDC4, #9B59B6);
          --glass-bg: rgba(17, 17, 17, 0.75);
          --glass-border: rgba(255, 255, 255, 0.08);
        }

        *, *::before, *::after { box-sizing: border-box; }

        body {
          margin: 0;
          background: #0A0A0A;
          color: #F8F6F2;
          font-family: 'Instrument Sans', system-ui, sans-serif;
        }

        /* ── Video layer ── */
        .client-video-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .client-video-bg video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.35;
          filter: brightness(0.7) contrast(1.1) saturate(1.2);
        }

        /* ── Colour overlay ── */
        .client-video-overlay {
          position: fixed;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background: radial-gradient(
            circle at 20% 30%,
            rgba(212, 175, 55, 0.15),
            rgba(0, 212, 255, 0.08),
            rgba(10, 10, 12, 0.92)
          );
        }

        /* ── Dot grid ── */
        .client-dot-grid {
          position: fixed;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background-image: radial-gradient(#D4AF37 0.8px, transparent 1px);
          background-size: 60px 60px;
          opacity: 0.08;
        }

        /* ── Everything above the background ── */
        .client-shell {
          position: relative;
          z-index: 10;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .client-main {
          flex: 1;
        }

        /* ── Shared glass utility ── */
        .glass-card {
          background: var(--glass-bg);
          backdrop-filter: blur(24px);
          border: 1px solid var(--glass-border);
          box-shadow: 0 8px 32px -12px rgba(0, 0, 0, 0.6);
        }

        /* ── Footer ── */
        .client-footer {
          position: relative;
          z-index: 10;
          text-align: center;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.4);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(10, 10, 10, 0.6);
          backdrop-filter: blur(12px);
          padding: 1.25rem 1rem;
        }
        .client-footer-links {
          margin-top: 0.6rem;
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          font-size: 0.75rem;
        }
        .client-footer-links a {
          color: rgba(255, 255, 255, 0.4);
          text-decoration: none;
          transition: color 0.2s;
        }
        .client-footer-links a:hover {
          color: #D4AF37;
        }
      `}</style>

      {/* Fixed video background */}
      <div className="client-video-bg">
       <video
  ref={videoRef}
  autoPlay
  muted
  loop
  playsInline
  preload="auto"
>
  {/* 👇 Mets ici le lien direct vers ta vidéo (n'importe quelle URL publique) */}
  <source
    src="https://assets.mixkit.co/videos/52270/52270-720.mp4"
    type="video/mp4"
  />
</video>
      </div>

      {/* Overlays */}
      <div className="client-video-overlay" />
      <div className="client-dot-grid" />

      {/* App shell */}
      <div>
        <AdminNavbar />

        <main>
          {children}
        </main>

        <footer>
          <p>© IRNAS</p>
          <div className="client-footer-links">
            <a href="/mentions-legales">Mentions légales</a>
            <a href="/confidentialite">Confidentialité</a>
            <a href="/contact">Contact</a>
          </div>
        </footer>
      </div>
    </ClerkProvider>
  );
}