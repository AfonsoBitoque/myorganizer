import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = join(root, '.env');

if (!existsSync(envPath)) {
  console.error('❌ Ficheiro .env não encontrado em:', envPath);
  console.error('   Cria com: cp .env.example .env');
  process.exit(1);
}

const content = readFileSync(envPath, 'utf8');
const vars = {};
for (const line of content.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eq = trimmed.indexOf('=');
  if (eq === -1) continue;
  vars[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
}

const required = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

let ok = true;
for (const key of required) {
  const value = vars[key] ?? '';
  if (!value || value.startsWith('your_') || value === 'placeholder') {
    console.error(`❌ ${key} — vazio ou valor de exemplo`);
    ok = false;
    continue;
  }
  const preview = key.includes('API_KEY')
    ? `${value.slice(0, 8)}... (${value.length} chars)`
    : value;
  console.log(`✅ ${key} = ${preview}`);
}

const apiKey = vars.VITE_FIREBASE_API_KEY ?? '';
if (apiKey && !apiKey.startsWith('AIza')) {
  console.error('❌ VITE_FIREBASE_API_KEY deve começar por AIza');
  ok = false;
}

const appId = vars.VITE_FIREBASE_APP_ID ?? '';
if (appId && !/^1:\d+:web:[a-zA-Z0-9]+$/.test(appId)) {
  console.error('❌ VITE_FIREBASE_APP_ID incompleto — falta parte depois de web:');
  console.error('   Exemplo: 1:530473691634:web:abc123def456');
  ok = false;
}

const projectId = vars.VITE_FIREBASE_PROJECT_ID ?? '';
const authDomain = vars.VITE_FIREBASE_AUTH_DOMAIN ?? '';
if (projectId && authDomain && !authDomain.startsWith(`${projectId}.`)) {
  console.error(`❌ PROJECT_ID (${projectId}) não coincide com AUTH_DOMAIN (${authDomain})`);
  ok = false;
}

if (!ok) {
  console.error('\nCorrige o .env e reinicia: npm run dev');
  process.exit(1);
}

console.log('\n✅ .env parece correto. Se a app ainda falhar, reinicia o servidor (Ctrl+C → npm run dev).');
