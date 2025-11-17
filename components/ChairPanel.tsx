// Reemplazar el componente ChairPanel completo con esta versión mejorada
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, typography, spacing, chairStyles } from '@/styles/commonStyles';
import { Chair, Patient } from '@/types';
import { useTimer } from '@/hooks/useTimer';
import { useApp } from '@/contexts/AppContext'; // AÑADIR ESTA IMPORTACIÓN

interface ChairPanelProps {
  chairs: Chair[];
  patients: Patient[];
  onChairPress: (chair: Chair) => void;
  onAddChair: () => void;
  loading?: boolean;
}

const ChairCard = ({ chair, patient, onPress, onDelete }: { 
  chair: Chair; 
  patient?: Patient; 
  onPress: () => void;
  onDelete: (chairId: string) => void;
}) => {
  const { formattedTime } = useTimer(chair.horaInicio);
  
  const handleDeletePress = () => {
    Alert.alert(
      'Eliminar Sillón',
      `¿Está seguro que desea eliminar el sillón ${chair.id.replace('silla-', '')}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => onDelete(chair.id),
        },
      ]
    );
  };
  
  return (
    <TouchableOpacity
      style={[
        chairStyles.chairCard,
        chair.estado === 'libre' ? chairStyles.chairCardFree : chairStyles.chairCardOccupied,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[commonStyles.row, commonStyles.spaceBetween, { marginBottom: spacing.sm }]}>
        <Text style={[
          chairStyles.chairStatus,
          chair.estado === 'libre' ? chairStyles.chairStatusFree : chairStyles.chairStatusOccupied,
        ]}>
          {chair.estado === 'libre' ? 'LIBRE' : 'OCUPADO'}
        </Text>
        <View style={[commonStyles.row, { alignItems: 'center', gap: spacing.sm }]}>
          {chair.estado === 'libre' && (
            <TouchableOpacity 
              onPress={handleDeletePress}
              style={{ padding: spacing.xs }}
            >
              <IconSymbol name="trash" size={16} color={colors.error} />
            </TouchableOpacity>
          )}
          <View style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: chair.estado === 'libre' ? colors.success : colors.occupied,
          }} />
        </View>
      </View>
      
      <Text style={chairStyles.chairId}>
        Sillón {chair.id.replace('silla-', '')}
      </Text>
      
      {chair.estado === 'ocupado' && patient && (
        <View style={{ marginTop: spacing.sm }}>
          <Text style={[typography.body, { fontWeight: '600', marginBottom: spacing.xs }]}>
            {patient.nombre}
          </Text>
          <View style={[commonStyles.row, { alignItems: 'center', gap: spacing.xs }]}>
            <IconSymbol name="clock" size={16} color={colors.occupied} />
            <Text style={chairStyles.timerText}>
              {formattedTime}
            </Text>
          </View>
        </View>
      )}
      
      {chair.estado === 'libre' && (
        <View style={[commonStyles.center, { marginTop: spacing.sm }]}>
          <IconSymbol name="plus.circle" size={32} color={colors.success} />
        </View>
      )}
    </TouchableOpacity>
  );
};

export default function ChairPanel({ chairs, patients, onChairPress, onAddChair, loading = false }: ChairPanelProps) {
  const { deleteChair, loadData } = useApp(); // OBTENER FUNCIONES DEL CONTEXTO
  
  const occupiedChairs = chairs.filter(chair => chair.estado === 'ocupado').length;
  const freeChairs = chairs.filter(chair => chair.estado === 'libre').length;

  const handleDeleteChair = async (chairId: string) => {
    try {
      await deleteChair(chairId);
      Alert.alert('Éxito', 'Sillón eliminado correctamente');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo eliminar el sillón');
    }
  };

  const handleRefresh = async () => {
    await loadData();
  };

  const renderChair = ({ item }: { item: Chair }) => {
    const patient = item.pacienteId ? patients.find(p => p.id === item.pacienteId) : undefined;
    
    return (
      <ChairCard
        chair={item}
        patient={patient}
        onPress={() => onChairPress(item)}
        onDelete={handleDeleteChair}
      />
    );
  };

  const renderHeader = () => (
    <View style={{ paddingHorizontal: spacing.md, marginBottom: spacing.md }}>
      {/* Title and Add Button */}
      <View style={[commonStyles.row, commonStyles.spaceBetween, { marginBottom: spacing.md }]}>
        <Text style={typography.h1}>Sillones</Text>
        <TouchableOpacity
          style={{
            backgroundColor: colors.primary,
            borderRadius: 20,
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={onAddChair}
        >
          <IconSymbol name="plus" size={24} color={colors.card} />
        </TouchableOpacity>
      </View>

      {/* Statistics */}
      <View style={[commonStyles.row, { gap: spacing.sm }]}>
        <View style={[commonStyles.card, { flex: 1, alignItems: 'center', paddingVertical: spacing.md }]}>
          <Text style={[typography.h2, { color: colors.success, marginBottom: spacing.xs }]}>
            {freeChairs}
          </Text>
          <Text style={[typography.caption, { textAlign: 'center' }]}>
            Libres
          </Text>
        </View>
        <View style={[commonStyles.card, { flex: 1, alignItems: 'center', paddingVertical: spacing.md }]}>
          <Text style={[typography.h2, { color: colors.occupied, marginBottom: spacing.xs }]}>
            {occupiedChairs}
          </Text>
          <Text style={[typography.caption, { textAlign: 'center' }]}>
            Ocupados
          </Text>
        </View>
        <View style={[commonStyles.card, { flex: 1, alignItems: 'center', paddingVertical: spacing.md }]}>
          <Text style={[typography.h2, { color: colors.primary, marginBottom: spacing.xs }]}>
            {chairs.length}
          </Text>
          <Text style={[typography.caption, { textAlign: 'center' }]}>
            Total
          </Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={[commonStyles.center, { flex: 1, paddingVertical: spacing.xxl }]}>
      <IconSymbol name="bed.double" size={64} color={colors.textSecondary} />
      <Text style={[typography.h3, { marginTop: spacing.md, marginBottom: spacing.sm }]}>
        No hay sillones configurados
      </Text>
      <Text style={[typography.bodySecondary, { textAlign: 'center', marginBottom: spacing.lg }]}>
        Comienza agregando tu primer sillón
      </Text>
      <TouchableOpacity
        style={[commonStyles.button, commonStyles.buttonPrimary]}
        onPress={onAddChair}
      >
        <Text style={commonStyles.buttonText}>Agregar Sillón</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={chairs}
        renderItem={renderChair}
        keyExtractor={(item) => item.id}
        numColumns={2}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={{
          paddingBottom: 100,
          flexGrow: 1,
        }}
        columnWrapperStyle={{ paddingHorizontal: spacing.md }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />
    </View>
  );
}