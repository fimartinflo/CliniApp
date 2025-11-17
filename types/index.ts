
export interface Patient {
  id: string;
  nombre: string;
  fechaNacimiento: string;
  tipoId: 'rut' | 'pasaporte';
  valorId: string;
  telefono?: string;
  correo?: string;
  historialMedico?: string;
  numeroVisita: number;
  sillaAsignada?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface Chair {
  id: string;
  estado: 'libre' | 'ocupado';
  pacienteId?: string;
  horaInicio?: string;
  horaFin?: string;
  duracion?: number; // in minutes
}

export interface VisitHistory {
  id: string;
  pacienteId: string;
  sillaId: string;
  fechaInicio: string;
  fechaFin: string;
  duracion: number; // in minutes
}

export interface FormErrors {
  [key: string]: string;
}

export interface PatientFormData {
  nombre: string;
  fechaNacimiento: string;
  tipoId: 'rut' | 'pasaporte';
  valorId: string;
  telefono: string;
  correo: string;
  historialMedico: string;
}

export interface ChairFormData {
  numeroSilla?: number;
  estado: 'libre' | 'ocupado';
}

export interface ClinicStats {
  totalPatients: number;
  totalChairs: number;
  occupiedChairs: number;
  freeChairs: number;
  averageSessionTime: number;
  patientsToday: number;
}