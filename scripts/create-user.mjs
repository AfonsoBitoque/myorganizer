import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = join(root, '.env');

function loadEnv() {
  if (!existsSync(envPath)) {
    console.error('❌ .env não encontrado. Cria com: cp .env.example .env');
    process.exit(1);
  }
  const vars = {};
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    vars[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return vars;
}

const vars = loadEnv();
const email = vars.VITE_ALLOWED_EMAIL;
const password = process.env.SETUP_PASSWORD;

if (!email) {
  console.error('❌ Define VITE_ALLOWED_EMAIL no .env');
  process.exit(1);
}

if (!password || password.length < 6) {
  console.error('❌ Define uma password (mín. 6 chars):');
  console.error('   SETUP_PASSWORD=a_tua_password npm run create-account');
  process.exit(1);
}

const app = initializeApp({
  apiKey: vars.VITE_FIREBASE_API_KEY,
  authDomain: vars.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: vars.VITE_FIREBASE_PROJECT_ID,
  storageBucket: vars.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: vars.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: vars.VITE_FIREBASE_APP_ID,
});

const auth = getAuth(app);

try {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  console.log(`✅ Conta criada: ${cred.user.email}`);
  console.log('   Agora podes entrar na app com este email e password.');
} catch (err) {
  if (err.code === 'auth/email-already-in-use') {
    console.log(`✅ A conta ${email} já existe. Usa a password que definiste para entrar.`);
  } else {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
}
