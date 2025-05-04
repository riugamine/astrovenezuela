import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Tipo para la información del cliente
export interface CustomerInfo {
  name: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  dni: string;
  agencyAddress?: string;
}

// Interface para el store
interface CustomerStore {
  customerInfo: CustomerInfo;
  setCustomerInfo: (info: Partial<CustomerInfo>) => void;
  clearCustomerInfo: () => void;
}

// Creación del store con persistencia
export const useCustomerStore = create<CustomerStore>()(
  persist(
    (set) => ({
      customerInfo: {
        name: '',
        lastName: '',
        phone: '',
        email: '',
        address: '',
        dni: '',
      },
      setCustomerInfo: (info) =>
        set((state) => ({
          customerInfo: { ...state.customerInfo, ...info },
        })),
      clearCustomerInfo: () =>
        set({
          customerInfo: {
            name: '',
            lastName: '',
            phone: '',
            email: '',
            address: '',
            dni: '',
          },
        }),
    }),
    {
      name: 'customer-storage', // nombre para localStorage
    }
  )
);