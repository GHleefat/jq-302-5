import { Package, Lock, RefreshCw } from "lucide-react";
import { useGameStore } from "../store/gameStore";
import { ItemCard } from "./ItemCard";
import { formatMoney } from "../utils/format";
import { cn } from "../lib/utils";

export const ItemList = () => {
  const { items, vendorLevel, money, restockAll } = useGameStore();

  const unlockedItems = items.filter((item) => item.unlockLevel <= vendorLevel);
  const availableItems = unlockedItems.filter((item) => !item.isSold);
  const soldItems = unlockedItems.filter((item) => item.isSold);
  const lockedItems = items.filter((item) => item.unlockLevel > vendorLevel);

  const restockCost = soldItems.reduce((sum, i) => sum + i.costPrice, 0);
  const canRestockAll = soldItems.length > 0 && money >= restockCost;

  const isSoldOut = availableItems.length === 0 && unlockedItems.length > 0;

  return (
    <div className="bg-amber-50 rounded-2xl p-6 shadow-inner">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Package className="w-6 h-6 text-amber-700" />
          <h2 className="text-xl font-bold text-amber-900">我的商品</h2>
          <span className="bg-amber-200 text-amber-800 text-sm px-3 py-1 rounded-full font-medium">
            {availableItems.length} / {items.length}
          </span>
        </div>

        {soldItems.length > 0 && (
          <button
            onClick={restockAll}
            disabled={!canRestockAll}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all",
              canRestockAll
                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 active:scale-95 shadow-lg shadow-green-200"
                : "bg-gray-300 text-gray-500 cursor-not-allowed",
            )}
          >
            <RefreshCw className="w-4 h-4" />
            全部补货 {formatMoney(restockCost)}
          </button>
        )}
      </div>

      {isSoldOut && (
        <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-center">
          <p className="text-red-700 font-bold text-lg mb-1">
            🛒 商品已售罄！
          </p>
          <p className="text-red-600 text-sm">
            点击上方「全部补货」或单件商品的「补货」按钮继续开张做生意~
          </p>
        </div>
      )}

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
