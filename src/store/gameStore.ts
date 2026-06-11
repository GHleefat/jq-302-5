import { create } from "zustand";
import type {
  GameState,
  Item,
  TradeRecord,
  Notification,
  NotificationType,
} from "../types";
import { initialItems } from "../data/items";
import { getStallByLevel, stallLevels } from "../data/stalls";
import {
  calculateVendorLevel,
  getVendorLevel,
  getNextVendorLevel,
  getExpForLevel,
} from "../data/vendorLevels";
import {
  generateCustomer,
  calculateInitialOffer,
  generateCustomerMessage,
  generateCounterOffer,
  pickRandomItem,
} from "../utils/gameLogic";

interface GameActions {
  acceptOffer: () => void;
  rejectOffer: () => void;
  makeCounterOffer: (price: number) => void;
  upgradeStall: () => void;
  spawnCustomer: () => void;
  resetGame: () => void;
  setCounterOfferPrice: (price: number) => void;
  toggleCounterOffer: () => void;
  updateItemPrice: (itemId: string, newPrice: number) => void;
  addNotification: (
    type: NotificationType,
    title: string,
    message: string,
  ) => void;
  removeNotification: (id: string) => void;
  addExperience: (exp: number) => void;
  restockItem: (itemId: string) => void;
  restockAll: () => void;
}

type GameStore = GameState & GameActions;

const initialState: GameState = {
  money: 200,
  stallLevel: 1,
  vendorLevel: 1,
  experience: 0,
  items: [...initialItems],
  tradeHistory: [],
  currentCustomer: null,
  currentItem: null,
  currentOffer: 0,
  bargainingRound: 0,
  isNegotiating: false,
  customerMessage: "",
  showCounterOffer: false,
  counterOfferPrice: 0,
  notifications: [],
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  addNotification: (type: NotificationType, title: string, message: string) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const notification: Notification = { id, type, title, message };
    set((state) => ({
      notifications: [...state.notifications, notification],
    }));

    setTimeout(() => {
      get().removeNotification(id);
    }, 3500);
  },

  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  addExperience: (exp: number) => {
    const state = get();
    const newExp = state.experience + exp;
    const newLevel = calculateVendorLevel(newExp);

    if (newLevel > state.vendorLevel) {
      const vendorInfo = getVendorLevel(newLevel);
      set({
        experience: newExp,
        vendorLevel: newLevel,
      });
      get().addNotification(
        "success",
        "🎉 等级提升！",
        `恭喜升级到 ${vendorInfo.name}！解锁了新的商品和摊位~`,
      );
    } else {
      set({ experience: newExp });
    }
  },

  updateItemPrice: (itemId: string, newPrice: number) => {
    if (newPrice <= 0) return;

    set((state) => ({
      items: state.items.map((item) =>
        item.id === itemId ? { ...item, listPrice: newPrice } : item,
      ),
    }));

    const item = get().items.find((i) => i.id === itemId);
    if (item) {
      get().addNotification(
        "success",
        "标价已更新",
        `${item.name} 的新标价为 ¥${newPrice}`,
      );
    }
  },

  spawnCustomer: () => {
    const state = get();
    if (state.isNegotiating) return;

    const unlockedItems = state.items.filter(
      (item) => !item.isSold && item.unlockLevel <= state.vendorLevel,
    );
    const item = pickRandomItem(unlockedItems);
    if (!item) return;

    const stall = getStallByLevel(state.stallLevel);
    const customer = generateCustomer(item.listPrice, stall.priceBonus);
    const initialOffer = calculateInitialOffer(customer, item);
    const message = generateCustomerMessage(
      customer,
      item,
      initialOffer,
      1,
      true,
    );
    const priceMessage = generateCustomerMessage(
      customer,
      item,
      initialOffer,
      1,
      false,
    );

    set({
      currentCustomer: customer,
      currentItem: item,
      currentOffer: initialOffer,
      bargainingRound: 1,
      isNegotiating: true,
      customerMessage: `${message} ${priceMessage}`,
      showCounterOffer: false,
      counterOfferPrice: item.listPrice,
    });
  },

  acceptOffer: () => {
    const state = get();
    if (!state.currentCustomer || !state.currentItem) return;

    const profit = state.currentOffer - state.currentItem.costPrice;

    const record: TradeRecord = {
      id: `trade-${Date.now()}`,
      itemId: state.currentItem.id,
      itemName: state.currentItem.name,
      salePrice: state.currentOffer,
      profit,
      customerName: state.currentCustomer.name,
      customerEmoji: state.currentCustomer.emoji,
      timestamp: Date.now(),
    };

    set((state) => ({
      money: state.money + state.currentOffer,
      items: state.items.map((item) =>
        item.id === state.currentItem?.id ? { ...item, isSold: true } : item,
      ),
      tradeHistory: [record, ...state.tradeHistory],
      currentCustomer: null,
      currentItem: null,
      currentOffer: 0,
      bargainingRound: 0,
      isNegotiating: false,
      customerMessage: "",
      showCounterOffer: false,
    }));

    const expGained = Math.floor(state.currentOffer * 0.5 + profit * 0.5);
    get().addExperience(expGained);

    get().addNotification(
      "success",
      "🎉 交易成功！",
      `${state.currentItem.name} 以 ¥${state.currentOffer} 售出，利润 ¥${profit}${profit >= 0 ? " (+)" : " (-"}${Math.round((profit / state.currentItem.costPrice) * 100)}%`,
    );
  },

  rejectOffer: () => {
    const state = get();
    const itemName = state.currentItem?.name;
    const customerName = state.currentCustomer?.name;

    set({
      currentCustomer: null,
      currentItem: null,
      currentOffer: 0,
      bargainingRound: 0,
      isNegotiating: false,
      customerMessage: "",
      showCounterOffer: false,
    });

    if (itemName && customerName) {
      get().addNotification(
        "info",
        "生意没谈成",
        `${customerName}没有买下${itemName}，再等等其他顾客吧`,
      );
    }
  },

  makeCounterOffer: (price: number) => {
    const state = get();
    if (!state.currentCustomer || !state.currentItem) return;

    const result = generateCounterOffer(
      state.currentCustomer,
      state.currentItem,
      price,
      state.currentOffer,
      state.bargainingRound + 1,
    );

    if (result.accepted) {
      const profit = price - state.currentItem.costPrice;
      const record: TradeRecord = {
        id: `trade-${Date.now()}`,
        itemId: state.currentItem.id,
        itemName: state.currentItem.name,
        salePrice: price,
        profit,
        customerName: state.currentCustomer.name,
        customerEmoji: state.currentCustomer.emoji,
        timestamp: Date.now(),
      };

      set((state) => ({
        money: state.money + price,
        items: state.items.map((item) =>
          item.id === state.currentItem?.id ? { ...item, isSold: true } : item,
        ),
        tradeHistory: [record, ...state.tradeHistory],
        currentCustomer: null,
        currentItem: null,
        currentOffer: 0,
        bargainingRound: 0,
        isNegotiating: false,
        customerMessage: "成交！",
        showCounterOffer: false,
      }));

      const expGained = Math.floor(price * 0.5 + profit * 0.5);
      get().addExperience(expGained);

      get().addNotification(
        "success",
        "🎉 交易成功！",
        `${state.currentItem.name} 以 ¥${price} 售出，利润 ¥${profit}${profit >= 0 ? " (+)" : " (-"}${Math.round((profit / state.currentItem.costPrice) * 100)}%)`,
      );
    } else if (result.left) {
      const itemName = state.currentItem.name;
      const customerName = state.currentCustomer.name;

      set((state) => ({
        currentCustomer: null,
        currentItem: null,
        currentOffer: 0,
        bargainingRound: 0,
        isNegotiating: false,
        customerMessage: "顾客摇了摇头，走了...",
        showCounterOffer: false,
      }));

      get().addNotification(
        "warning",
        "顾客走了 😔",
        `${customerName}觉得价格不合适，没有买下${itemName}`,
      );

      setTimeout(() => {
        set({ customerMessage: "" });
      }, 2000);
    } else {
      const newRound = state.bargainingRound + 1;
      const message = generateCustomerMessage(
        state.currentCustomer,
        state.currentItem,
        result.newOffer,
        newRound,
        false,
      );

      set({
        currentOffer: result.newOffer,
        bargainingRound: newRound,
        customerMessage: message,
        showCounterOffer: false,
        counterOfferPrice: state.currentItem.listPrice,
      });
    }
  },

  upgradeStall: () => {
    const state = get();
    const nextLevel = state.stallLevel + 1;
    const nextStall = stallLevels.find((s) => s.level === nextLevel);

    if (!nextStall) {
      get().addNotification(
        "info",
        "已达最高级",
        "你的摊位已经是VIP专属区啦！",
      );
      return;
    }

    if (nextStall.unlockLevel > state.vendorLevel) {
      const vendorInfo = getVendorLevel(nextStall.unlockLevel);
      get().addNotification(
        "error",
        "等级不足",
        `需要达到 ${vendorInfo.name} 才能解锁此摊位，继续努力赚取经验吧！`,
      );
      return;
    }

    if (state.money < nextStall.cost) {
      get().addNotification(
        "error",
        "资金不足",
        `还差 ¥${nextStall.cost - state.money} 才能升级到${nextStall.name}`,
      );
      return;
    }

    set((state) => ({
      money: state.money - nextStall.cost,
      stallLevel: nextLevel,
    }));

    get().addNotification(
      "success",
      "🎊 摊位升级成功！",
      `恭喜升级到${nextStall.name}！客流+${Math.round(nextStall.customerRateBonus * 100)}%，售价+${Math.round(nextStall.priceBonus * 100)}%`,
    );
  },

  resetGame: () => {
    set({ ...initialState, items: [...initialItems] });
  },

  restockItem: (itemId: string) => {
    const state = get();
    const item = state.items.find((i) => i.id === itemId);

    if (!item || !item.isSold) return;

    if (state.money < item.costPrice) {
      get().addNotification(
        "error",
        "资金不足",
        `补货 ${item.name} 需要 ¥${item.costPrice}，还差 ¥${item.costPrice - state.money}`,
      );
      return;
    }

    set((state) => ({
      money: state.money - item.costPrice,
      items: state.items.map((i) =>
        i.id === itemId ? { ...i, isSold: false } : i,
      ),
    }));

    get().addNotification(
      "success",
      "📦 补货成功",
      `${item.name} 已补货完成，花费 ¥${item.costPrice}`,
    );
  },

  restockAll: () => {
    const state = get();
    const soldUnlockedItems = state.items.filter(
      (i) => i.isSold && i.unlockLevel <= state.vendorLevel,
    );

    if (soldUnlockedItems.length === 0) {
      get().addNotification("info", "无需补货", "所有商品都有货呢~");
      return;
    }

    const totalCost = soldUnlockedItems.reduce(
      (sum, i) => sum + i.costPrice,
      0,
    );

    if (state.money < totalCost) {
      get().addNotification(
        "error",
        "资金不足",
        `全部补货需要 ¥${totalCost}，还差 ¥${totalCost - state.money}`,
      );
      return;
    }

    set((state) => ({
      money: state.money - totalCost,
      items: state.items.map((item) =>
        item.isSold && item.unlockLevel <= state.vendorLevel
          ? { ...item, isSold: false }
          : item,
      ),
    }));

    get().addNotification(
      "success",
      "📦 全部补货成功",
      `补了 ${soldUnlockedItems.length} 件商品，共花费 ¥${totalCost}`,
    );
  },

  setCounterOfferPrice: (price: number) => {
    set({ counterOfferPrice: price });
  },

  toggleCounterOffer: () => {
    set((state) => ({ showCounterOffer: !state.showCounterOffer }));
  },
}));
