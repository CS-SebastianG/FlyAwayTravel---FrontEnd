import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, extractErrorMessage } from '../api';
import { NewId, RegisterPayload } from '../types';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterPayload>({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
  });
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleChange(field: keyof RegisterPayload, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate(): string | null {
    if (!form.email.trim()) return 'El email es obligatorio.';
    if (!form.firstName.trim()) return 'El nombre es obligatorio.';
    if (!form.lastName.trim()) return 'El apellido es obligatorio.';
    if (!form.password.trim()) return 'La contraseña es obligatoria.';
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError(null);
    setSuccessMessage(null);

    const validationMessage = validate();
    if (validationMessage) {
      setFieldError(validationMessage);
      return;
    }
    setFieldError(null);

    setLoading(true);
    try {
      await api.post<NewId>('/users/register', form);
      setSuccessMessage('¡Cuenta creada con éxito! Redirigiendo al login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (error) {
      setServerError(extractErrorMessage(error, 'No se pudo completar el registro.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page page-narrow">
      <h1>Crear cuenta</h1>
      <p className="page-subtitle">Regístrate para poder reservar vuelos.</p>

      <form className="card form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="alice@example.com"
          />
        </label>

        <label className="field">
          <span>Nombre</span>
          <input
            type="text"
            value={form.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            placeholder="Alice"
          />
        </label>

        <label className="field">
          <span>Apellido</span>
          <input
            type="text"
            value={form.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            placeholder="Smith"
          />
        </label>

        <label className="field">
          <span>Contraseña</span>
          <input
            type="password"
            value={form.password}
            onChange={(e) => handleChange('password', e.target.value)}
            placeholder="Mínimo 8 caracteres, 1 mayúscula y 1 número"
          />
        </label>

        {fieldError && <div className="alert alert-error">{fieldError}</div>}
        {serverError && <div className="alert alert-error">{serverError}</div>}
        {successMessage && <div className="alert alert-success">{successMessage}</div>}

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrarme'}
        </button>
      </form>

      <p className="page-footer-link">
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </div>
  );
}
