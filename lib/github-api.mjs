export const REPO_OWNER = 'AfonsoBitoque';
export const REPO_NAME = 'EstudoMestrado';
export const DEFAULT_BRANCH = 'main';

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutos
const cache = new Map();

function githubHeaders(token) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'MyOrganizer-PWA',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function withCache(key, fetcher) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return hit.value;
  }
  const value = await fetcher();
  cache.set(key, { value, at: Date.now() });
  return value;
}

export async function fetchRepoInfo(token) {
  return withCache(`repo:${token ? 'auth' : 'anon'}`, async () => {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;
    const res = await fetch(url, { headers: githubHeaders(token) });
    const data = await res.json();
    return { status: res.status, data };
  });
}

export async function fetchContents(path = '', token) {
  return withCache(`contents:${path}:${token ? 'auth' : 'anon'}`, async () => {
    const encodedPath = path ? `/${path.split('/').map(encodeURIComponent).join('/')}` : '';
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents${encodedPath}`;
    const res = await fetch(url, { headers: githubHeaders(token) });
    const data = await res.json();
    return { status: res.status, data };
  });
}

/** Lê ficheiros via raw.githubusercontent.com — não conta para o rate limit da REST API */
export async function fetchFileContentRaw(path, branch = DEFAULT_BRANCH) {
  return withCache(`raw:${branch}:${path}`, async () => {
    const encodedPath = path.split('/').map(encodeURIComponent).join('/');
    const url = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${branch}/${encodedPath}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'MyOrganizer-PWA' } });
    if (!res.ok) {
      const text = await res.text();
      return {
        status: res.status,
        data: { message: text || res.statusText, path },
      };
    }
    const content = await res.text();
    return {
      status: 200,
      data: {
        path,
        name: path.split('/').pop(),
        type: 'file',
        decodedContent: content,
      },
    };
  });
}

export async function fetchFileContent(path, token, branch = DEFAULT_BRANCH) {
  // Preferir raw — sem rate limit da API REST
  const raw = await fetchFileContentRaw(path, branch);
  if (raw.status === 200) return raw;

  // Fallback para Contents API (ficheiros grandes ou raw indisponível)
  const { status, data } = await fetchContents(path, token);
  if (status !== 200 || data.type !== 'file') {
    return { status, data };
  }
  if (data.content && data.encoding === 'base64') {
    const content = Buffer.from(data.content, 'base64').toString('utf8');
    return { status, data: { ...data, decodedContent: content } };
  }
  if (data.download_url) {
    const fileRes = await fetch(data.download_url, { headers: githubHeaders(token) });
    const content = await fileRes.text();
    return { status: fileRes.status, data: { ...data, decodedContent: content } };
  }
  return { status, data };
}
