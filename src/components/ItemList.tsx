import { Package, Lock } from "lucide-react";
import { useGameStore } from "../store/gameStore";
import { ItemCard } from "./ItemCard";

export const ItemList = () => {
  const { items, vendorLevel } = useGameStore();

  const unlockedItems = items.filter((item) => item.unlockLevel <= vendorLevel);
  const availableItems = unlockedItems.filter((item) => !item.isSold);
  const soldItems = unlockedItems.filter((item) => item.isSold);
  const lockedItems = items.filter((item) => item.unlockLevel > vendorLevel);

  return (
    <div className="bg-amber-50 rounded-2xl p-6 shadow-inner">
      <div className="flex items-center gap-2 mb-4">
        <Package className="w-6 h-6 text-amber-700" />
        <h2 className="text-xl font-bold text-amber-900">我的商品</h2>
        <span className="bg-amber-200 text-amber-800 text-sm px-3 py-1 rounded-full font-medium">
          {availableItems.length} / {items.length}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>

      {soldItems.length > 0 && (
        <div className="mt-6 pt-4 border-t-2 border-amber-200 border-dashed">
          <p className="text-sm text-amber-600 mb-2">
            已售出 {soldItems.length} 件商品
          </p>
        </div>
      )}

      {lockedItems.length > 0 && (
        <div className="mt-4 p-3 bg-gray-100 rounded-xl">
          <div className="flex items-center gap-2 text-gray-600">
            <Lock className="w-4 h-4" />
            <p className="text-sm">
              还有 <strong>{lockedItems.length}</strong> 件商品待解锁，提升摊主等级即可解锁更多商品~
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
