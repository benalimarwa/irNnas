// app/sign-up-custom/page.tsx
"use client";
import "@/app/globals.css";
import { useSignUp } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Mail, Lock, User, Crown, Users, Loader2 } from "lucide-react";
import Link from "next/link";

export default function CustomSignUpPage() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const loading = fetchStatus === "fetching";

  // Gérer l'inscription
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const { error: signUpError } = await signUp.password({
        emailAddress: email,
        password,
        firstName,
        lastName,
        unsafeMetadata: {
          role: role, // Le rôle sera accessible dans le webhook
        },
      });

      if (signUpError) {
        console.error("Error:", signUpError);
        setError(signUpError.message ?? "Une erreur est survenue");
        return;
      }

      // Envoyer l'email de vérification
      await signUp.verifications.sendEmailCode();

      setPendingVerification(true);
    } catch (err: any) {
      console.error("Error:", err);
      setError(err?.message || "Une erreur est survenue");
    }
  };

  // Vérification du code email
  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await signUp.verifications.verifyEmailCode({ code });

      if (signUp.status === "complete") {
        await signUp.finalize({
          navigate: ({ session, decorateUrl }) => {
            if (session?.currentTask) {
              console.log(session.currentTask);
              return;
            }

            // Redirection selon le rôle choisi pendant l'inscription
            const target = role === "admin" ? "/admin" : "/client";
            const url = decorateUrl(target);

            if (url.startsWith("http")) {
              window.location.href = url;
            } else {
              router.push(url);
            }
          },
        });
      } else {
        console.error("Sign-up attempt not complete:", signUp);
        setError("Code invalide ou expiré");
      }
    } catch (err: any) {
      console.error("Erreur vérification:", err);
      setError(err?.message || "Code invalide ou expiré");
    }
  };

  // Formulaire de vérification email
  if (pendingVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-purple-50 dark:from-gray-900 dark:via-purple-950 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-purple-100 dark:border-purple-900">
          <div className="text-center mb-6">
            <div className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 rounded-full p-3 mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
              Vérifiez votre email
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Nous avons envoyé un code à <strong>{email}</strong>
            </p>
          </div>

          <form onSubmit={handleVerification} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Code de vérification
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-purple-500 dark:focus:border-purple-400 transition-all duration-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Vérification...
                </>
              ) : (
                "Vérifier"
              )}
            </button>

            <button
              type="button"
              onClick={() => signUp.verifications.sendEmailCode()}
              className="w-full text-sm text-purple-600 dark:text-purple-400 hover:underline"
            >
              Je n'ai pas reçu de code
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Formulaire d'inscription
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-purple-50 dark:from-gray-900 dark:via-purple-950 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 group mb-4">
            <Sparkles className="h-10 w-10 text-purple-600 dark:text-purple-400 group-hover:rotate-12 transition-transform duration-300" />
            <span className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              ParfumIA
            </span>
          </Link>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">
            Créer un compte
          </h2>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-purple-100 dark:border-purple-900">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type de compte */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Type de compte
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("user")}
                  className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-300 ${
                    role === "user"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                  }`}
                >
                  <Users className={`w-8 h-8 mb-2 ${role === "user" ? "text-blue-600" : "text-gray-400"}`} />
                  <span className={`font-bold text-sm ${role === "user" ? "text-blue-600" : "text-gray-600 dark:text-gray-400"}`}>
                    Client
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-300 ${
                    role === "admin"
                      ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-yellow-300"
                  }`}
                >
                  <Crown className={`w-8 h-8 mb-2 ${role === "admin" ? "text-yellow-600" : "text-gray-400"}`} />
                  <span className={`font-bold text-sm ${role === "admin" ? "text-yellow-600" : "text-gray-600 dark:text-gray-400"}`}>
                    Admin
                  </span>
                </button>
              </div>
            </div>

            {/* Prénom */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Prénom
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-purple-500 dark:focus:border-purple-400 transition-all duration-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>

            {/* Nom */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Nom
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-purple-500 dark:focus:border-purple-400 transition-all duration-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-purple-500 dark:focus:border-purple-400 transition-all duration-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
                {errors?.fields?.emailAddress && (
                  <p className="text-red-500 text-xs mt-1">{errors.fields.emailAddress.message}</p>
                )}
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-purple-500 dark:focus:border-purple-400 transition-all duration-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                  minLength={8}
                />
                {errors?.fields?.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.fields.password.message}</p>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer mon compte"
              )}
            </button>

            {/* Requis pour les flux d'inscription, la protection anti-bot Clerk est activée par défaut */}
            <div id="clerk-captcha" />
          </form>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
            Vous avez déjà un compte ?{" "}
            <Link 
              href="/sign-in" 
              className="text-purple-600 dark:text-purple-400 hover:text-pink-600 dark:hover:text-pink-400 font-bold transition-colors"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}