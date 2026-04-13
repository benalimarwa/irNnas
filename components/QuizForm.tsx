"use client";

import { useState } from "react";
import { Button } from "./ui/Button";

const styles = ["floral", "fruité", "boisé", "oriental", "frais", "épicé", "vanillé", "aquatique"];
const genders = ["homme", "femme", "enfant", "mixte"];

export default function QuizForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    gender: "",
    styles: [] as string[],
    occasion: "",
    intensity: "",
  });

  const next = () => setStep((s) => s + 1);
  const prev = () => setStep((s) => s - 1);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600">
          <span className={step >= 1 ? "font-bold text-black" : ""}>1. Genre</span>
          <span className={step >= 2 ? "font-bold text-black" : ""}>2. Notes préférées</span>
          <span className={step >= 3 ? "font-bold text-black" : ""}>3. Occasion</span>
          <span className={step >= 4 ? "font-bold text-black" : ""}>4. Intensité</span>
        </div>
        <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-black transition-all" style={{ width: `${(step / 4) * 100}%` }} />
        </div>
      </div>

      {step === 1 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Pour qui est ce parfum ?</h2>
          <div className="grid grid-cols-2 gap-4">
            {genders.map((g) => (
              <Button
                key={g}
                variant={answers.gender === g ? "primary" : "outline"}
                size="lg"
                onClick={() => { setAnswers({ ...answers, gender: g }); next(); }}
              >
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Quelles notes aimez-vous ? (plusieurs choix)</h2>
          <div className="grid grid-cols-2 gap-4">
            {styles.map((s) => (
              <Button
                key={s}
                variant={answers.styles.includes(s) ? "primary" : "outline"}
                onClick={() => setAnswers({
                  ...answers,
                  styles: answers.styles.includes(s)
                    ? answers.styles.filter(x => x !== s)
                    : [...answers.styles, s]
                })}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Button>
            ))}
          </div>
          <div className="mt-8 flex justify-between">
            <Button variant="ghost" onClick={prev}>Précédent</Button>
            <Button onClick={next} disabled={answers.styles.length === 0}>
              Suivant
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Pour quelle occasion ?</h2>
          {["Quotidien", "Soirée", "Sport", "Travail", "Spécial"].map((o) => (
            <Button
              key={o}
              variant={answers.occasion === o ? "primary" : "outline"}
              className="block w-full mb-3 text-left"
              onClick={() => { setAnswers({ ...answers, occasion: o }); next(); }}
            >
              {o}
            </Button>
          ))}
          <Button variant="ghost" onClick={prev}>Précédent</Button>
        </div>
      )}

      {step === 4 && (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-6">Intensité souhaitée ?</h2>
          <div className="space-y-4">
            {["Léger (Eau fraîche)", "Modéré (Eau de toilette)", "Puissant (Eau de parfum)", "Très intense (Parfum)"].map((i, idx) => (
              <Button
                key={i}
                variant={answers.intensity === i ? "primary" : "outline"}
                className="w-full"
                onClick={() => {
                  const final = { ...answers, intensity: i };
                  onSubmit(final);
                }}
              >
                {i}
              </Button>
            ))}
          </div>
          <Button variant="ghost" onClick={prev} className="mt-4">Précédent</Button>
        </div>
      )}
    </div>
  );
}