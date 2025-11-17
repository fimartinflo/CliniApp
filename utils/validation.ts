import { FormErrors, PatientFormData } from '@/types';

export const validateRUT = (rut: string): boolean => {
  // Limpiar el RUT: eliminar puntos, guiones y espacios, convertir a mayúsculas
  const cleanRUT = rut.replace(/[.\-\s]/g, '').toUpperCase();
  
  // Verificar formato básico: 7-8 dígitos + dígito verificador (0-9 o K)
  if (!/^\d{7,8}[0-9K]$/.test(cleanRUT)) {
    return false;
  }

  const body = cleanRUT.slice(0, -1);
  const dv = cleanRUT.slice(-1);
  
  // Calcular el dígito verificador esperado
  let sum = 0;
  let multiplier = 2;

  // Recorrer el cuerpo de atrás hacia adelante
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const expectedDv = 11 - (sum % 11);
  const computedDv = expectedDv === 11 ? '0' : expectedDv === 10 ? 'K' : expectedDv.toString();

  return dv === computedDv;
};

export const formatRUT = (rut: string): string => {
  // Si está vacío, retornar vacío
  if (!rut || rut.length === 0) return '';
  
  // Limpiar el RUT: eliminar todo excepto números y K/k, convertir a mayúsculas
  const clean = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  
  if (clean.length <= 1) return clean;
  
  // Separar cuerpo y dígito verificador
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  
  // Si el cuerpo está vacío después de limpiar, retornar solo el dígito verificador
  if (body.length === 0) return dv;
  
  // Formatear el cuerpo con puntos cada 3 dígitos desde el final
  let formattedBody = '';
  for (let i = body.length - 1, j = 1; i >= 0; i--, j++) {
    formattedBody = body[i] + formattedBody;
    if (j % 3 === 0 && i > 0) {
      formattedBody = '.' + formattedBody;
    }
  }
  
  return `${formattedBody}-${dv}`;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // Formato más flexible para teléfonos chilenos
  const cleanPhone = phone.replace(/\D/g, '');
  
  // +569XXXXXXXX (11 dígitos con +56) o 9XXXXXXXX (9 dígitos)
  return (cleanPhone.length === 11 && cleanPhone.startsWith('569')) || 
         (cleanPhone.length === 9 && cleanPhone.startsWith('9')) ||
         (cleanPhone.length === 8); // 8 dígitos sin prefijo
};

export const formatPhone = (phone: string): string => {
  // Eliminar todo excepto números
  const clean = phone.replace(/\D/g, '');
  
  if (clean.length === 0) return '';
  
  // Si tiene 9 dígitos y empieza con 9, formatear como +56 9 XXXX XXXX
  if (clean.length === 9 && clean.startsWith('9')) {
    return `+56 ${clean.slice(0, 1)} ${clean.slice(1, 5)} ${clean.slice(5)}`;
  }
  
  // Si tiene 8 dígitos, asumir que es chileno y agregar +56 9
  if (clean.length === 8) {
    return `+56 9 ${clean.slice(0, 4)} ${clean.slice(4)}`;
  }
  
  // Si tiene 11 dígitos y empieza con 569, formatear como +56 9 XXXX XXXX
  if (clean.length === 11 && clean.startsWith('569')) {
    return `+56 ${clean.slice(2, 3)} ${clean.slice(3, 7)} ${clean.slice(7)}`;
  }
  
  // Para otros casos, retornar el valor original
  return phone;
};

export const validatePatientForm = (data: PatientFormData): FormErrors => {
  const errors: FormErrors = {};
  
  // Validar nombre
  if (!data.nombre.trim()) {
    errors.nombre = 'El nombre es obligatorio';
  } else if (data.nombre.trim().length < 2) {
    errors.nombre = 'El nombre debe tener al menos 2 caracteres';
  }
  
  // Validar fecha de nacimiento
  if (!data.fechaNacimiento) {
    errors.fechaNacimiento = 'La fecha de nacimiento es obligatoria';
  } else {
    const birthDate = new Date(data.fechaNacimiento);
    const today = new Date();
    if (birthDate > today) {
      errors.fechaNacimiento = 'La fecha de nacimiento no puede ser futura';
    }
    
    // Validar edad mínima (por ejemplo, al menos 1 año)
    const age = calculateAge(data.fechaNacimiento);
    if (age < 1) {
      errors.fechaNacimiento = 'La fecha de nacimiento no es válida';
    }
  }
  
  // Validar identificación
  if (!data.valorId.trim()) {
    errors.valorId = `${data.tipoId === 'rut' ? 'El RUT' : 'El pasaporte'} es obligatorio`;
  } else if (data.tipoId === 'rut') {
    // Validar formato de RUT
    const cleanRut = data.valorId.replace(/[.\-\s]/g, '').toUpperCase();
    if (!/^\d{7,8}[0-9K]$/.test(cleanRut)) {
      errors.valorId = 'El formato del RUT no es válido (ej: 12.345.678-9 o 12.345.678-K)';
    } else if (!validateRUT(data.valorId)) {
      errors.valorId = 'El RUT no es válido';
    }
  } else if (data.tipoId === 'pasaporte') {
    if (data.valorId.trim().length < 3) {
      errors.valorId = 'El pasaporte debe tener al menos 3 caracteres';
    }
  }
  
  // Validar teléfono (opcional)
  if (data.telefono && data.telefono.trim()) {
    if (!validatePhone(data.telefono)) {
      errors.telefono = 'El formato del teléfono no es válido (ej: +56 9 1234 5678)';
    }
  }
  
  // Validar email (opcional)
  if (data.correo && data.correo.trim() && !validateEmail(data.correo)) {
    errors.correo = 'Formato de correo inválido';
  }
  
  return errors;
};

export const calculateAge = (birthDate: string): number => {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  }
  
  return `${hours}h ${mins}m`;
};