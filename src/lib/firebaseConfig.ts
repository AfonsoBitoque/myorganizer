const ENV_KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

function readEnv(key: (typeof ENV_KEYS)[number]): string {
  const value = import.meta.env[key];
  return typeof value === 'string' ? value.trim() : '';
}

export function getFirebaseConfigErrors(): string[] {
  const errors: string[] = [];
  const values = Object.fromEntries(ENV_KEYS.map((key) => [key, readEnv(key)]));

  for (const key of ENV_KEYS) {
    const value = values[key];
    if (!value || value.startsWith('your_') || value === 'placeholder') {
      errors.push(`${key} está vazio ou ainda tem valor de exemplo.`);
    }
  }

  const apiKey = values.VITE_FIREBASE_API_KEY;
  if (apiKey && !apiKey.startsWith('AIza')) {
    errors.push('VITE_FIREBASE_API_KEY deve começar por "AIza".');
  }

  const appId = values.VITE_FIREBASE_APP_ID;
  if (appId && !/^1:\d+:web:[a-zA-Z0-9]+$/.test(appId)) {
    errors.push('VITE_FIREBASE_APP_ID está incompleto. Deve ser tipo: 1:123456789:web:abc123def456');
  }

  const projectId = values.VITE_FIREBASE_PROJECT_ID;
  const authDomain = values.VITE_FIREBASE_AUTH_DOMAIN;
  if (projectId && authDomain && !authDomain.startsWith(`${projectId}.`)) {
    errors.push(
      `VITE_FIREBASE_PROJECT_ID ("${projectId}") não coincide com AUTH_DOMAIN ("${authDomain}").`,
    );
  }

  return errors;
}

export function getFirebaseConfig() {
  return {
    apiKey: readEnv('VITE_FIREBASE_API_KEY'),
    authDomain: readEnv('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: readEnv('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: readEnv('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: readEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: readEnv('VITE_FIREBASE_APP_ID'),
  };
}

export function isFirebaseConfigured(): boolean {
  return getFirebaseConfigErrors().length === 0;
}

export function getAllowedEmail(): string {
  const value = import.meta.env.VITE_ALLOWED_EMAIL;
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

export function isAllowedEmail(email: string): boolean {
  const allowed = getAllowedEmail();
  if (!allowed) return true;
  return email.trim().toLowerCase() === allowed;
}
