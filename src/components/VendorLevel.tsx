import { Star, Lock, Check, Zap } from "lucide-react";
import { useGameStore } from "../store/gameStore";
import {
  vendorLevels,
  getVendorLevel,
  getNextVendorLevel,
  getExpForLevel,
} from "../data/vendorLevels";
import { initialItems } from "../data/items";
import { stallLevels } from "../data/stalls";
import { cn } from "../lib/utils";

export const VendorLevel = () => {
  const { vendorLevel, experience } = useGameStore();

  const currentVendor = getVendorLevel(vendorLevel);
  const nextVendor = getNextVendorLevel(vendorLevel);
  const currentExpReq = getExpForLevel(vendorLevel);
  const nextExpReq = nextVendor ? getExpForLevel(nextVendor.level) : currentExpReq;
  const expProgress = nextVendor
    ? ((experience - currentExpReq) / (nextExpReq - currentExpReq)) * 100
    : 100;

  const unlockedItems = initialItems.filter((i) => i.unlockLevel <= vendorLevel);
  const totalItems = initialItems.length;

  const unlockedStalls = stallLevels.filter((s) => s.unlockLevel <= vendorLevel);
  const totalStalls = stallLevels.length;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Star className="w-6 h-6 text-yellow-500" />
        <h2 className="text-xl font-bold text-gray-800">摊主等级</h2>
      </div>

      <div className="bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 rounded-2xl p-5 mb-6 border border-amber-200">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-5xl">{currentVendor.emoji}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                Lv.{currentVendor.level}
              </span>
              <h3 className="font-bold text-lg text-gray-800">
                {currentVendor.name}
              </h3>
            </div>
            <p className="text-sm text-gray-600 mt-1">{currentVendor.description}</p>
          </div>
        </div>

        {nextVendor && (
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">经验值</span>
              <span className="text-amber-700 font-medium">
                {experience} / {nextExpReq}
              </span>
            </div>
            <div className="h-3 bg-amber-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(expProgress, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              距离下一级还需 {nextExpReq - experience} 经验
            </p>
          </div>
        )}

        {!nextVendor && (
          <div className="text-center py-2">
            <p className="text-amber-700 font-medium">🏆 已达最高等级！</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-blue-50 rounded-xl p-3 text-center">
          <p className="text-sm text-blue-600 mb-1">已解锁商品</p>
          <p className="text-lg font-bold text-blue-700">
            {unlockedItems.length}/{totalItems}
          </p>
        </div>
        <div className="bg-green-50 rounded-xl p-3 text-center">
          <p className="text-sm text-green-600 mb-1">已解锁摊位</p>
          <p className="text-lg font-bold text-green-700">
            {unlockedStalls.length}/{totalStalls}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {vendorLevels.map((level) => {
          const isCurrent = level.level === vendorLevel;
          const isUnlocked = level.level <= vendorLevel;
          const isNext = level.level === vendorLevel + 1;

          return (
            <div
              key={level.level}
              className={cn(
                "relative p-3 rounded-xl border-2 transition-all",
                isCurrent
                  ? "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-300"
                  : isUnlocked
                    ? "bg-green-50 border-green-200"
                    : "bg-gray-50 border-gray-200",
              )}
            >
              {isCurrent && (
                <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                  当前
                </div>
              )}

              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "text-3xl w-12 h-12 rounded-xl flex items-center justify-center",
                    isUnlocked ? "bg-white shadow-sm" : "bg-gray-200 opacity-50",
                  )}
                >
                  {isUnlocked ? (
                    level.emoji
                  ) : (
                    <Lock className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4
                      className={cn(
                        "font-bold text-sm",
                        isUnlocked ? "text-gray-800" : "text-gray-400",
                      )}
                    >
                      Lv.{level.level} {level.name}
                    </h4>
                    {isUnlocked && !isCurrent && (
                      <Check className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <p
                    className={cn(
                      "text-xs",
                      isUnlocked ? "text-gray-500" : "text-gray-400",
                    )}
                  >
                    {level.expRequired} 经验
                  </p>
                </div>
              </div>

              {isCurrent && (
                <div className="mt-2 pt-2 border-t border-amber-200">
                  <p className="text-xs text-amber-700 font-medium mb-1">
                    <Zap className="w-3 h-3 inline mr-1" />
                    当前特权：
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {level.perks.map((perk, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full"
                      >
                        {perk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {isNext && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-600 font-medium mb-1">
                    下一级解锁：
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {level.perks.map((perk, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full"
                      >
                        {perk}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-amber-50 rounded-xl">
        <p className="text-sm text-amber-700">
          💡 每完成一笔交易都能获得经验值，售价越高、利润越多，经验越多！
        </p>
      </div>
    </div>
  );
};
