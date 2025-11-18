
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { type CartItem, type Product } from '@/lib/products';
import { type Store } from '@/lib/types';


export interface CartState {
  items: CartItem[];
  store: Store | null;
  hasSeenWelcomeAnimation: boolean;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateItemQuantity: (productId: string, quantity: number) => void;
  setStore: (store: Store | null) => void;
  setHasSeenWelcomeAnimation: (seen: boolean) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}


export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      store: null,
      hasSeenWelcomeAnimation: false,
      addItem: (product) => {
        const existingItem = get().items.find((item) => item.id === product.id);
        if (existingItem) {
          set((state) => ({
            items: state.items.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          }));
        } else {
          set((state) => ({
            items: [{ ...product, quantity: 1 }, ...state.items],
          }));
        }
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
      },
      updateItemQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
        } else {
          set((state) => ({
            items: state.items.map((item) =>
              item.id === productId ? { ...item, quantity } : item
            ),
          }));
        }
      },
      setStore: (store) => {
        if (store && store.id !== get().store?.id) {
           get().clearCart();
        }
        set({ store });
      },
      setHasSeenWelcomeAnimation: (seen) => {
        set({ hasSeenWelcomeAnimation: seen });
      },
      clearCart: () => {
        set({ items: [] });
      },
      totalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      totalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      }
    }),
    {
      name: 'linea-cart-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
