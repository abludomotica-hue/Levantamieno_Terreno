import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { InspectionFormData } from '@/lib/validations/inspection'

interface DraftState {
  draft: Partial<InspectionFormData> | null
  lastSaved: string | null
  setDraft: (data: Partial<InspectionFormData>) => void
  clearDraft: () => void
}

export const useDraftStore = create<DraftState>()(
  persist(
    (set) => ({
      draft: null,
      lastSaved: null,
      setDraft: (data) => set({ 
        draft: data, 
        lastSaved: new Date().toISOString() 
      }),
      clearDraft: () => set({ draft: null, lastSaved: null }),
    }),
    {
      name: 'inspection-draft-storage',
    }
  )
)
