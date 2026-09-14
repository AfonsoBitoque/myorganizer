import { useState, FormEvent } from 'react';
import { useAuth, getAllowedEmail } from '@/context/AuthContext';

export function Login() {
  const { login } = useAuth();
  const allowedEmail = getAllowedEmail();
  const [email, setEmail] = useState(allowedEmail);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(
        message.includes('auth/unauthorized-email')
          ? 'Acesso restrito. Apenas o proprietário pode entrar.'
          : message.includes('auth/invalid-credential')
            ? 'Email ou password incorretos'
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
            readOnly={!!allowedEmail}
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
            autoComplete="current-password"
            placeholder="••••••••"
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'A aguardar...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
