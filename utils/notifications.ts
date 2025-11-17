
import { Alert } from 'react-native';

export const showNotification = (title: string, message: string) => {
  // For now, we'll use Alert for notifications
  // In a production app, you would use expo-notifications
  Alert.alert(title, message);
};

export const showPatientAssignedNotification = (patientName: string, chairNumber: string) => {
  showNotification(
    'Paciente Asignado',
    `${patientName} ha sido asignado al Sillón ${chairNumber}`
  );
};

export const showPatientReleasedNotification = (patientName: string, chairNumber: string, duration: string) => {
  showNotification(
    'Paciente Liberado',
    `${patientName} ha sido liberado del Sillón ${chairNumber}.\nTiempo total: ${duration}`
  );
};

export const showSuccessNotification = (message: string) => {
  showNotification('Éxito', message);
};

export const showErrorNotification = (message: string) => {
  showNotification('Error', message);
};
