export default function Footer() {
    return (
        <footer className="border-t border-[#1a2a44] py-10 px-6 relative z-10">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                    <span className="text-lg font-light tracking-[0.2em] text-white">IRNAS</span>
                    <span className="text-[10px] uppercase tracking-[0.4em] text-[#60a5fa]/50 font-light">Fashion</span>
                </div>

                <p className="text-[10px] text-[#4a6a8a] tracking-widest font-light">© 2020 IRNAS — Tous droits réservés</p>
                   <p className="text-[10px] text-[#4a6a8a] tracking-widest font-light">27888827</p>


                <div className="flex items-center gap-3">
                    <a
                        href="https://www.instagram.com/irnnas_/"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram"
                        className="flex items-center justify-center w-10 h-10 rounded-full border border-[#1e3a5f] text-[#8aabca] hover:text-white hover:border-[#3b82f6] hover:bg-[#3b82f6]/10 transition"
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path d="M12 2c-2.716 0-3.056.012-4.123.06-1.064.049-1.791.218-2.428.465a4.902 4.902 0 0 0-1.771 1.153A4.902 4.902 0 0 0 2.525 5.45c-.247.637-.416 1.364-.465 2.428C2.012 8.944 2 9.284 2 12s.012 3.056.06 4.123c.049 1.064.218 1.791.465 2.428a4.902 4.902 0 0 0 1.153 1.771 4.902 4.902 0 0 0 1.771 1.153c.637.247 1.364.416 2.428.465C8.944 21.988 9.284 22 12 22s3.056-.012 4.123-.06c1.064-.049 1.791-.218 2.428-.465a4.902 4.902 0 0 0 1.771-1.153 4.902 4.902 0 0 0 1.153-1.771c.247-.637.416-1.364.465-2.428.048-1.067.06-1.407.06-4.123s-.012-3.056-.06-4.123c-.049-1.064-.218-1.791-.465-2.428a4.902 4.902 0 0 0-1.153-1.771A4.902 4.902 0 0 0 18.551 2.525c-.637-.247-1.364-.416-2.428-.465C15.056 2.012 14.716 2 12 2Zm0 1.802c2.67 0 2.987.01 4.042.058.976.045 1.505.207 1.858.344.467.182.8.399 1.15.748.35.35.566.683.748 1.15.137.353.3.882.344 1.858.048 1.055.058 1.372.058 4.042s-.01 2.987-.058 4.042c-.045.976-.207 1.505-.344 1.858a3.1 3.1 0 0 1-.748 1.15 3.1 3.1 0 0 1-1.15.748c-.353.137-.882.3-1.858.344-1.055.048-1.372.058-4.042.058s-2.987-.01-4.042-.058c-.976-.045-1.505-.207-1.858-.344a3.1 3.1 0 0 1-1.15-.748 3.1 3.1 0 0 1-.748-1.15c-.137-.353-.3-.882-.344-1.858-.048-1.055-.058-1.372-.058-4.042s.01-2.987.058-4.042c.045-.976.207-1.505.344-1.858.182-.467.399-.8.748-1.15.35-.35.683-.566 1.15-.748.353-.137.882-.3 1.858-.344 1.055-.048 1.372-.058 4.042-.058Zm0 3.063a5.135 5.135 0 1 0 0 10.27 5.135 5.135 0 0 0 0-10.27Zm0 8.468a3.333 3.333 0 1 1 0-6.666 3.333 3.333 0 0 1 0 6.666Zm6.538-8.671a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0Z"/>
                        </svg>
                    </a>
<a
                    
                        href="https://www.tiktok.com/@irnas_1?_r=1&_t=ZS-97tmExXINfh"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="TikTok"
                        className="flex items-center justify-center w-10 h-10 rounded-full border border-[#1e3a5f] text-[#8aabca] hover:text-white hover:border-[#3b82f6] hover:bg-[#3b82f6]/10 transition"
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6c0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64c0 3.33 2.76 5.7 5.69 5.7c3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48Z"/>
                        </svg>
                    </a>
                </div>
            </div>
        </footer>
    );
}