import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, typography, spacing } from '@/styles/commonStyles';
import { PatientFormData, FormErrors } from '@/types';
import { validatePatientForm, formatRUT, formatPhone, calculateAge } from '@/utils/validation';

interface PatientFormProps {
  initialData?: Partial<PatientFormData>;
  onSubmit: (data: PatientFormData) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

export default function PatientForm({ initialData, onSubmit, onCancel, isEditing = false }: PatientFormProps) {
  const [formData, setFormData] = useState<PatientFormData>({
    nombre: initialData?.nombre || '',
    fechaNacimiento: initialData?.fechaNacimiento || '',
    tipoId: initialData?.tipoId || 'rut',
    valorId: initialData?.valorId || '',
    telefono: initialData?.telefono || '',
    correo: initialData?.correo || '',
    historialMedico: initialData?.historialMedico || '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof PatientFormData, value: string) => {
    let processedValue = value;

    // Format RUT as user types
    if (field === 'valorId' && formData.tipoId === 'rut') {
      // Permitir que el usuario borre completamente
      if (value === '') {
        processedValue = '';
      } else {
        // Aplicar formato RUT
        processedValue = formatRUT(value);
      }
    }

    // Format phone as user types
    if (field === 'telefono') {
      processedValue = formatPhone(value);
    }

    setFormData(prev => ({ ...prev, [field]: processedValue }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        fechaNacimiento: selectedDate.toISOString().split('T')[0],
      }));
      if (errors.fechaNacimiento) {
        setErrors(prev => ({ ...prev, fechaNacimiento: '' }));
      }
    }
  };

  const handleSubmit = async () => {
    const validationErrors = validatePatientForm(formData);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
      Alert.alert('Error', 'No se pudo guardar el paciente. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const age = formData.fechaNacimiento ? calculateAge(formData.fechaNacimiento) : null;

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <View style={commonStyles.container}>
        {/* Header */}
        <View style={[commonStyles.row, commonStyles.spaceBetween, { paddingHorizontal: spacing.md, paddingVertical: spacing.sm }]}>
          <TouchableOpacity onPress={onCancel} style={{ padding: spacing.sm }}>
            <IconSymbol name="arrow.left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={typography.h2}>
            {isEditing ? 'Editar Paciente' : 'Nuevo Paciente'}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
          {/* Name */}
          <View style={{ marginBottom: spacing.md }}>
            <Text style={[typography.body, { marginBottom: spacing.sm }]}>
              Nombre Completo *
            </Text>
            <TextInput
              style={[
                commonStyles.input,
                errors.nombre && commonStyles.inputError,
              ]}
              value={formData.nombre}
              onChangeText={(value) => handleInputChange('nombre', value)}
              placeholder="Ingrese el nombre completo"
              placeholderTextColor={colors.textSecondary}
            />
            {errors.nombre && <Text style={commonStyles.errorText}>{errors.nombre}</Text>}
          </View>

          {/* Birth Date */}
          <View style={{ marginBottom: spacing.md }}>
            <Text style={[typography.body, { marginBottom: spacing.sm }]}>
              Fecha de Nacimiento * {age !== null && `(${age} años)`}
            </Text>
            <TouchableOpacity
              style={[
                commonStyles.input,
                commonStyles.row,
                commonStyles.spaceBetween,
                errors.fechaNacimiento && commonStyles.inputError,
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[typography.body, { color: formData.fechaNacimiento ? colors.text : colors.textSecondary }]}>
                {formData.fechaNacimiento || 'Seleccione fecha'}
              </Text>
              <IconSymbol name="calendar" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            {errors.fechaNacimiento && <Text style={commonStyles.errorText}>{errors.fechaNacimiento}</Text>}
          </View>

          {/* ID Type */}
          <View style={{ marginBottom: spacing.md }}>
            <Text style={[typography.body, { marginBottom: spacing.sm }]}>
              Tipo de Identificación *
            </Text>
            <View style={[commonStyles.row, { gap: spacing.sm }]}>
              <TouchableOpacity
                style={[
                  commonStyles.button,
                  { flex: 1 },
                  formData.tipoId === 'rut' ? commonStyles.buttonPrimary : { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
                ]}
                onPress={() => handleInputChange('tipoId', 'rut')}
              >
                <Text style={[
                  commonStyles.buttonText,
                  formData.tipoId !== 'rut' && { color: colors.text },
                ]}>
                  RUT
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  commonStyles.button,
                  { flex: 1 },
                  formData.tipoId === 'pasaporte' ? commonStyles.buttonPrimary : { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
                ]}
                onPress={() => handleInputChange('tipoId', 'pasaporte')}
              >
                <Text style={[
                  commonStyles.buttonText,
                  formData.tipoId !== 'pasaporte' && { color: colors.text },
                ]}>
                  Pasaporte
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ID Value */}
          <View style={{ marginBottom: spacing.md }}>
            <Text style={[typography.body, { marginBottom: spacing.sm }]}>
              {formData.tipoId === 'rut' ? 'RUT' : 'Pasaporte'} *
            </Text>
            <TextInput
              style={[
                commonStyles.input,
                errors.valorId && commonStyles.inputError,
              ]}
              value={formData.valorId}
              onChangeText={(value) => handleInputChange('valorId', value)}
              placeholder={formData.tipoId === 'rut' ? '12.345.678-9' : 'Número de pasaporte'}
              placeholderTextColor={colors.textSecondary}
              keyboardType="default"
              autoCapitalize="characters"
            />
            {errors.valorId && <Text style={commonStyles.errorText}>{errors.valorId}</Text>}
          </View>

          {/* Phone */}
          <View style={{ marginBottom: spacing.md }}>
            <Text style={[typography.body, { marginBottom: spacing.sm }]}>
              Teléfono
            </Text>
            <TextInput
              style={[
                commonStyles.input,
                errors.telefono && commonStyles.inputError,
              ]}
              value={formData.telefono}
              onChangeText={(value) => handleInputChange('telefono', value)}
              placeholder="+56 9 1234 5678"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
            />
            {errors.telefono && <Text style={commonStyles.errorText}>{errors.telefono}</Text>}
          </View>

          {/* Email */}
          <View style={{ marginBottom: spacing.md }}>
            <Text style={[typography.body, { marginBottom: spacing.sm }]}>
              Correo Electrónico
            </Text>
            <TextInput
              style={[
                commonStyles.input,
                errors.correo && commonStyles.inputError,
              ]}
              value={formData.correo}
              onChangeText={(value) => handleInputChange('correo', value)}
              placeholder="correo@ejemplo.com"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.correo && <Text style={commonStyles.errorText}>{errors.correo}</Text>}
          </View>

          {/* Medical History */}
          <View style={{ marginBottom: spacing.xl }}>
            <Text style={[typography.body, { marginBottom: spacing.sm }]}>
              Historial Médico
            </Text>
            <TextInput
              style={[
                commonStyles.input,
                { height: 100, textAlignVertical: 'top' },
              ]}
              value={formData.historialMedico}
              onChangeText={(value) => handleInputChange('historialMedico', value)}
              placeholder="Información médica relevante (opcional)"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              commonStyles.button,
              commonStyles.buttonPrimary,
              { marginBottom: spacing.xl },
              loading && { opacity: 0.7 },
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={commonStyles.buttonText}>
              {loading ? 'Guardando...' : isEditing ? 'Actualizar Paciente' : 'Crear Paciente'}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={formData.fechaNacimiento ? new Date(formData.fechaNacimiento) : new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}
      </View>
    </SafeAreaView>
  );
}