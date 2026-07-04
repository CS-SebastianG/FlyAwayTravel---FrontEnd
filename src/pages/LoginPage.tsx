import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, extractErrorMessage } from '../api';
import { useAuth } from '../auth/AuthContext';
import { AuthToken, LoginPayload } from '../types';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState<LoginPayload>({ email: '', password: '' });
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleChange(field: keyof LoginPayload, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate(): string | null {
    if (!form.email.trim()) return 'El email es obligatorio.';
    if (!form.password.trim()) return 'La contraseña es obligatoria.';
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError(null);

    const validationMessage = validate();
    if (validationMessage) {
      setFieldError(validationMessage);
      return;
    }
    setFieldError(null);

    setLoading(true);
    try {
      const res = await api.post<AuthToken>('/auth/login', form);
      login(res.data.token);
      navigate('/search');
    } catch (error) {
      setServerError(extractErrorMessage(error, 'Credenciales incorrectas.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page page-narrow">
      <h1>Iniciar sesión</h1>
      <p className="page-subtitle">Ingresa con tu cuenta de Fly Away Travel.</p>

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
          <span>Contraseña</span>
          <input
            type="password"
            value={form.password}
            onChange={(e) => handleChange('password', e.target.value)}
            placeholder="••••••••"
          />
        </label>

        {fieldError && <div className="alert alert-error">{fieldError}</div>}
        {serverError && <div className="alert alert-error">{serverError}</div>}

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>

      <p className="page-footer-link">
        ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
      </p>
    </div>
  );
}
