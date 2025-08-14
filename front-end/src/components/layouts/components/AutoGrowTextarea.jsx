import React, { useEffect, useMemo, useRef, useState } from 'react';
import './AutoGrowTextarea.css';

/**
 * Props nuevas:
 * - kind: 'text' | 'digits' | 'email' | 'ruc' | 'phone' | 'alphanumeric'
 * - required?: boolean
 * - onValidChange?: (isValid: boolean) => void   // útil si el padre quiere saber el estado
 * - errorMessage?: string                         // para override de mensaje
 *
 * Notas:
 * - Para kind 'digits' | 'phone' | 'ruc' se sanea la entrada (se remueven no-dígitos).
 * - 'ruc' valida 13 dígitos y cédula (primeros 10) con checksum estándar EC.
 * - 'email' valida con regex simple (suficiente para formularios).
 */

const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

const isOnlyDigits = (s) => /^\d+$/.test(s);

const validaCedulaEC = (cedula10) => {
  if (!/^\d{10}$/.test(cedula10)) return false;
  const prov = parseInt(cedula10.slice(0, 2), 10);
  if (prov < 1 || prov > 24) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let n = parseInt(cedula10[i], 10);
    if (i % 2 === 0) { // posiciones impares (0-based)
      n = n * 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  }
  const verificador = (10 - (sum % 10)) % 10;
  return verificador === parseInt(cedula10[9], 10);
};

const isValidRUC = (s) => {
  // Regla práctica: 13 dígitos, últimos 3 != "000", y los primeros 10 forman cédula válida.
  if (!/^\d{13}$/.test(s)) return false;
  if (s.slice(-3) === '000') return false;
  return validaCedulaEC(s.slice(0, 10));
};

const AutoGrowTextarea = ({
  id,
  name,
  label,
  placeholder = '',
  value,
  onChange,
  maxLength = 100,
  className = '',
  disabled = false,
  rows = 1,
  required = false,

  // NUEVO
  kind = 'text',                 // 'text' | 'digits' | 'email' | 'ruc' | 'phone' | 'alphanumeric'
  onValidChange,
  errorMessage,
}) => {
  const ref = useRef(null);
  const [touched, setTouched] = useState(false);
  const [internalValue, setInternalValue] = useState(value ?? '');

  // autosize
  const autoResize = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  // sync externo -> interno
  useEffect(() => {
    setInternalValue(value ?? '');
  }, [value]);

  useEffect(() => {
    autoResize();
  }, [internalValue]);

  // saneo según kind
  const sanitize = (s) => {
    if (kind === 'digits' || kind === 'phone' || kind === 'ruc') {
      return (s || '').replace(/\D+/g, '');
    }
    if (kind === 'alphanumeric') {
      return (s || '').replace(/[^a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ.,\-_/()]/g, '');
    }
    // 'text' y 'email' no se sanea agresivamente
    return s;
  };

  // validación según kind
  const isValid = useMemo(() => {
    const v = internalValue?.toString() ?? '';
    if (required && v.trim().length === 0) return false;

    if (v.length === 0) return !required; // vacío permitido si no es requerido

    switch (kind) {
      case 'digits':
        return isOnlyDigits(v);
      case 'phone':
        return isOnlyDigits(v) && v.length >= 7 && v.length <= 10;
      case 'ruc':
        return isValidRUC(v);
      case 'email':
        return isEmail(v);
      case 'alphanumeric':
        return true; // ya saneado
      case 'text':
      default:
        return true;
    }
  }, [internalValue, required, kind]);

  useEffect(() => {
    onValidChange?.(isValid);
  }, [isValid, onValidChange]);

  const nearLimit = (maxLength - (internalValue?.length || 0)) <= 10;

  // inputMode / pattern para móviles
  const inputMode =
    kind === 'digits' || kind === 'phone' || kind === 'ruc'
      ? 'numeric'
      : kind === 'email'
      ? 'email'
      : 'text';

  const pattern =
    kind === 'digits' || kind === 'phone' || kind === 'ruc'
      ? '[0-9]*'
      : undefined;

  const computedErrorMessage =
    errorMessage ||
    (required && (internalValue ?? '').trim() === ''
      ? 'Este campo es obligatorio.'
      : kind === 'email'
      ? 'Formato de correo no válido.'
      : kind === 'ruc'
      ? 'RUC inválido (13 dígitos, cédula válida, últimos 3 ≠ 000).'
      : kind === 'phone'
      ? 'Teléfono inválido (7 a 10 dígitos).'
      : kind === 'digits'
      ? 'Solo números.'
      : 'Valor inválido.');

  return (
    <div className={`agt-wrapper ${className} ${touched && !isValid ? 'agt-error' : ''}`}>
      {label && (
        <label htmlFor={id} className="agt-label">
          {label}
        </label>
      )}

      <textarea
        ref={ref}
        id={id}
        name={name}
        className="agt-textarea"
        placeholder={placeholder}
        value={internalValue}
        onChange={(e) => {
          const raw = e.target.value?.slice(0, maxLength);
          const next = sanitize(raw);
          setInternalValue(next);
          // Propagamos como siempre hacia arriba
          onChange?.({ target: { value: next, name, id } });
        }}
        onInput={autoResize}
        onBlur={() => setTouched(true)}
        maxLength={maxLength}
        rows={rows}
        disabled={disabled}
        inputMode={inputMode}
        pattern={pattern}
        aria-invalid={touched && !isValid}
        aria-describedby={touched && !isValid ? `${id}-error` : undefined}
        autoComplete={kind === 'email' ? 'email' : undefined}
      />

      <div className="agt-meta">
        <small className={`agt-counter ${nearLimit ? 'warn' : ''}`}>
          {(internalValue?.length || 0)}/{maxLength}
        </small>
        {touched && !isValid && (
          <small id={`${id}-error`} className="agt-error-text">
            {computedErrorMessage}
          </small>
        )}
      </div>
    </div>
  );
};

export default AutoGrowTextarea;
