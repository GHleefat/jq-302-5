import type { VendorLevel } from "../types";

export const vendorLevels: VendorLevel[] = [
  {
    level: 1,
    name: "新手摊主",
    expRequired: 0,
    description: "初入跳蚤市场的新人",
    emoji: "🧑‍🌾",
    perks: ["解锁3种基础商品", "可使用街角小摊"],
  },
  {
    level: 2,
    name: "熟练摊主",
    expRequired: 500,
    description: "有一定经验的摊主",
    emoji: "🧑‍💼",
    perks: ["解锁3种进阶商品", "可升级到市场入口摊位", "顾客出价+5%"],
  },
  {
    level: 3,
    name: "资深摊主",
    expRequired: 1500,
    description: "市场中的老手",
    emoji: "👨‍💼",
    perks: ["解锁3种稀有商品", "可升级到中心摊位", "顾客出价+10%"],
  },
  {
    level: 4,
    name: "金牌摊主",
    expRequired: 4000,
    description: "市场中的佼佼者",
    emoji: "🏆",
    perks: ["解锁3种珍品商品", "可升级到黄金地段摊位", "顾客出价+15%"],
  },
  {
    level: 5,
    name: "传奇摊主",
    expRequired: 10000,
    description: "跳蚤市场的传奇人物",
    emoji: "👑",
    perks: ["全部商品解锁", "可升级到VIP专属区摊位", "顾客出价+25%", "客流量+20%"],
  },
];

export const getVendorLevel = (level: number): VendorLevel => {
  return vendorLevels.find((v) => v.level === level) || vendorLevels[0];
};

export const getNextVendorLevel = (currentLevel: number): VendorLevel | null => {
  return vendorLevels.find((v) => v.level === currentLevel + 1) || null;
};

export const getExpForLevel = (level: number): number => {
  const v = vendorLevels.find((vl) => vl.level === level);
  return v ? v.expRequired : 0;
};

export const calculateVendorLevel = (exp: number): number => {
  let level = 1;
  for (const v of vendorLevels) {
    if (exp >= v.expRequired) {
      level = v.level;
    }
  }
  return level;
};
