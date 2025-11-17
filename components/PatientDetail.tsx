
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, typography, spacing } from '@/styles/commonStyles';
import { Patient, VisitHistory } from '@/types';
import { calculateAge, formatDuration } from '@/utils/validation';

interface PatientDetailProps {
  patient: Patient;
  visitHistory: VisitHistory[];
  onBack: () => void;
  onEdit: () => void;
}

export default function PatientDetail({ patient, visitHistory, onBack, onEdit }: PatientDetailProps) {
  const age = calculateAge(patient.fechaNacimiento);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderInfoRow = (label: string, value: string, icon?: string) => (
    <View style={[commonStyles.row, { marginBottom: spacing.md, alignItems: 'flex-start' }]}>
      {icon && (
        <View style={{ marginRight: spacing.sm, marginTop: 2 }}>
          <IconSymbol name={icon as any} size={20} color={colors.primary} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={[typography.caption, { marginBottom: spacing.xs }]}>
          {label}
        </Text>
        <Text style={typography.body}>
          {value || 'No especificado'}
        </Text>
      </View>
    </View>
  );

  const renderVisitHistory = () => {
    if (visitHistory.length === 0) {
      return (
        <View style={[commonStyles.center, { paddingVertical: spacing.lg }]}>
          <IconSymbol name="clock" size={48} color={colors.textSecondary} />
          <Text style={[typography.bodySecondary, { marginTop: spacing.sm, textAlign: 'center' }]}>
            No hay historial de visitas
          </Text>
        </View>
      );
    }

    return visitHistory
      .sort((a, b) => new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime())
      .map((visit, index) => (
        <View key={visit.id} style={[commonStyles.card, { marginBottom: spacing.sm }]}>
          <View style={[commonStyles.row, commonStyles.spaceBetween, { marginBottom: spacing.sm }]}>
            <Text style={[typography.body, { fontWeight: '600' }]}>
              Silla {visit.sillaId.replace('silla-', '')}
            </Text>
            <Text style={[typography.caption, { color: colors.primary }]}>
              {formatDuration(visit.duracion)}
            </Text>
          </View>
          <Text style={[typography.caption, { marginBottom: spacing.xs }]}>
            Inicio: {formatDateTime(visit.fechaInicio)}
          </Text>
          <Text style={typography.caption}>
            Fin: {formatDateTime(visit.fechaFin)}
          </Text>
        </View>
      ));
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <View style={commonStyles.container}>
        {/* Header */}
        <View style={[commonStyles.row, commonStyles.spaceBetween, { paddingHorizontal: spacing.md, paddingVertical: spacing.sm }]}>
          <TouchableOpacity onPress={onBack} style={{ padding: spacing.sm }}>
            <IconSymbol name="arrow.left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={typography.h2}>Detalle Paciente</Text>
          <TouchableOpacity onPress={onEdit} style={{ padding: spacing.sm }}>
            <IconSymbol name="pencil" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
          {/* Patient Status */}
          {patient.sillaAsignada && (
            <View style={[
              commonStyles.card,
              { backgroundColor: colors.highlight, borderLeftWidth: 4, borderLeftColor: colors.occupied }
            ]}>
              <View style={[commonStyles.row, commonStyles.center, { gap: spacing.sm }]}>
                <IconSymbol name="bed.double" size={24} color={colors.occupied} />
                <Text style={[typography.body, { fontWeight: '600', color: colors.occupied }]}>
                  Actualmente en Silla {patient.sillaAsignada.replace('silla-', '')}
                </Text>
              </View>
            </View>
          )}

          {/* Basic Information */}
          <View style={[commonStyles.card, { marginTop: spacing.md }]}>
            <Text style={[typography.h3, { marginBottom: spacing.md }]}>
              Información Personal
            </Text>
            
            {renderInfoRow('Nombre Completo', patient.nombre, 'person')}
            {renderInfoRow('Fecha de Nacimiento', `${formatDate(patient.fechaNacimiento)} (${age} años)`, 'calendar')}
            {renderInfoRow('Identificación', `${patient.tipoId.toUpperCase()}: ${patient.valorId}`, 'person.text.rectangle')}
            {renderInfoRow('Teléfono', patient.telefono || '', 'phone')}
            {renderInfoRow('Correo', patient.correo || '', 'envelope')}
            {renderInfoRow('N° de Visita', patient.numeroVisita.toString(), 'number.circle')}
          </View>

          {/* Medical History */}
          {patient.historialMedico && (
            <View style={commonStyles.card}>
              <Text style={[typography.h3, { marginBottom: spacing.md }]}>
                Historial Médico
              </Text>
              <Text style={typography.body}>
                {patient.historialMedico}
              </Text>
            </View>
          )}

          {/* Visit History */}
          <View style={commonStyles.card}>
            <Text style={[typography.h3, { marginBottom: spacing.md }]}>
              Historial de Visitas ({visitHistory.length})
            </Text>
            {renderVisitHistory()}
          </View>

          {/* Metadata */}
          <View style={[commonStyles.card, { marginBottom: spacing.xl }]}>
            <Text style={[typography.h3, { marginBottom: spacing.md }]}>
              Información del Sistema
            </Text>
            {renderInfoRow('Fecha de Registro', formatDateTime(patient.fechaCreacion), 'plus.circle')}
            {renderInfoRow('Última Actualización', formatDateTime(patient.fechaActualizacion), 'pencil.circle')}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
