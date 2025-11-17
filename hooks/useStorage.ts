import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Patient, Chair, VisitHistory, ClinicStats } from '@/types';

const STORAGE_KEYS = {
  PATIENTS: '@cliniapp_patients',
  CHAIRS: '@cliniapp_chairs',
  VISIT_HISTORY: '@cliniapp_visit_history',
  PATIENT_COUNTER: '@cliniapp_patient_counter',
};

// Función auxiliar para formatear duración - DEBE ESTAR AL PRINCIPIO
const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

export const useStorage = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [chairs, setChairs] = useState<Chair[]>([]);
  const [visitHistory, setVisitHistory] = useState<VisitHistory[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize storage
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load patients
      const patientsData = await AsyncStorage.getItem(STORAGE_KEYS.PATIENTS);
      if (patientsData) {
        setPatients(JSON.parse(patientsData));
      }
      
      // Load chairs
      const chairsData = await AsyncStorage.getItem(STORAGE_KEYS.CHAIRS);
      if (chairsData) {
        setChairs(JSON.parse(chairsData));
      } else {
        // Initialize with 6 chairs if none exist
        const initialChairs: Chair[] = Array.from({ length: 6 }, (_, i) => ({
          id: `silla-${i + 1}`,
          estado: 'libre',
        }));
        setChairs(initialChairs);
        await AsyncStorage.setItem(STORAGE_KEYS.CHAIRS, JSON.stringify(initialChairs));
      }
      
      // Load visit history
      const historyData = await AsyncStorage.getItem(STORAGE_KEYS.VISIT_HISTORY);
      if (historyData) {
        setVisitHistory(JSON.parse(historyData));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePatients = async (newPatients: Patient[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(newPatients));
      setPatients(newPatients);
    } catch (error) {
      console.error('Error saving patients:', error);
      throw error;
    }
  };

  const saveChairs = async (newChairs: Chair[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CHAIRS, JSON.stringify(newChairs));
      setChairs(newChairs);
    } catch (error) {
      console.error('Error saving chairs:', error);
      throw error;
    }
  };

  const saveVisitHistory = async (newHistory: VisitHistory[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.VISIT_HISTORY, JSON.stringify(newHistory));
      setVisitHistory(newHistory);
    } catch (error) {
      console.error('Error saving visit history:', error);
      throw error;
    }
  };

  const getNextPatientNumber = async (): Promise<number> => {
    try {
      const counterData = await AsyncStorage.getItem(STORAGE_KEYS.PATIENT_COUNTER);
      const currentCounter = counterData ? parseInt(counterData, 10) : 0;
      const nextCounter = currentCounter + 1;
      await AsyncStorage.setItem(STORAGE_KEYS.PATIENT_COUNTER, nextCounter.toString());
      return nextCounter;
    } catch (error) {
      console.error('Error getting patient number:', error);
      return 1;
    }
  };

  const addPatient = async (patientData: Omit<Patient, 'id' | 'numeroVisita' | 'fechaCreacion' | 'fechaActualizacion'>) => {
    try {
      const id = `patient-${Date.now()}`;
      const numeroVisita = await getNextPatientNumber();
      const now = new Date().toISOString();
      
      const newPatient: Patient = {
        ...patientData,
        id,
        numeroVisita,
        fechaCreacion: now,
        fechaActualizacion: now,
      };
      
      const updatedPatients = [...patients, newPatient];
      await savePatients(updatedPatients);
      return newPatient;
    } catch (error) {
      console.error('Error adding patient:', error);
      throw error;
    }
  };

  const updatePatient = async (patientId: string, updates: Partial<Patient>) => {
    try {
      const updatedPatients = patients.map(patient =>
        patient.id === patientId
          ? { ...patient, ...updates, fechaActualizacion: new Date().toISOString() }
          : patient
      );
      await savePatients(updatedPatients);
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  };

  const assignPatientToChair = async (patientId: string, chairId: string) => {
    try {
      const now = new Date().toISOString();
      
      // Update chair
      const updatedChairs = chairs.map(chair => {
        if (chair.id === chairId) {
          const updatedChair: Chair = {
            id: chair.id,
            estado: 'ocupado',
            pacienteId: patientId,
            horaInicio: now
          };
          return updatedChair;
        }
        return chair;
      });
      
      // Update patient
      const updatedPatients = patients.map(patient =>
        patient.id === patientId
          ? { ...patient, sillaAsignada: chairId, fechaActualizacion: now }
          : patient
      );
      
      await Promise.all([
        saveChairs(updatedChairs),
        savePatients(updatedPatients),
      ]);
    } catch (error) {
      console.error('Error assigning patient to chair:', error);
      throw error;
    }
  };

  const releaseChair = async (chairId: string) => {
    try {
      const chair = chairs.find(c => c.id === chairId);
      if (!chair || chair.estado === 'libre') {
        return { patient: undefined, duration: 0 };
      }
      
      const now = new Date().toISOString();
      const startTime = new Date(chair.horaInicio!).getTime();
      const endTime = new Date(now).getTime();
      const duration = Math.floor((endTime - startTime) / (1000 * 60)); // minutes
      
      // Create visit history entry
      const historyEntry: VisitHistory = {
        id: `visit-${Date.now()}`,
        pacienteId: chair.pacienteId!,
        sillaId: chairId,
        fechaInicio: chair.horaInicio!,
        fechaFin: now,
        duracion: duration,
      };
      
      // Update chair
      const updatedChairs = chairs.map(c => {
        if (c.id === chairId) {
          const updatedChair: Chair = {
            id: c.id,
            estado: 'libre'
          };
          return updatedChair;
        }
        return c;
      });
      
      // Update patient
      const updatedPatients = patients.map(patient =>
        patient.id === chair.pacienteId
          ? { ...patient, sillaAsignada: undefined, fechaActualizacion: now }
          : patient
      );
      
      // Update visit history
      const updatedHistory = [...visitHistory, historyEntry];
      
      await Promise.all([
        saveChairs(updatedChairs),
        savePatients(updatedPatients),
        saveVisitHistory(updatedHistory),
      ]);
      
      return { 
        patient: updatedPatients.find(p => p.id === chair.pacienteId), 
        duration 
      };
    } catch (error) {
      console.error('Error releasing chair:', error);
      throw error;
    }
  };

  const addChair = async (): Promise<Chair> => {
    try {
      // Encontrar el próximo número disponible
      const existingNumbers = chairs.map(chair => {
        const match = chair.id.match(/silla-(\d+)/);
        return match ? parseInt(match[1]) : 0;
      });
      
      const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
      
      const newChair: Chair = {
        id: `silla-${nextNumber}`,
        estado: 'libre',
      };
      
      const updatedChairs = [...chairs, newChair];
      await saveChairs(updatedChairs);
      return newChair;
    } catch (error) {
      console.error('Error adding chair:', error);
      throw error;
    }
  };

  const deleteChair = async (chairId: string): Promise<void> => {
    try {
      const chair = chairs.find(c => c.id === chairId);
      if (!chair) {
        throw new Error('Sillón no encontrado');
      }
      
      if (chair.estado === 'ocupado') {
        throw new Error('No se puede eliminar un sillón ocupado');
      }
      
      const updatedChairs = chairs.filter(c => c.id !== chairId);
      await saveChairs(updatedChairs);
    } catch (error) {
      console.error('Error deleting chair:', error);
      throw error;
    }
  };

  const updateChair = async (chairId: string, updates: Partial<Chair>): Promise<void> => {
    try {
      const updatedChairs = chairs.map(chair =>
        chair.id === chairId
          ? { ...chair, ...updates }
          : chair
      );
      await saveChairs(updatedChairs);
    } catch (error) {
      console.error('Error updating chair:', error);
      throw error;
    }
  };

  const getClinicStats = (): ClinicStats => {
    const today = new Date().toISOString().split('T')[0];
    const visitsToday = visitHistory.filter(visit => 
      visit.fechaInicio.startsWith(today)
    );
    
    const totalSessionTime = visitHistory.reduce((sum, visit) => sum + visit.duracion, 0);
    const averageSessionTime = visitHistory.length > 0 ? totalSessionTime / visitHistory.length : 0;
    
    return {
      totalPatients: patients.length,
      totalChairs: chairs.length,
      occupiedChairs: chairs.filter(c => c.estado === 'ocupado').length,
      freeChairs: chairs.filter(c => c.estado === 'libre').length,
      averageSessionTime: Math.round(averageSessionTime),
      patientsToday: visitsToday.length,
    };
  };

  const getPatientHistory = (patientId: string): VisitHistory[] => {
    return visitHistory.filter(visit => visit.pacienteId === patientId);
  };

  const exportData = async (): Promise<string> => {
    try {
      const data = {
        patients,
        chairs,
        visitHistory,
        exportDate: new Date().toISOString(),
        version: '1.0',
        metadata: {
          totalPatients: patients.length,
          totalChairs: chairs.length,
          totalVisits: visitHistory.length,
        }
      };
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  };

  const importData = async (jsonData: string): Promise<void> => {
    try {
      const data = JSON.parse(jsonData);
      
      // Validar estructura básica
      if (!data.patients || !data.chairs || !data.visitHistory) {
        throw new Error('Formato de datos inválido');
      }
      
      // Validar tipos de datos
      if (!Array.isArray(data.patients) || !Array.isArray(data.chairs) || !Array.isArray(data.visitHistory)) {
        throw new Error('Estructura de datos inválida');
      }
      
      await Promise.all([
        savePatients(data.patients),
        saveChairs(data.chairs),
        saveVisitHistory(data.visitHistory),
      ]);
      
      // Recargar datos
      await loadData();
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  };

  const clearAllData = async (): Promise<void> => {
    try {
      const initialChairs: Chair[] = Array.from({ length: 6 }, (_, i) => ({
        id: `silla-${i + 1}`,
        estado: 'libre',
      }));
      
      await Promise.all([
        savePatients([]),
        saveChairs(initialChairs),
        saveVisitHistory([]),
        AsyncStorage.setItem(STORAGE_KEYS.PATIENT_COUNTER, '0'),
      ]);
      
      await loadData();
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  };

  // Funciones de exportación de reportes
  const exportChairUsageReport = (): string => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('es-CL');
    
    // Obtener todas las visitas del día actual
    const todayStr = today.toISOString().split('T')[0];
    const todayVisits = visitHistory.filter(visit => 
      visit.fechaInicio.startsWith(todayStr)
    );

    // Si no hay visitas hoy
    if (todayVisits.length === 0) {
      return `REPORTE DE USO DE SILLONES\nGenerado el: ${formattedDate}\n\nNo hay registros de uso para el día de hoy.`;
    }

    // Agrupar visitas por sillón
    const visitsByChair: { [chairId: string]: VisitHistory[] } = {};
    todayVisits.forEach(visit => {
      if (!visitsByChair[visit.sillaId]) {
        visitsByChair[visit.sillaId] = [];
      }
      visitsByChair[visit.sillaId].push(visit);
    });

    // Calcular estadísticas
    const totalChairs = Object.keys(visitsByChair).length;
    const totalUsageTime = todayVisits.reduce((sum, visit) => sum + visit.duracion, 0);
    const totalPatients = [...new Set(todayVisits.map(visit => visit.pacienteId))].length;

    // Generar reporte en formato texto
    let report = `REPORTE DE USO DE SILLONES\n`;
    report += `Generado el: ${formattedDate}\n`;
    report += `Período: Día actual\n\n`;

    report += `RESUMEN:\n`;
    report += `- Total de sillones utilizados: ${totalChairs}\n`;
    report += `- Tiempo total de uso: ${formatDuration(totalUsageTime)}\n`;
    report += `- Pacientes atendidos: ${totalPatients}\n\n`;

    report += `DETALLE POR SILLÓN:\n\n`;

    Object.keys(visitsByChair).sort().forEach(chairId => {
      const chairVisits = visitsByChair[chairId];
      const chairNumber = chairId.replace('silla-', '');
      const chairTotalTime = chairVisits.reduce((sum, visit) => sum + visit.duracion, 0);
      
      report += `SILLÓN ${chairNumber}:\n`;
      report += `  • Tiempo total de uso: ${formatDuration(chairTotalTime)}\n`;
      report += `  • Cantidad de usos: ${chairVisits.length}\n`;
      
      chairVisits.forEach(visit => {
        const patient = patients.find(p => p.id === visit.pacienteId);
        report += `  • ${patient?.nombre || 'Paciente no encontrado'} (${patient?.valorId || 'N/A'}) - ${formatDuration(visit.duracion)}\n`;
      });
      report += '\n';
    });

    report += `\nReporte generado por CliniApp`;

    return report;
  };

  const exportChairUsageCSV = (): string => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const todayVisits = visitHistory.filter(visit => 
      visit.fechaInicio.startsWith(todayStr)
    );

    // Si no hay visitas, retornar CSV vacío con encabezados
    if (todayVisits.length === 0) {
      return 'Sillón,Paciente,RUT,Tiempo de Uso (minutos),Tiempo de Uso (formateado),Hora Inicio,Hora Fin\n';
    }

    // Encabezados CSV
    let csv = 'Sillón,Paciente,RUT,Tiempo de Uso (minutos),Tiempo de Uso (formateado),Hora Inicio,Hora Fin\n';
    
    todayVisits.forEach(visit => {
      const patient = patients.find(p => p.id === visit.pacienteId);
      const chairNumber = visit.sillaId.replace('silla-', '');
      const startTime = new Date(visit.fechaInicio).toLocaleTimeString('es-CL');
      const endTime = new Date(visit.fechaFin).toLocaleTimeString('es-CL');
      
      csv += `"${chairNumber}","${patient?.nombre || 'N/A'}","${patient?.valorId || 'N/A'}","${visit.duracion}","${formatDuration(visit.duracion)}","${startTime}","${endTime}"\n`;
    });

    return csv;
  };

  const exportChairUsageExcel = (): string => {
    // Para Excel, usaremos un formato similar pero más estructurado
    const today = new Date();
    const formattedDate = today.toLocaleDateString('es-CL');
    
    const todayStr = today.toISOString().split('T')[0];
    const todayVisits = visitHistory.filter(visit => 
      visit.fechaInicio.startsWith(todayStr)
    );

    // Si no hay visitas, retornar un mensaje
    if (todayVisits.length === 0) {
      return `REPORTE DE USO DE SILLONES - ${formattedDate}\n\nNo hay registros de uso para el día de hoy.`;
    }

    let excelData = `REPORTE DE USO DE SILLONES - ${formattedDate}\n\n`;
    excelData += 'Sillón\tPaciente\tRUT\tTiempo (min)\tTiempo (formateado)\tHora Inicio\tHora Fin\n';
    
    todayVisits.forEach(visit => {
      const patient = patients.find(p => p.id === visit.pacienteId);
      const chairNumber = visit.sillaId.replace('silla-', '');
      const startTime = new Date(visit.fechaInicio).toLocaleTimeString('es-CL');
      const endTime = new Date(visit.fechaFin).toLocaleTimeString('es-CL');
      
      excelData += `${chairNumber}\t${patient?.nombre || 'N/A'}\t${patient?.valorId || 'N/A'}\t${visit.duracion}\t${formatDuration(visit.duracion)}\t${startTime}\t${endTime}\n`;
    });

    return excelData;
  };

  return {
    patients,
    chairs,
    visitHistory,
    loading,
    addPatient,
    updatePatient,
    assignPatientToChair,
    releaseChair,
    addChair,
    deleteChair,
    updateChair,
    getClinicStats,
    getPatientHistory,
    loadData,
    exportData,
    importData,
    clearAllData,
    exportChairUsageReport,
    exportChairUsageCSV,
    exportChairUsageExcel,
  };
};