import { create } from 'zustand';

interface AuthModalState {
  isOpen: boolean;
  step: number;
  email: string;
  otp: string;
  name: string;
  mobile: string;
  gender: 'male' | 'female' | 'other' | null;
  role: 'tenant' | 'owner' | null;
  password?: string;
  hasPassword?: boolean;
  isExistingUser: boolean;
  openModal: () => void;
  closeModal: () => void;
  nextStep: () => void;
  prevStep: () => void;
  setField: (field: string, value: any) => void;
  reset: () => void;
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
  isOpen: false,
  step: 1,
  email: '',
  otp: '',
  name: '',
  mobile: '',
  gender: null,
  role: null,
  password: '',
  hasPassword: false,
  isExistingUser: false,
  
  openModal: () => set({ isOpen: true, step: 1 }),
  closeModal: () => set({ isOpen: false }),
  nextStep: () => set((state) => ({ step: state.step + 1 })),
  prevStep: () => set((state) => ({ step: Math.max(1, state.step - 1) })),
  setField: (field, value) => set({ [field]: value }),
  reset: () => set({ email: '', otp: '', name: '', mobile: '', password: '', hasPassword: false, gender: null, role: null, isExistingUser: false, step: 1 })
}));
