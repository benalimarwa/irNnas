// types/perfume.ts
export type PerfumeWithHouse = {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  category: string;
  style: string[];
  stock: number;
  imageUrl?: string | null;
  house: {
    id: number;
    name: string;
  };
};