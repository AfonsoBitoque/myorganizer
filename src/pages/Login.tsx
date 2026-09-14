import { useState, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';

export function Login() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register(email, password);
      } else {
        await login(email, password);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(
        message.includes('auth/invalid-credential')
          ? 'Email ou password incorretos'
          : message.includes('auth/email-already-in-use')
            ? 'Este email já está registado'
            : message.includes('auth/weak-password')
              ? 'Password deve ter pelo menos 6 caracteres'
              : 'Ocorreu um erro. Tenta novamente.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-logo">🎓</div>
      <h1 className="login-title">MyOrganizer</h1>
      <p className="login-subtitle">Organizador do teu mestrado em Eng. Informática</p>

      <form className="login-form" onSubmit={handleSubmit}>
        {error && <div className="login-error">{error}</div>}

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="teu@email.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            placeholder="••••••••"
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'A aguardar...' : isRegister ? 'Criar conta' : 'Entrar'}
        </button>

        <button
          type="button"
          className="btn btn-ghost"
          style={{ width: '100%', marginTop: 12 }}
          onClick={() => {
            setIsRegister(!isRegister);
            setError('');
          }}
        >
          {isRegister ? 'Já tenho conta — Entrar' : 'Criar conta nova'}
        </button>
      </form>
    </div>
  );
}
