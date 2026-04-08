import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WishlistItem {
  _id: string;
  title: string;
  price: number;
  img: string;
  typeStr: string;
}

interface WishlistState {
  wishlist: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlist: [],
      addToWishlist: (item) => set((state) => {
        if (!state.wishlist.find(x => x._id === item._id)) {
          return { wishlist: [...state.wishlist, item] };
        }
        return state;
      }),
      removeFromWishlist: (id) => set((state) => ({
        wishlist: state.wishlist.filter(item => item._id !== id)
      })),
      isInWishlist: (id) => get().wishlist.some(item => item._id === id),
    }),
    {
      name: 'homyvo-wishlist-storage', // unique name for localStorage key
    }
  )
);
