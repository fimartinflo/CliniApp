
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, typography, spacing, chairStyles } from '@/styles/commonStyles';
import { Chair, Patient } from '@/types';
import { useTimer } from '@/hooks/useTimer';

interface ChairDetailProps {
  chair: Chair;
  patients: Patient[];
  onBack: () => void;
  onAssignPatient: (patientId: string, chairId: string) => Promise<void>;
  onReleaseChair: (chairId: string) => Promise<void>;
  onEditChair?: () => void;
  onDeleteChair?: () => void;
}

export default function ChairDetail({
  chair,
  patients,
  onBack,
  onAssignPatient,
  onReleaseChair,
  onEditChair,
  onDeleteChair,
}: ChairDetailProps) {
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const { formattedTime, elapsedMinutes } = useTimer(chair.horaInicio);

  const assignedPatient = chair.pacienteId ? patients.find(p => p.id === chair.pacienteId) : undefined;
  const availablePatients = patients.filter(p => !p.sillaAsignada);

  const handleAssignPatient = async (patientId: string) => {
    try {
      setLoading(true);
      await onAssignPatient(patientId, chair.id);
      setShowPatientModal(false);
      Alert.alert('Éxito', 'Paciente asignado correctamente');
    } catch (error) {
      console.error('Error assigning patient:', error);
      Alert.alert('Error', 'No se pudo asignar el paciente');
    } finally {
      setLoading(false);
    }
  };

  const handleReleaseChair = () => {
    Alert.alert(
      'Liberar Sillón',
      `¿Está seguro que desea liberar el sillón ${chair.id.replace('silla-', '')}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Liberar',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const result = await onReleaseChair(chair.id);
              if (result?.patient && result?.duration) {
                Alert.alert(
                  'Sillón Liberado',
                  `${result.patient.nombre} ha sido liberado del sillón.\nTiempo total: ${Math.floor(result.duration / 60)}h ${result.duration % 60}m`
                );
              }
            } catch (error) {
              console.error('Error releasing chair:', error);
              Alert.alert('Error', 'No se pudo liberar el sillón');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteChair = () => {
    if (chair.estado === 'ocupado') {
      Alert.alert('Error', 'No se puede eliminar un sillón ocupado');
      return;
    }

    Alert.alert(
      'Eliminar Sillón',
      `¿Está seguro que desea eliminar el sillón ${chair.id.replace('silla-', '')}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: onDeleteChair,
        },
      ]
    );
  };

  const renderPatientItem = ({ item }: { item: Patient }) => (
    <TouchableOpacity
      style={[commonStyles.card, commonStyles.row, commonStyles.spaceBetween]}
      onPress={() => handleAssignPatient(item.id)}
      disabled={loading}
    >
      <View style={{ flex: 1 }}>
        <Text style={[typography.body, { fontWeight: '600', marginBottom: spacing.xs }]}>
          {item.nombre}
        </Text>
        <Text style={typography.caption}>
          {item.tipoId.toUpperCase()}: {item.valorId}
        </Text>
        <Text style={typography.caption}>
          Visita N° {item.numeroVisita}
        </Text>
      </View>
      <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <View style={commonStyles.container}>
        {/* Header */}
        <View style={[commonStyles.row, commonStyles.spaceBetween, { paddingHorizontal: spacing.md, paddingVertical: spacing.sm }]}>
          <TouchableOpacity onPress={onBack} style={{ padding: spacing.sm }}>
            <IconSymbol name="arrow.left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={typography.h2}>
            Silla {chair.id.replace('silla-', '')}
          </Text>
          {chair.estado === 'libre' && onEditChair && (
            <TouchableOpacity onPress={onEditChair} style={{ padding: spacing.sm }}>
              <IconSymbol name="ellipsis" size={24} color={colors.text} />
            </TouchableOpacity>
          )}
          {chair.estado === 'ocupado' && (
            <View style={{ width: 40 }} />
          )}
        </View>

        <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
          {/* Chair Status Card */}
          <View style={[
            commonStyles.card,
            chair.estado === 'libre' ? chairStyles.chairCardFree : chairStyles.chairCardOccupied,
            { alignItems: 'center', paddingVertical: spacing.xl }
          ]}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: chair.estado === 'libre' ? colors.success : colors.occupied,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: spacing.md,
            }}>
              <IconSymbol 
                name={chair.estado === 'libre' ? 'checkmark' : 'person'} 
                size={40} 
                color={colors.card} 
              />
            </View>
            
            <Text style={[
              typography.h1,
              { color: chair.estado === 'libre' ? colors.success : colors.occupied, marginBottom: spacing.sm }
            ]}>
              {chair.estado === 'libre' ? 'LIBRE' : 'OCUPADO'}
            </Text>
            
            <Text style={[typography.h2, { marginBottom: spacing.md }]}>
              Silla {chair.id.replace('silla-', '')}
            </Text>

            {chair.estado === 'ocupado' && (
              <View style={[commonStyles.center, { gap: spacing.sm }]}>
                <Text style={[typography.h3, { color: colors.occupied }]}>
                  {formattedTime}
                </Text>
                <Text style={typography.caption}>
                  Tiempo transcurrido
                </Text>
              </View>
            )}
          </View>

          {/* Patient Information */}
          {chair.estado === 'ocupado' && assignedPatient && (
            <View style={commonStyles.card}>
              <Text style={[typography.h3, { marginBottom: spacing.md }]}>
                Paciente Asignado
              </Text>
              
              <View style={[commonStyles.row, { marginBottom: spacing.md }]}>
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: colors.primary,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: spacing.md,
                }}>
                  <IconSymbol name="person" size={24} color={colors.card} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.body, { fontWeight: '600', marginBottom: spacing.xs }]}>
                    {assignedPatient.nombre}
                  </Text>
                  <Text style={typography.caption}>
                    {assignedPatient.tipoId.toUpperCase()}: {assignedPatient.valorId}
                  </Text>
                  <Text style={typography.caption}>
                    Visita N° {assignedPatient.numeroVisita}
                  </Text>
                </View>
              </View>

              <View style={[commonStyles.row, { gap: spacing.sm }]}>
                <View style={[commonStyles.card, { flex: 1, backgroundColor: colors.highlight, alignItems: 'center', paddingVertical: spacing.sm }]}>
                  <Text style={[typography.caption, { marginBottom: spacing.xs }]}>
                    Inicio
                  </Text>
                  <Text style={[typography.body, { fontWeight: '600' }]}>
                    {chair.horaInicio ? new Date(chair.horaInicio).toLocaleTimeString('es-CL', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    }) : '--:--'}
                  </Text>
                </View>
                <View style={[commonStyles.card, { flex: 1, backgroundColor: colors.highlight, alignItems: 'center', paddingVertical: spacing.sm }]}>
                  <Text style={[typography.caption, { marginBottom: spacing.xs }]}>
                    Duración
                  </Text>
                  <Text style={[typography.body, { fontWeight: '600' }]}>
                    {elapsedMinutes}m
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Actions */}
          <View style={[commonStyles.card, { gap: spacing.md }]}>
            <Text style={[typography.h3, { marginBottom: spacing.sm }]}>
              Acciones
            </Text>

            {chair.estado === 'libre' && (
              <TouchableOpacity
                style={[commonStyles.button, commonStyles.buttonPrimary]}
                onPress={() => setShowPatientModal(true)}
                disabled={loading || availablePatients.length === 0}
              >
                <Text style={commonStyles.buttonText}>
                  Asignar Paciente
                </Text>
              </TouchableOpacity>
            )}

            {chair.estado === 'ocupado' && (
              <TouchableOpacity
                style={[commonStyles.button, { backgroundColor: colors.error }]}
                onPress={handleReleaseChair}
                disabled={loading}
              >
                <Text style={commonStyles.buttonText}>
                  {loading ? 'Liberando...' : 'Liberar Sillón'}
                </Text>
              </TouchableOpacity>
            )}

            {chair.estado === 'libre' && onDeleteChair && (
              <TouchableOpacity
                style={[commonStyles.button, { backgroundColor: colors.error }]}
                onPress={handleDeleteChair}
                disabled={loading}
              >
                <Text style={commonStyles.buttonText}>
                  Eliminar Sillón
                </Text>
              </TouchableOpacity>
            )}

            {availablePatients.length === 0 && chair.estado === 'libre' && (
              <Text style={[typography.caption, { textAlign: 'center', color: colors.textSecondary }]}>
                No hay pacientes disponibles para asignar
              </Text>
            )}
          </View>
        </ScrollView>

        {/* Patient Selection Modal */}
        <Modal
          visible={showPatientModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={commonStyles.safeArea}>
            <View style={commonStyles.container}>
              {/* Modal Header */}
              <View style={[commonStyles.row, commonStyles.spaceBetween, { paddingHorizontal: spacing.md, paddingVertical: spacing.sm }]}>
                <TouchableOpacity onPress={() => setShowPatientModal(false)} style={{ padding: spacing.sm }}>
                  <IconSymbol name="xmark" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={typography.h2}>Seleccionar Paciente</Text>
                <View style={{ width: 40 }} />
              </View>

              {/* Patient List */}
              <FlatList
                data={availablePatients}
                renderItem={renderPatientItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{
                  paddingHorizontal: spacing.md,
                  paddingBottom: spacing.xl,
                }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={() => (
                  <View style={[commonStyles.center, { paddingVertical: spacing.xxl }]}>
                    <IconSymbol name="person.3" size={64} color={colors.textSecondary} />
                    <Text style={[typography.h3, { marginTop: spacing.md, marginBottom: spacing.sm }]}>
                      No hay pacientes disponibles
                    </Text>
                    <Text style={[typography.bodySecondary, { textAlign: 'center' }]}>
                      Todos los pacientes están asignados a otros sillones
                    </Text>
                  </View>
                )}
              />
            </View>
          </SafeAreaView>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
