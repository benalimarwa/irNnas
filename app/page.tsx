import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { 
  Sparkles, 
  ArrowRight, 
  LayoutDashboard, 
  Package, 
  LogIn, 
  UserPlus, 
  Flower2 
} from "lucide-react";
import VideoBackground from "@/components/VideoBackground";


export default async function Home() {
  const clerkUser = await currentUser();

  let isAdmin = false;
  let greeting = "Bienvenue sur ParfumIA";

  if (clerkUser) {
    greeting = `Bonjour ${clerkUser.firstName || "toi"} !`;
    isAdmin = clerkUser.publicMetadata?.role === "ADMIN" || false;
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center px-6 text-center">

      {/* VIDÉO EN ARRIÈRE-PLAN */}
      <div className="absolute inset-0 z-0">
        <VideoBackground/>
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/55 to-black/70" />
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen py-12">

        {/* Logo + Titre */}
        <div className="flex items-center gap-4 mb-10">
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-5 rounded-3xl shadow-2xl">
            <Sparkles className="w-14 h-14 text-white" />
          </div>
          <h1 className="text-6xl md:text-8xl font-extrabold bg-gradient-to-r from-purple-300 via-pink-300 to-rose-300 bg-clip-text text-transparent drop-shadow-2xl">
            ParfumIA
          </h1>
        </div>

        <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 drop-shadow-md">
          {greeting}
        </h2>

        <p className="text-xl md:text-2xl text-white/90 max-w-3xl mb-12 leading-relaxed">
          {isAdmin 
            ? "Accédez au tableau de bord pour gérer les produits, commandes et utilisateurs."
            : clerkUser 
            ? "Prête à trouver votre parfum idéal ? Lancez le quiz maintenant !"
            : "Découvrez votre parfum signature grâce à notre quiz intelligent et notre collection de luxe."
          }
        </p>

        {/* Boutons */}
        <div className="flex flex-col sm:flex-row gap-5 w-full max-w-md sm:max-w-none justify-center">
          {isAdmin ? (
            <>
              <Link
                href="/admin/dashboard"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg px-10 py-5 rounded-full shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3"
              >
                Tableau de bord
                <LayoutDashboard className="w-6 h-6" />
              </Link>
              <Link
                href="/admin/catalog"
                className="border-2 border-white/70 text-white font-bold text-lg px-10 py-5 rounded-full hover:bg-white/10 transition-all flex items-center justify-center gap-3"
              >
                Catalogue admin
                <Package className="w-6 h-6" />
              </Link>
            </>
          ) : clerkUser ? (
            <Link
              href="/client/quiz"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg px-12 py-5 rounded-full shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3"
            >
              Lancer le quiz
              <ArrowRight className="w-6 h-6" />
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="bg-white text-purple-700 hover:bg-white/90 font-bold text-lg px-10 py-5 rounded-full shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3"
              >
                Se connecter
                <LogIn className="w-6 h-6" />
              </Link>
              <Link
                href="/sign-up"
                className="border-2 border-white text-white hover:bg-white/10 font-bold text-lg px-10 py-5 rounded-full transition-all flex items-center justify-center gap-3"
              >
                Créer un compte
                <UserPlus className="w-6 h-6" />
              </Link>
              <Link
                href="/client/quiz"
                className="mt-4 sm:mt-0 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg px-10 py-5 rounded-full shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3"
              >
                Lancer le quiz
                <ArrowRight className="w-6 h-6" />
              </Link>
            </>
          )}
        </div>

        {!clerkUser && !isAdmin && (
          <div className="mt-10">
            <Link
              href="/catalogue"
              className="text-white/80 hover:text-white text-lg flex items-center gap-2 transition-colors underline-offset-4 hover:underline"
            >
              Voir la collection complète
              <Flower2 className="w-5 h-5" />
            </Link>
          </div>
        )}

        {/* Badges */}
        <div className="mt-16 text-sm text-white/70 flex flex-wrap justify-center gap-x-8 gap-y-2">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 text-2xl">★★★★★</span>
            <span>4.9/5</span>
          </div>
          <div>Livraison gratuite dès 50 TND</div>
          <div>+100 parfums de luxe</div>
        </div>

      </div>
    </div>
  );
}