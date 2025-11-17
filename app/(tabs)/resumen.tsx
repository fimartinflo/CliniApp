// DashboardScreen.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, typography, spacing } from '@/styles/commonStyles';

export default function DashboardScreen() {
  const { getClinicStats, patients, chairs, visitHistory, loadData, loading } = useApp();
  const router = useRouter();
  
  const stats = getClinicStats();
  const recentVisits = visitHistory
    .sort((a, b) => new Date(b.fechaFin).getTime() - new Date(a.fechaInicio).getTime())
    .slice(0, 5);

  const StatCard = ({ title, value, icon, color }: { 
    title: string; 
    value: string | number; 
    icon: string;
    color: string;
  }) => (
    <View style={[commonStyles.card, { alignItems: 'center', padding: spacing.lg }]}>
      <View style={{
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: color + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
      }}>
        <IconSymbol name={icon as any} size={24} color={color} />
      </View>
      <Text style={[typography.h2, { color, marginBottom: spacing.xs }]}>
        {value}
      </Text>
      <Text style={[typography.caption, { textAlign: 'center' }]}>
        {title}
      </Text>
    </View>
  );

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <ScrollView 
        style={commonStyles.container}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadData}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={{ padding: spacing.md }}>
          {/* Header */}
          <View style={{ marginBottom: spacing.lg }}>
            <Text style={typography.h1}>Dashboard</Text>
            <Text style={[typography.bodySecondary, { marginTop: spacing.xs }]}>
              Resumen general de la clínica
            </Text>
          </View>

          {/* Statistics Grid - OCULTADO */}
          {/* <View style={{ marginBottom: spacing.xl }}>
            <Text style={[typography.h3, { marginBottom: spacing.md }]}>
              Estadísticas
            </Text>
            <View style={{ gap: spacing.md }}>
              <View style={[commonStyles.row, { gap: spacing.md }]}>
                <StatCard
                  title="Pacientes Totales"
                  value={stats.totalPatients}
                  icon="person.3.fill"
                  color={colors.primary}
                />
                <StatCard
                  title="Sillones Totales"
                  value={stats.totalChairs}
                  icon="bed.double.fill"
                  color={colors.primary}
                />
              </View>
              <View style={[commonStyles.row, { gap: spacing.md }]}>
                <StatCard
                  title="Sillones Ocupados"
                  value={stats.occupiedChairs}
                  icon="person.fill"
                  color={colors.occupied}
                />
                <StatCard
                  title="Sillones Libres"
                  value={stats.freeChairs}
                  icon="bed.double"
                  color={colors.success}
                />
              </View>
              <View style={[commonStyles.row, { gap: spacing.md }]}>
                <StatCard
                  title="Pacientes Hoy"
                  value={stats.patientsToday}
                  icon="calendar"
                  color={colors.occupied}
                />
                <StatCard
                  title="Tiempo Promedio"
                  value={formatDuration(stats.averageSessionTime)}
                  icon="clock.fill"
                  color={colors.primary}
                />
              </View>
            </View>
          </View> */}

          {/* Recent Activity */}
          <View style={{ marginBottom: spacing.xl }}>
            <Text style={[typography.h3, { marginBottom: spacing.md }]}>
              Actividad Reciente
            </Text>
            <View style={[commonStyles.card, { padding: 0 }]}>
              {recentVisits.length > 0 ? (
                recentVisits.map((visit, index) => {
                  const patient = patients.find(p => p.id === visit.pacienteId);
                  return (
                    <View
                      key={visit.id}
                      style={[
                        commonStyles.row,
                        commonStyles.spaceBetween,
                        {
                          padding: spacing.md,
                          borderBottomWidth: index < recentVisits.length - 1 ? 1 : 0,
                          borderBottomColor: colors.border,
                        },
                      ]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[typography.body, { fontWeight: '600', marginBottom: spacing.xs }]}>
                          {patient?.nombre || 'Paciente no encontrado'}
                        </Text>
                        <Text style={[typography.caption, { marginBottom: spacing.xs }]}>
                          Sillón {visit.sillaId.replace('silla-', '')} • {formatDuration(visit.duracion)}
                        </Text>
                        <Text style={[typography.caption, { color: colors.textSecondary }]}>
                          {formatDate(visit.fechaFin)}
                        </Text>
                      </View>
                      <IconSymbol name="checkmark.circle.fill" size={20} color={colors.success} />
                    </View>
                  );
                })
              ) : (
                <View style={[commonStyles.center, { padding: spacing.xl }]}>
                  <IconSymbol name="clock" size={48} color={colors.textSecondary} />
                  <Text style={[typography.bodySecondary, { marginTop: spacing.md, textAlign: 'center' }]}>
                    No hay actividad reciente
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Quick Actions - CORREGIDOS */}
          <View>
            <Text style={[typography.h3, { marginBottom: spacing.md }]}>
              Acciones Rápidas
            </Text>
            <View style={[commonStyles.row, { gap: spacing.md }]}>
              <TouchableOpacity
                style={[
                  commonStyles.card,
                  commonStyles.center,
                  { flex: 1, padding: spacing.lg, backgroundColor: colors.highlight },
                ]}
                onPress={() => {
                  router.push('/pacientes');
                }}
              >
                <IconSymbol name="person.badge.plus" size={32} color={colors.primary} />
                <Text style={[typography.body, { fontWeight: '600', marginTop: spacing.sm }]}>
                  Nuevo Paciente
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  commonStyles.card,
                  commonStyles.center,
                  { flex: 1, padding: spacing.lg, backgroundColor: colors.highlight },
                ]}
                onPress={() => {
                  router.push('/sillones');
                }}
              >
                <IconSymbol name="plus.circle" size={32} color={colors.primary} />
                <Text style={[typography.body, { fontWeight: '600', marginTop: spacing.sm }]}>
                  Agregar Sillón
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}