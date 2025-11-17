import React, { createContext, useContext, ReactNode } from 'react';
import { useStorage } from '@/hooks/useStorage';
import { Patient, Chair, VisitHistory, ClinicStats } from '@/types';

interface AppContextType {
  // Data
  patients: Patient[];
  chairs: Chair[];
  visitHistory: VisitHistory[];
  loading: boolean;
  
  // Patient methods
  addPatient: (patientData: Omit<Patient, 'id' | 'numeroVisita' | 'fechaCreacion' | 'fechaActualizacion'>) => Promise<Patient>;
  updatePatient: (patientId: string, updates: Partial<Patient>) => Promise<void>;
  
  // Chair methods
  assignPatientToChair: (patientId: string, chairId: string) => Promise<void>;
  releaseChair: (chairId: string) => Promise<any>;
  addChair: () => Promise<Chair>;
  deleteChair: (chairId: string) => Promise<void>;
  updateChair: (chairId: string, updates: Partial<Chair>) => Promise<void>;
  
  // History methods
  getPatientHistory: (patientId: string) => VisitHistory[];
  
  // Stats methods
  getClinicStats: () => ClinicStats;
  
  // Utility methods
  loadData: () => Promise<void>;

  // Backup methods
  exportData: () => Promise<string>;
  importData: (jsonData: string) => Promise<void>;
  clearAllData: () => Promise<void>;

  // Report export methods
  exportChairUsageReport: () => string;
  exportChairUsageCSV: () => string;
  exportChairUsageExcel: () => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const storage = useStorage();

  return (
    <AppContext.Provider value={storage}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
