import { getFirebaseConfigErrors } from '@/lib/firebaseConfig';

export function FirebaseSetupError() {
  const errors = getFirebaseConfigErrors();

  return (
    <div className="login-page">
      <div className="login-logo">⚠️</div>
      <h1 className="login-title">Firebase mal configurado</h1>
      <p className="login-subtitle">Corrige o ficheiro <code>.env</code> na raiz do projeto</p>

      <div
        className="login-form"
        style={{ textAlign: 'left', maxWidth: 520 }}
      >
        <ul style={{ marginBottom: 20, paddingLeft: 20, color: 'var(--danger)' }}>
          {errors.map((error) => (
            <li key={error} style={{ marginBottom: 8 }}>{error}</li>
          ))}
        </ul>

        <div className="card" style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
          <p><strong>Checklist:</strong></p>
          <ol style={{ paddingLeft: 20, marginTop: 8 }}>
            <li>O ficheiro chama-se <code>.env</code> (não <code>.env.example</code>)</li>
            <li>Está na mesma pasta que <code>package.json</code></li>
            <li>Sem aspas nos valores: <code>KEY=valor</code></li>
            <li>Depois de editar: para o servidor e corre <code>npm run dev</code></li>
          </ol>
        </div>
      </div>
    </div>
  );
}
