import { BarChart3, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Percent } from "lucide-react";
import { useGameStore } from "../store/gameStore";
import { formatMoney } from "../utils/format";
import { initialItems } from "../data/items";

interface ItemStat {
  itemId: string;
  itemName: string;
  itemEmoji: string;
  salesCount: number;
  totalRevenue: number;
  totalProfit: number;
  avgProfit: number;
}

export const FinancialAnalysis = () => {
  const { tradeHistory, items } = useGameStore();

  if (tradeHistory.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-800">财务分析</h2>
        </div>
        <div className="text-center py-8 text-gray-400">
          <p>暂无交易数据</p>
          <p className="text-sm">完成第一笔交易后查看分析~</p>
        </div>
      </div>
    );
  }

  const totalRevenue = tradeHistory.reduce((sum, r) => sum + r.salePrice, 0);
  const totalProfit = tradeHistory.reduce((sum, r) => sum + r.profit, 0);
  const totalCost = totalRevenue - totalProfit;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  const itemStatsMap = new Map<string, ItemStat>();

  tradeHistory.forEach((record) => {
    const existing = itemStatsMap.get(record.itemId);
    if (existing) {
      existing.salesCount += 1;
      existing.totalRevenue += record.salePrice;
      existing.totalProfit += record.profit;
      existing.avgProfit = existing.totalProfit / existing.salesCount;
    } else {
      const itemData = initialItems.find((i) => i.id === record.itemId);
      itemStatsMap.set(record.itemId, {
        itemId: record.itemId,
        itemName: record.itemName,
        itemEmoji: itemData?.emoji || "📦",
        salesCount: 1,
        totalRevenue: record.salePrice,
        totalProfit: record.profit,
        avgProfit: record.profit,
      });
    }
  });

  const itemStats = Array.from(itemStatsMap.values());
  const topBySales = [...itemStats].sort((a, b) => b.salesCount - a.salesCount).slice(0, 5);
  const topByProfit = [...itemStats].sort((a, b) => b.totalProfit - a.totalProfit).slice(0, 5);

  const unlockedItemCount = items.filter((i) => i.unlockLevel <= 1).length;
  const allItemCount = items.length;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-6 h-6 text-purple-600" />
        <h2 className="text-xl font-bold text-gray-800">财务分析</h2>
        <span className="bg-purple-100 text-purple-700 text-sm px-3 py-1 rounded-full font-medium">
          {tradeHistory.length} 笔
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-blue-600" />
            <p className="text-sm text-blue-600">总销售额</p>
          </div>
          <p className="text-xl font-bold text-blue-700">
            {formatMoney(totalRevenue)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCart className="w-4 h-4 text-orange-600" />
            <p className="text-sm text-orange-600">总成本</p>
          </div>
          <p className="text-xl font-bold text-orange-700">
            {formatMoney(totalCost)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <p className="text-sm text-green-600">净利润</p>
          </div>
          <p className={`text-xl font-bold ${totalProfit >= 0 ? "text-green-700" : "text-red-700"}`}>
            {totalProfit >= 0 ? "+" : ""}
            {formatMoney(totalProfit)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Percent className="w-4 h-4 text-purple-600" />
            <p className="text-sm text-purple-600">利润率</p>
          </div>
          <p className="text-xl font-bold text-purple-700">
            {profitMargin.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🏆</span>
          <h3 className="font-bold text-gray-800">热销商品 TOP5</h3>
        </div>
        <div className="space-y-2">
          {topBySales.map((stat, index) => (
            <div
              key={stat.itemId}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
            >
              <div className="w-6 h-6 flex items-center justify-center text-sm font-bold text-white bg-amber-500 rounded-full">
                {index + 1}
              </div>
              <div className="text-2xl">{stat.itemEmoji}</div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">
                  {stat.itemName}
                </p>
                <p className="text-xs text-gray-500">
                  售出 {stat.salesCount} 件
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-800">
                  {formatMoney(stat.totalRevenue)}
                </p>
                <p className={`text-xs ${stat.totalProfit >= 0 ? "text-green-600" : "text-red-500"}`}>
                  {stat.totalProfit >= 0 ? "+" : ""}
                  {formatMoney(stat.totalProfit)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">💰</span>
          <h3 className="font-bold text-gray-800">利润排行 TOP5</h3>
        </div>
        <div className="space-y-2">
          {topByProfit.map((stat, index) => (
            <div
              key={stat.itemId}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
            >
              <div className="w-6 h-6 flex items-center justify-center text-sm font-bold text-white bg-green-500 rounded-full">
                {index + 1}
              </div>
              <div className="text-2xl">{stat.itemEmoji}</div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">
                  {stat.itemName}
                </p>
                <p className="text-xs text-gray-500">
                  平均利润 {formatMoney(stat.avgProfit)}
                </p>
              </div>
              <div className="text-right">
                <p className={`font-bold ${stat.totalProfit >= 0 ? "text-green-700" : "text-red-600"}`}>
                  {stat.totalProfit >= 0 ? "+" : ""}
                  {formatMoney(stat.totalProfit)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
