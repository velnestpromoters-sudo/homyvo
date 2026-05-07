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

interface PgDetailsData {
  gender: 'boys' | 'girls' | 'co-living' | '';
  totalRooms: string;
  sharingTypes: number[];
  rooms: {
    sharing: number;
    totalBeds: string;
    availableBeds: string;
  }[];
}

interface ContactNumbersData {
  name: string;
  primary: string;
  alternate: string;
}

interface PropertyFormState {
  // Step 1: Basic
  propertyType: 'apartment' | 'pg';
  title: string;
  rent: string;
  deposit: string;
  bhkType: string;
  tenantNotes: string;
  
  // PG Specific
  pgDetails: PgDetailsData;

  // Step 2: Location
  location: LocationData;
  
  // Step 3: Preferences & Details
  preferences: PreferencesData;
  moveInReady: boolean;
  amenities: string[];
  furnishing: string;
  availability: string;
  availableFrom: string;
  contactNumbers: ContactNumbersData;
  
  // Step 4: Media
  images: File[];
  
  // Setters
  updateField: (field: string, value: any) => void;
  updateLocation: (field: keyof LocationData, value: string) => void;
  updatePreference: (field: keyof PreferencesData, value: any) => void;
  updatePgDetails: (field: keyof PgDetailsData, value: any) => void;
  updateContactNumbers: (field: keyof ContactNumbersData, value: string) => void;
  setImages: (newImages: File[]) => void;
  resetForm: () => void;
}

const initialState = {
  propertyType: 'apartment' as 'apartment' | 'pg',
  title: '', rent: '', deposit: '', bhkType: '', tenantNotes: '',
  pgDetails: {
    gender: '' as '',
    totalRooms: '',
    sharingTypes: [],
    rooms: []
  },
  location: { address: '', area: '', city: '', googleMapLink: '' },
  preferences: { bachelorAllowed: true, maxOccupants: '1' },
  moveInReady: false,
  amenities: [],
  furnishing: 'none',
  availability: 'immediate',
  availableFrom: '',
  contactNumbers: { name: '', primary: '', alternate: '' },
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

  updatePgDetails: (field, value) => set((state) => ({
    ...state,
    pgDetails: { ...state.pgDetails, [field]: value }
  })),

  updateContactNumbers: (field, value) => set((state) => ({
    ...state,
    contactNumbers: { ...state.contactNumbers, [field]: value }
  })),
  
  setImages: (newImages) => set((state) => ({
     images: newImages.slice(0, 5) // Hard cap at 5 per rules
  })),

  resetForm: () => set(initialState)
}));
