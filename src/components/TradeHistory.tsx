import { History, TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { useGameStore } from "../store/gameStore";
import { formatMoney, formatTime } from "../utils/format";
import { cn } from "../lib/utils";

export const TradeHistory = () => {
  const { tradeHistory } = useGameStore();

  if (tradeHistory.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-6 h-6 text-amber-700" />
          <h2 className="text-xl font-bold text-gray-800">交易记录</h2>
        </div>
        <div className="text-center py-8 text-gray-400">
          <p>还没有交易记录</p>
          <p className="text-sm">等待第一位顾客吧~</p>
        </div>
      </div>
    );
  }

  const recentTrades = tradeHistory.slice(0, 5);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-6 h-6 text-amber-700" />
          <h2 className="text-xl font-bold text-gray-800">交易记录</h2>
          <span className="bg-amber-100 text-amber-700 text-sm px-3 py-1 rounded-full font-medium">
            {tradeHistory.length} 笔
          </span>
        </div>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
        {recentTrades.map((record, index) => {
          const isLatest = index === 0;
          return (
            <div
              key={record.id}
              className={cn(
                "relative flex items-center gap-3 p-3 rounded-xl transition-colors",
                isLatest
                  ? "bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-md"
                  : "bg-gray-50 hover:bg-gray-100",
              )}
            >
              {isLatest && (
                <div className="absolute -top-2 -right-2">
                  <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow">
                    ✨ 最新
                  </span>
                </div>
              )}
              <div className="text-3xl">{record.customerEmoji}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800 truncate">
                    {record.itemName}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {record.customerName} · {formatTime(record.timestamp)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-800">
                  {formatMoney(record.salePrice)}
                </p>
                <p
                  className={`text-sm flex items-center justify-end gap-0.5 ${
                    record.profit >= 0 ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {record.profit >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {record.profit >= 0 ? "+" : ""}
                  {formatMoney(record.profit)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {tradeHistory.length > 5 && (
        <p className="text-center text-xs text-gray-400 mt-3">
          还有 {tradeHistory.length - 5} 条历史记录
        </p>
      )}
    </div>
  );
};
