import { X } from "lucide-react";
import Image from "next/image";

type CartItemProps = {
  id: number;
  perfume: {
    id: number;
    name: string;
    price: number;
    house: { name: string };
  };
  quantity: number;
  onRemove: () => void;
  onUpdateQuantity: (qty: number) => void;
};

export function CartItem({ perfume, quantity, onRemove, onUpdateQuantity }: CartItemProps) {
  return (
    <div className="flex gap-4 py-4 border-b">
      <div className="relative w-24 h-24 shrink-0">
        <Image src={`/perfumes/${perfume.id}.jpg`} alt={perfume.name} fill className="object-cover rounded" />
      </div>

      <div className="flex-1">
        <h4 className="font-medium">{perfume.name}</h4>
        <p className="text-sm text-gray-600">{perfume.house.name}</p>
        <p className="font-semibold mt-1">{perfume.price.toFixed(2)} €</p>
      </div>

      <div className="flex items-center gap-3">
        <select
          value={quantity}
          onChange={(e) => onUpdateQuantity(Number(e.target.value))}
          className="border rounded px-2 py-1"
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <button onClick={onRemove} className="text-red-500 hover:text-red-700">
          <X size={20} />
        </button>
      </div>
    </div>
  );
}