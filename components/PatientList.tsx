import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, typography, spacing } from '@/styles/commonStyles';
import { Patient } from '@/types';
import { useApp } from '@/contexts/AppContext'; // AÑADIR

interface PatientListProps {
  patients: Patient[];
  onPatientPress: (patient: Patient) => void;
  onAddPatient: () => void;
  loading?: boolean;
}

type SearchFilter = 'all' | 'assigned' | 'unassigned';

export default function PatientList({ patients, onPatientPress, onAddPatient, loading = false }: PatientListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState<SearchFilter>('all');
  const { loadData } = useApp(); // AÑADIR

  const filteredPatients = useMemo(() => {
    return patients.filter(patient => {
      // Filtro de búsqueda
      const matchesSearch = 
        patient.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.valorId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.telefono?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.correo?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filtro por estado de asignación
      const matchesFilter = 
        searchFilter === 'all' ||
        (searchFilter === 'assigned' && patient.sillaAsignada) ||
        (searchFilter === 'unassigned' && !patient.sillaAsignada);
      
      return matchesSearch && matchesFilter;
    });
  }, [patients, searchQuery, searchFilter]);

  const handleRefresh = async () => {
    await loadData();
  };

  const renderPatient = ({ item }: { item: Patient }) => (
    <TouchableOpacity
      style={[commonStyles.card, commonStyles.row, commonStyles.spaceBetween]}
      onPress={() => onPatientPress(item)}
      activeOpacity={0.7}
      accessible={true}
      accessibilityLabel={`Paciente ${item.nombre}, ${item.tipoId}: ${item.valorId}`}
      accessibilityHint="Presiona dos veces para ver detalles del paciente"
    >
      <View style={{ flex: 1 }}>
        <Text style={[typography.h3, { marginBottom: spacing.xs }]}>
          {item.nombre}
        </Text>
        <Text style={[typography.bodySecondary, { marginBottom: spacing.xs }]}>
          {item.tipoId.toUpperCase()}: {item.valorId}
        </Text>
        <View style={[commonStyles.row, { gap: spacing.md }]}>
          <Text style={typography.caption}>
            Visita N° {item.numeroVisita}
          </Text>
          {item.sillaAsignada && (
            <View style={[commonStyles.row, { alignItems: 'center', gap: spacing.xs }]}>
              <View style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: colors.occupied,
              }} />
              <Text style={[typography.caption, { color: colors.occupied }]}>
                Silla {item.sillaAsignada.replace('silla-', '')}
              </Text>
            </View>
          )}
        </View>
      </View>
      <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  const FilterButton = ({ filter, label }: { filter: SearchFilter; label: string }) => (
    <TouchableOpacity
      style={[
        {
          flex: 1,
          paddingVertical: spacing.sm,
          alignItems: 'center',
          borderRadius: 6,
          marginHorizontal: 2,
        },
        searchFilter === filter 
          ? { backgroundColor: colors.primary }
          : { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
      ]}
      onPress={() => setSearchFilter(filter)}
    >
      <Text style={[
        typography.caption,
        { fontWeight: '500' },
        searchFilter === filter 
          ? { color: colors.card }
          : { color: colors.text },
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={[commonStyles.center, { flex: 1, paddingVertical: spacing.xxl }]}>
      <IconSymbol name="person.3" size={64} color={colors.textSecondary} />
      <Text style={[typography.h3, { marginTop: spacing.md, marginBottom: spacing.sm }]}>
        {searchQuery || searchFilter !== 'all' ? 'No se encontraron pacientes' : 'No hay pacientes registrados'}
      </Text>
      <Text style={[typography.bodySecondary, { textAlign: 'center', marginBottom: spacing.lg }]}>
        {searchQuery 
          ? 'Intenta con otro término de búsqueda'
          : 'Comienza agregando tu primer paciente'
        }
      </Text>
      {!searchQuery && searchFilter === 'all' && (
        <TouchableOpacity
          style={[commonStyles.button, commonStyles.buttonPrimary]}
          onPress={onAddPatient}
        >
          <Text style={commonStyles.buttonText}>Agregar Paciente</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={[commonStyles.row, commonStyles.spaceBetween, { paddingHorizontal: spacing.md, paddingVertical: spacing.sm }]}>
        <Text style={typography.h1}>Pacientes</Text>
        <TouchableOpacity
          style={{
            backgroundColor: colors.primary,
            borderRadius: 20,
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={onAddPatient}
          accessible={true}
          accessibilityLabel="Agregar nuevo paciente"
          accessibilityHint="Presiona para abrir formulario de nuevo paciente"
        >
          <IconSymbol name="plus" size={24} color={colors.card} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={{ paddingHorizontal: spacing.md, marginBottom: spacing.sm }}>
        <View style={[commonStyles.input, commonStyles.row, { alignItems: 'center', gap: spacing.sm }]}>
          <IconSymbol name="magnifyingglass" size={20} color={colors.textSecondary} />
          <TextInput
            style={[typography.body, { flex: 1, color: colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar por nombre, RUT, teléfono o correo..."
            placeholderTextColor={colors.textSecondary}
            accessible={true}
            accessibilityLabel="Barra de búsqueda de pacientes"
            accessibilityHint="Escribe para buscar pacientes por nombre, RUT, teléfono o correo electrónico"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearchQuery('')}
              accessible={true}
              accessibilityLabel="Limpiar búsqueda"
            >
              <IconSymbol name="xmark.circle.fill" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={{ paddingHorizontal: spacing.md, marginBottom: spacing.md }}>
        <View style={[commonStyles.row, { gap: spacing.xs }]}>
          <FilterButton filter="all" label="Todos" />
          <FilterButton filter="assigned" label="Asignados" />
          <FilterButton filter="unassigned" label="No Asignados" />
        </View>
      </View>

      {/* Results Counter */}
      {filteredPatients.length > 0 && (
        <View style={{ paddingHorizontal: spacing.md, marginBottom: spacing.sm }}>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            {filteredPatients.length} paciente{filteredPatients.length !== 1 ? 's' : ''} encontrado{filteredPatients.length !== 1 ? 's' : ''}
            {searchFilter !== 'all' && ` (${searchFilter === 'assigned' ? 'asignados' : 'no asignados'})`}
          </Text>
        </View>
      )}

      {/* Patient List */}
      <FlatList
        data={filteredPatients}
        renderItem={renderPatient}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingBottom: 100,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </View>
  );
}