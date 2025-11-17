
import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import PatientList from '@/components/PatientList';
import PatientForm from '@/components/PatientForm';
import PatientDetail from '@/components/PatientDetail';
import LoadingSpinner from '@/components/LoadingSpinner';
import { commonStyles } from '@/styles/commonStyles';
import { useApp } from '@/contexts/AppContext';
import { Patient, PatientFormData } from '@/types';

type ScreenMode = 'list' | 'form' | 'detail';

export default function PacientesScreen() {
  const [screenMode, setScreenMode] = useState<ScreenMode>('list');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const {
    patients,
    loading,
    addPatient,
    updatePatient,
    getPatientHistory,
  } = useApp();

  const handleAddPatient = () => {
    setSelectedPatient(null);
    setIsEditing(false);
    setScreenMode('form');
  };

  const handlePatientPress = (patient: Patient) => {
    setSelectedPatient(patient);
    setScreenMode('detail');
  };

  const handleEditPatient = () => {
    setIsEditing(true);
    setScreenMode('form');
  };

  const handleFormSubmit = async (data: PatientFormData) => {
    try {
      if (isEditing && selectedPatient) {
        await updatePatient(selectedPatient.id, data);
        Alert.alert('Éxito', 'Paciente actualizado correctamente');
      } else {
        const newPatient = await addPatient(data);
        setSelectedPatient(newPatient);
        Alert.alert('Éxito', 'Paciente creado correctamente');
      }
      setScreenMode('list');
    } catch (error) {
      console.error('Error saving patient:', error);
      throw error;
    }
  };

  const handleFormCancel = () => {
    setScreenMode(selectedPatient ? 'detail' : 'list');
  };

  const handleBackToList = () => {
    setSelectedPatient(null);
    setScreenMode('list');
  };

  const renderScreen = () => {
    switch (screenMode) {
      case 'form':
        return (
          <PatientForm
            initialData={isEditing && selectedPatient ? {
              nombre: selectedPatient.nombre,
              fechaNacimiento: selectedPatient.fechaNacimiento,
              tipoId: selectedPatient.tipoId,
              valorId: selectedPatient.valorId,
              telefono: selectedPatient.telefono || '',
              correo: selectedPatient.correo || '',
              historialMedico: selectedPatient.historialMedico || '',
            } : undefined}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isEditing={isEditing}
          />
        );
      
      case 'detail':
        if (!selectedPatient) {
          setScreenMode('list');
          return null;
        }
        return (
          <PatientDetail
            patient={selectedPatient}
            visitHistory={getPatientHistory(selectedPatient.id)}
            onBack={handleBackToList}
            onEdit={handleEditPatient}
          />
        );
      
      default:
        return (
          <PatientList
            patients={patients}
            onPatientPress={handlePatientPress}
            onAddPatient={handleAddPatient}
            loading={loading}
          />
        );
    }
  };

  if (loading && patients.length === 0) {
    return (
      <SafeAreaView style={commonStyles.safeArea}>
        <View style={commonStyles.container}>
          <LoadingSpinner message="Cargando pacientes..." />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <View style={commonStyles.container}>
        {renderScreen()}
      </View>
    </SafeAreaView>
  );
}
