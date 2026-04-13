// app/sign-in/[[...sign-in]]/page.tsx
"use client";

import { SignIn } from "@clerk/nextjs";
import { Sparkles, Heart, Flower2, Wind } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-purple-50 dark:from-gray-900 dark:via-purple-950 dark:to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
     <video
    autoPlay
    loop
    muted
    playsInline
    preload="auto"           // Ajout important
    className="absolute inset-0 w-full h-full object-cover"
    style={{ objectPosition: 'center' }}
  >
    <source src="/video/femme.mp4" type="video/mp4" />
    Votre navigateur ne supporte pas la vidéo.
  </video>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-6xl opacity-20 dark:opacity-10 animate-float">
          <Sparkles className="w-16 h-16 text-purple-400" />
        </div>
        <div className="absolute bottom-32 right-20 text-6xl opacity-20 dark:opacity-10 animate-float-delayed">
          <Flower2 className="w-20 h-20 text-pink-400" />
        </div>
        <div className="absolute top-1/2 left-1/4 text-6xl opacity-10 dark:opacity-5 animate-float-slow">
          <Heart className="w-24 h-24 text-rose-400" />
        </div>
        <div className="absolute bottom-20 left-1/3 text-6xl opacity-20 dark:opacity-10 animate-float">
          <Wind className="w-16 h-16 text-blue-400" />
        </div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300 dark:bg-purple-600 rounded-full blur-3xl opacity-20 dark:opacity-10 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-300 dark:bg-pink-600 rounded-full blur-3xl opacity-20 dark:opacity-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden md:block space-y-8">
          <Link href="/" className="inline-flex items-center space-x-3 group">
            <Sparkles className="h-12 w-12 text-purple-600 dark:text-purple-400 group-hover:rotate-12 transition-transform duration-300" />
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                ParfumIA
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
                Votre parfum parfait vous attend
              </p>
            </div>
          </Link>

          <div className="space-y-6">
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-3xl p-6 border border-purple-100 dark:border-purple-900 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-3 shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                    Quiz IA Personnalisé
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    Découvrez votre parfum idéal grâce à notre intelligence artificielle
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-3xl p-6 border border-pink-100 dark:border-pink-900 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl p-3 shadow-lg">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                    Collection Exclusive
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    Accédez à plus de 100 parfums de luxe soigneusement sélectionnés
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-3xl p-6 border border-amber-100 dark:border-amber-900 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-3 shadow-lg">
                  <Flower2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                    Livraison Gratuite
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    Profitez de la livraison offerte dès 50€ d'achat
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-8 text-gray-600 dark:text-gray-400 text-sm font-semibold">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>1,247 membres actifs</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>4.9/5 étoiles</span>
            </div>
          </div>
        </div>

        {/* Right Side - Sign In Form */}
        <div className="flex flex-col items-center space-y-6">
          {/* Mobile Logo */}
          <div className="md:hidden text-center space-y-2">
            <Link href="/" className="inline-flex items-center space-x-3 group">
              <Sparkles className="h-10 w-10 text-purple-600 dark:text-purple-400 group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                ParfumIA
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 font-semibold">
              Connectez-vous à votre compte
            </p>
          </div>

          {/* Clerk Sign In Component */}
          <div className="w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-purple-100 dark:border-purple-900">
            <SignIn 
              appearance={{
                elements: {
                  formButtonPrimary: 
                    "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300",
                  card: "bg-transparent shadow-none",
                  headerTitle: "text-2xl font-black text-gray-900 dark:text-white",
                  headerSubtitle: "text-gray-600 dark:text-gray-400",
                  socialButtonsBlockButton: 
                    "border-2 border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-300",
                  formFieldInput: 
                    "border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 rounded-xl transition-all duration-300",
                  footerActionLink: "text-purple-600 dark:text-purple-400 hover:text-pink-600 dark:hover:text-pink-400 font-bold",
                }
              }}
            />
          </div>

          {/* Additional Info */}
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Pas encore de compte ?{" "}
            <Link 
              href="/sign-up" 
              className="text-purple-600 dark:text-purple-400 hover:text-pink-600 dark:hover:text-pink-400 font-bold transition-colors"
            >
              Créer un compte
            </Link>
          </p>

          <Link 
            href="/" 
            className="text-sm text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-semibold transition-colors"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-5deg); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-25px) scale(1.05); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 5s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}