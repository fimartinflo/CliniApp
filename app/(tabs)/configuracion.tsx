// configuracion.tsx 
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import { useApp } from '@/contexts/AppContext';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, typography, spacing } from '@/styles/commonStyles';

export default function SettingsScreen() {
  const { 
    exportData, 
    exportChairUsageReport, 
    exportChairUsageCSV, 
    exportChairUsageExcel, 
    getClinicStats 
  } = useApp();
  const [loading, setLoading] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      setLoading('export');
      const data = await exportData();
      
      if (Platform.OS === 'web') {
        // Para web: descargar archivo
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-clinica-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // Para móvil: compartir
        await Share.share({
          message: data,
          title: 'Backup Clínica',
        });
      }
      
      Alert.alert('Éxito', 'Datos exportados correctamente');
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', 'No se pudieron exportar los datos');
    } finally {
      setLoading(null);
    }
  };

const handleExportReport = async (format: 'text' | 'csv' | 'excel') => {
  try {
    setLoading(`export-${format}`);
    
    let data: string;
    let filename: string;

    const dateStr = new Date().toISOString().split('T')[0];
    const formattedDate = new Date().toLocaleDateString('es-CL');
    
    switch (format) {
      case 'text':
        data = exportChairUsageReport();
        filename = `reporte-sillones-${dateStr}.txt`;
        break;
      case 'csv':
        data = exportChairUsageCSV();
        filename = `reporte-sillones-${dateStr}.csv`;
        break;
      case 'excel':
        data = exportChairUsageExcel();
        filename = `reporte-sillones-${dateStr}.xls`;
        break;
      default:
        throw new Error('Formato no soportado');
    }
    
    if (Platform.OS === 'web') {
      // Para web: descargar archivo
      const mimeType = format === 'text' ? 'text/plain' : 
                      format === 'csv' ? 'text/csv' : 
                      'application/vnd.ms-excel';
      
      const blob = new Blob([data], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // Para móvil: siempre compartir como texto
      await Share.share({
        message: data,
        title: `Reporte de Sillones - ${formattedDate}`,
      });
    }
    
    Alert.alert('Éxito', `Reporte exportado correctamente en formato ${format.toUpperCase()}`);
  } catch (error) {
    console.error('Error exporting report:', error);
    Alert.alert('Error', 'No se pudo exportar el reporte');
  } finally {
    setLoading(null);
  }
};

  const stats = getClinicStats();

  const SettingButton = ({ 
    title, 
    description, 
    icon, 
    onPress, 
    loading: buttonLoading 
  }: {
    title: string;
    description: string;
    icon: string;
    onPress: () => void;
    loading?: boolean;
  }) => (
    <TouchableOpacity
      style={[commonStyles.card, commonStyles.row, commonStyles.spaceBetween]}
      onPress={onPress}
      disabled={buttonLoading}
    >
      <View style={[commonStyles.row, { flex: 1, alignItems: 'flex-start', gap: spacing.md }]}>
        <View style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: colors.primary + '20',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <IconSymbol 
            name={icon as any} 
            size={20} 
            color={colors.primary} 
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[typography.body, { fontWeight: '600', marginBottom: spacing.xs }]}>
            {title}
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            {description}
          </Text>
        </View>
      </View>
      {buttonLoading && (
        <IconSymbol name="arrow.triangle.2.circlepath" size={20} color={colors.textSecondary} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <ScrollView style={commonStyles.container}>
        <View style={{ padding: spacing.md }}>
          {/* Header */}
          <View style={{ marginBottom: spacing.lg }}>
            <Text style={typography.h1}>Configuración</Text>
            <Text style={[typography.bodySecondary, { marginTop: spacing.xs }]}>
              Gestiona los datos y configuraciones de la aplicación
            </Text>
          </View>

          {/* Statistics */}
          <View style={[commonStyles.card, { marginBottom: spacing.lg }]}>
            <Text style={[typography.h3, { marginBottom: spacing.md }]}>
              Resumen de Datos
            </Text>
            <View style={[commonStyles.row, { flexWrap: 'wrap', gap: spacing.md }]}>
              <View style={{ minWidth: '45%' }}>
                <Text style={typography.caption}>Pacientes</Text>
                <Text style={[typography.body, { fontWeight: '600' }]}>{stats.totalPatients}</Text>
              </View>
              <View style={{ minWidth: '45%' }}>
                <Text style={typography.caption}>Sillones</Text>
                <Text style={[typography.body, { fontWeight: '600' }]}>{stats.totalChairs}</Text>
              </View>
              <View style={{ minWidth: '45%' }}>
                <Text style={typography.caption}>Visitas Hoy</Text>
                <Text style={[typography.body, { fontWeight: '600' }]}>{stats.patientsToday}</Text>
              </View>
              <View style={{ minWidth: '45%' }}>
                <Text style={typography.caption}>Tiempo Prom.</Text>
                <Text style={[typography.body, { fontWeight: '600' }]}>{stats.averageSessionTime}m</Text>
              </View>
            </View>
          </View>

          {/* Reportes de Uso */}
          <View style={{ marginBottom: spacing.xl }}>
            <Text style={[typography.h3, { marginBottom: spacing.md }]}>
              Reportes de Uso
            </Text>
            
            <SettingButton
              title="Exportar Reporte Diario (Texto)"
              description="Genera un reporte detallado del uso de sillones en formato texto"
              icon="doc.text.fill"
              onPress={() => handleExportReport('text')}
              loading={loading === 'export-text'}
            />
            
            <SettingButton
              title="Exportar Reporte Diario (CSV)"
              description="Genera un reporte en formato CSV para Excel"
              icon="tablecells.fill"
              onPress={() => handleExportReport('csv')}
              loading={loading === 'export-csv'}
            />
            
            <SettingButton
              title="Exportar Reporte Diario (Excel)"
              description="Genera un reporte en formato Excel"
              icon="chart.bar.doc.horizontal.fill"
              onPress={() => handleExportReport('excel')}
              loading={loading === 'export-excel'}
            />
          </View>

          {/* Backup Section - SOLO EXPORTAR */}
          <View style={{ marginBottom: spacing.xl }}>
            <Text style={[typography.h3, { marginBottom: spacing.md }]}>
              Copia de Seguridad
            </Text>
            
            <SettingButton
              title="Exportar Datos"
              description="Guarda una copia de seguridad de todos los datos"
              icon="arrow.down.doc.fill"
              onPress={handleExport}
              loading={loading === 'export'}
            />
          </View>

          {/* App Info */}
          <View style={[commonStyles.card, { marginTop: spacing.xl }]}>
            <Text style={[typography.caption, { color: colors.textSecondary, textAlign: 'center' }]}>
              CliniApp v1.0.0
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs }]}>
              Sistema de Gestión Clínica
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs }]}>
              Desarrollada por: Felipe Martínez Flores
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}