// app/perfumes/page.tsx
import { PerfumeCard } from "@/components/ParfumCard";
import type { Product } from "@prisma/client";
import { getAllPerfumesGrouped } from "@/lib/perfumes";

export const dynamic = "force-dynamic";

type GroupedPerfumes = Record<string, Product[]>;

export default async function PerfumesPage() {
  const groupedPerfumes: GroupedPerfumes = await getAllPerfumesGrouped();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-12">
          Tous nos parfums
        </h1>

        {Object.entries(groupedPerfumes).length === 0 ? (
          <p className="text-center text-gray-600 text-xl">
            Aucun parfum disponible pour le moment
          </p>
        ) : (
          <div className="space-y-16">
            {Object.entries(groupedPerfumes).map(([groupName, perfumes]) => (
              <section key={groupName}>
                <h2 className="text-3xl font-bold mb-8 border-b-2 border-black pb-2 inline-block">
                  {groupName}
                  <span className="ml-4 text-lg font-normal text-gray-600">
                    ({perfumes.length})
                  </span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {perfumes.map((perfume) => (
                    <PerfumeCard key={perfume.id} perfume={perfume} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}