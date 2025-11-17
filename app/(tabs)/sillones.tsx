// Reemplazar el archivo completo con esta versión mejorada
import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ChairPanel from '@/components/ChairPanel';
import ChairDetail from '@/components/ChairDetail';
import LoadingSpinner from '@/components/LoadingSpinner';
import { commonStyles } from '@/styles/commonStyles';
import { useApp } from '@/contexts/AppContext';
import { Chair } from '@/types';

type ScreenMode = 'panel' | 'detail';

export default function SillonesScreen() {
  const [screenMode, setScreenMode] = useState<ScreenMode>('panel');
  const [selectedChair, setSelectedChair] = useState<Chair | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const {
    chairs,
    patients,
    loading,
    assignPatientToChair,
    releaseChair,
    addChair,
  } = useApp();

  const handleChairPress = (chair: Chair) => {
    setSelectedChair(chair);
    setScreenMode('detail');
  };

  const handleAddChair = async () => {
    try {
      await addChair();
      Alert.alert('Éxito', 'Sillón agregado correctamente');
    } catch (error) {
      console.error('Error adding chair:', error);
      Alert.alert('Error', 'No se pudo agregar el sillón');
    }
  };

  const handleBackToPanel = () => {
    setSelectedChair(null);
    setScreenMode('panel');
  };

  const handleAssignPatient = async (patientId: string, chairId: string) => {
    try {
      await assignPatientToChair(patientId, chairId);
      // Update selected chair state
      const updatedChair = chairs.find(c => c.id === chairId);
      if (updatedChair) {
        setSelectedChair(updatedChair);
      }
    } catch (error) {
      console.error('Error assigning patient:', error);
      throw error;
    }
  };

  const handleReleaseChair = async (chairId: string) => {
    try {
      const result = await releaseChair(chairId);
      // Update selected chair state
      const updatedChair = chairs.find(c => c.id === chairId);
      if (updatedChair) {
        setSelectedChair(updatedChair);
      }
      return result;
    } catch (error) {
      console.error('Error releasing chair:', error);
      throw error;
    }
  };

  const renderScreen = () => {
    switch (screenMode) {
      case 'detail':
        if (!selectedChair) {
          setScreenMode('panel');
          return null;
        }
        return (
          <ChairDetail
            chair={selectedChair}
            patients={patients}
            onBack={handleBackToPanel}
            onAssignPatient={handleAssignPatient}
            onReleaseChair={handleReleaseChair}
            onDeleteChair={async () => {
              try {
                await handleBackToPanel();
                // La eliminación se maneja en ChairPanel
              } catch (error) {
                console.error('Error handling delete:', error);
              }
            }}
          />
        );
      
      default:
        return (
          <ChairPanel
            chairs={chairs}
            patients={patients}
            onChairPress={handleChairPress}
            onAddChair={handleAddChair}
            loading={loading || refreshing}
          />
        );
    }
  };

  if (loading && chairs.length === 0) {
    return (
      <SafeAreaView style={commonStyles.safeArea}>
        <View style={commonStyles.container}>
          <LoadingSpinner message="Cargando sillones..." />
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