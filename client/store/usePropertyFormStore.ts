import { create } from 'zustand';

interface LocationData {
  address: string;
  area: string;
  city: string;
  googleMapLink: string;
}

interface PreferencesData {
  bachelorAllowed: boolean;
  maxOccupants: string;
}

interface PropertyFormState {
  // Step 1: Basic
  title: string;
  rent: string;
  deposit: string;
  bhkType: string;
  
  // Step 2: Location
  location: LocationData;
  
  // Step 3: Preferences
  preferences: PreferencesData;
  moveInReady: boolean;
  
  // Step 4: Media
  images: File[];
  
  // Setters
  updateField: (field: string, value: any) => void;
  updateLocation: (field: keyof LocationData, value: string) => void;
  updatePreference: (field: keyof PreferencesData, value: any) => void;
  setImages: (newImages: File[]) => void;
  resetForm: () => void;
}

const initialState = {
  title: '', rent: '', deposit: '', bhkType: '',
  location: { address: '', area: '', city: '', googleMapLink: '' },
  preferences: { bachelorAllowed: true, maxOccupants: '1' },
  moveInReady: false,
  images: []
};

export const usePropertyFormStore = create<PropertyFormState>((set) => ({
  ...initialState,
  
  updateField: (field, value) => set((state) => ({ ...state, [field]: value })),
  
  updateLocation: (field, value) => set((state) => ({
    ...state,
    location: { ...state.location, [field]: value }
  })),
  
  updatePreference: (field, value) => set((state) => ({
    ...state,
    preferences: { ...state.preferences, [field]: value }
  })),
  
  setImages: (newImages) => set((state) => ({
     images: newImages.slice(0, 5) // Hard cap at 5 per rules
  })),

  resetForm: () => set(initialState)
}));
