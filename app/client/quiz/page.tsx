// app/quiz/page.tsx
"use client";

import { useState } from "react";
import { PerfumeCard } from "@/components/ParfumCard";
import { Loader2, Sparkles, ChevronLeft, ChevronRight, Heart, Star } from "lucide-react";
import { PerfumeWithHouse } from "@/types/perfume";

type Answers = {
  gender: string;
  styles: string[];
  occasion: string;
  intensity: string;
};

export default function QuizPage() {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Answers>({
    gender: "",
    styles: [],
    occasion: "",
    intensity: "",
  });
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<PerfumeWithHouse[]>([]);
  const [showResults, setShowResults] = useState(false);

  const updateAnswer = (key: keyof Answers, value: any) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const next = () => setStep(s => Math.min(s + 1, 4));
  const prev = () => setStep(s => Math.max(s - 1, 1));

  const submitQuiz = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gender: answers.gender,
          styles: answers.styles,
          occasion: answers.occasion,
          intensity: answers.intensity,
        }),
      });

      const data = await res.json();
      setRecommendations(data.recommendations || []);
      setShowResults(true);
    } catch (err) {
      alert("Erreur, réessayez");
    } finally {
      setLoading(false);
    }
  };

  // === RÉSULTATS ===
  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-6xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Vos parfums parfaits
          </h1>
          <p className="text-2xl text-gray-700 mb-12 flex items-center justify-center gap-3">
            Sélectionnés avec amour pour vous
          </p>

          {loading ? (
            <div className="flex flex-col items-center py-32">
              <Loader2 className="w-20 h-20 animate-spin text-purple-600" />
              <p className="mt-6 text-2xl font-medium text-purple-700">Magie en cours...</p>
            </div>
          ) : recommendations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
              {recommendations.map((perfume) => (
                <div key={perfume.id} className="transform hover:scale-105 transition duration-300">
                  <PerfumeCard perfume={perfume} />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-32 text-center">
              <p className="text-3xl text-gray-600 mb-8">Aucun parfum trouvé...</p>
              <button
                onClick={() => {
                  setShowResults(false);
                  setStep(1);
                  setAnswers({ gender: "", styles: [], occasion: "", intensity: "" });
                }}
                className="px-12 py-5 bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xl font-bold rounded-full shadow-2xl hover:shadow-pink-500/50 transition"
              >
                Recommencer le quiz
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // === QUIZ ===
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-purple-100">
      {/* HEADER LUXUEUX */}
      <header className="pt-12 pb-8 text-center">
        <div className="flex justify-center items-center gap-4 mb-6">
          <Sparkles className="w-12 h-12 text-pink-600 animate-pulse" />
          <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            ParfumIA
          </h1>
          <Sparkles className="w-12 h-12 text-purple-600 animate-pulse" />
        </div>
        <p className="text-2xl md:text-3xl font-bold text-gray-800 mt-4">
          Trouvez <span className="text-purple-600">votre signature olfactive</span> en 60 secondes
        </p>
      </header>

      <div className="max-w-4xl mx-auto px-6 pb-20">
        {/* BARRE DE PROGRESSION ULTRA VIVE */}
        <div className="relative h-4 bg-white/30 backdrop-blur rounded-full overflow-hidden shadow-lg mb-12">
          <div
            className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 transition-all duration-700"
            style={{ width: `${step * 25}%` }}
          />
          <div className="absolute inset-0 bg-white/20 animate-pulse" />
        </div>

        {/* STEP 1 – GENRE */}
        {step === 1 && (
          <div className="bg-white/70 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-pink-200">
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 mb-10 text-center">
              Pour qui cherchez-vous un parfum ?
            </h2>
            <div className="grid grid-cols-2 gap-8">
              {["Homme", "Femme", "Enfant", "Mixte"].map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    updateAnswer("gender", g.toLowerCase());
                    next();
                  }}
                  className={`group relative p-12 rounded-3xl font-bold text-2xl transition-all transform hover:scale-110 hover:-translate-y-4 shadow-xl ${
                    answers.gender === g.toLowerCase()
                      ? "bg-gradient-to-br from-pink-500 to-purple-600 text-white"
                      : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 hover:from-pink-100 hover:to-purple-100"
                  }`}
                >
                  <span className="relative z-10">{g}</span>
                  <div className="absolute inset-0 rounded-3xl bg-white/30 opacity-0 group-hover:opacity-100 transition" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2 – STYLES */}
        {step === 2 && (
          <div className="bg-white/70 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-purple-200">
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-10 text-center">
              Quelles notes vous font vibrer ?
            </h2>
            <div className="text-black grid grid-cols-2 sm:grid-cols-4 gap-6">
              {["floral", "fruité", "boisé", "oriental", "frais", "épicé", "vanillé", "aquatique"].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    const newStyles = answers.styles.includes(s)
                      ? answers.styles.filter(x => x !== s)
                      : [...answers.styles, s];
                    updateAnswer("styles", newStyles);
                  }}
                  className={`p-8 rounded-2xl font-bold text-lg transition-all transform hover:scale-110 ${
                    answers.styles.includes(s)
                      ? "bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-2xl"
                      : "bg-white/80 hover:bg-gradient-to-br hover:from-pink-100 hover:to-purple-100 border-2 border-purple-300"
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
            <div className="mt-12 flex justify-between">
              <button onClick={prev} className="flex items-center gap-3 text-purple-700 font-bold text-xl">
                <ChevronLeft size={28} /> Retour
              </button>
              <button
                onClick={next}
                disabled={answers.styles.length === 0}
                className="px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold text-xl disabled:opacity-50 shadow-xl hover:shadow-pink-500/50"
              >
                Suivant <ChevronRight className="inline ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 – OCCASION */}
        {step === 3 && (
          <div className="bg-white/70 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-indigo-200">
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-10 text-center">
              Pour quelle occasion ?
            </h2>
            <div className="text-black grid grid-cols-2 sm:grid-cols-4 gap-6">
              {["Quotidien", "Soirée", "Travail", "Sport", "Rendez-vous", "Spécial"].map((o) => (
                <button
                  key={o}
                  onClick={() => {
                    updateAnswer("occasion", o);
                    next();
                  }}
                  className={`w-full p-8 text-left rounded-2xl font-bold text-xl transition-all transform hover:scale-105 ${
                    answers.occasion === o
                      ? "bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-2xl"
                      : "bg-white/90 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 border-2 border-indigo-300"
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
            <button onClick={prev} className="mt-8 flex items-center gap-3 text-indigo-700 font-bold text-xl">
              <ChevronLeft size={28} /> Retour
            </button>
          </div>
        )}

        {/* STEP 4 – INTENSITÉ */}
        {step === 4 && (
          <div className="bg-white/70 backdrop-blur-xl p-12 rounded-3xl shadow-2xl border border-pink-300 text-center">
            <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-700 mb-12">
              Quelle intensité désirez-vous ?
            </h2>
            <div className="text-black grid grid-cols-2 sm:grid-cols-4 gap-6">
              {["Léger (Eau fraîche)", "Modéré (Eau de toilette)", "Puissant (Eau de parfum)", "Très intense (Parfum)"].map((i) => (
                <button
                  key={i}
                  onClick={() => {
                    updateAnswer("intensity", i);
                    submitQuiz();
                  }}
                  className="w-full p-10 rounded-3xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white font-black text-2xl hover:scale-105 transition shadow-2xl hover:shadow-purple-500/50"
                >
                  {i}
                </button>
              ))}
            </div>
            <button onClick={prev} className="mt-10 flex items-center gap-3 text-purple-700 font-bold text-xl mx-auto">
              <ChevronLeft size={28} /> Retour
            </button>
          </div>
        )}
      </div>
    </div>
  );
}