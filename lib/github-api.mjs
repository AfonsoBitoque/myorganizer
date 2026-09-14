export const REPO_OWNER = 'AfonsoBitoque';
export const REPO_NAME = 'EstudoMestrado';
export const DEFAULT_BRANCH = 'main';

function githubHeaders(token) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'MyOrganizer-PWA',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function fetchRepoInfo(token) {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;
  const res = await fetch(url, { headers: githubHeaders(token) });
  const data = await res.json();
  return { status: res.status, data };
}

export async function fetchContents(path = '', token) {
  const encodedPath = path ? `/${path.split('/').map(encodeURIComponent).join('/')}` : '';
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents${encodedPath}`;
  const res = await fetch(url, { headers: githubHeaders(token) });
  const data = await res.json();
  return { status: res.status, data };
}

export async function fetchFileContent(path, token) {
  const { status, data } = await fetchContents(path, token);
  if (status !== 200 || data.type !== 'file') {
    return { status, data };
  }
  if (data.content && data.encoding === 'base64') {
    const content = Buffer.from(data.content, 'base64').toString('utf8');
    return { status, data: { ...data, decodedContent: content } };
  }
  if (data.download_url) {
    const raw = await fetch(data.download_url, { headers: githubHeaders(token) });
    const content = await raw.text();
    return { status: raw.status, data: { ...data, decodedContent: content } };
  }
  return { status, data };
}
