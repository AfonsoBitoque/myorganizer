import type { GitHubContentItem, GitHubRepoInfo } from '@/types/github';

const API = '/api/github';

async function githubFetch<T>(params: Record<string, string>): Promise<T> {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API}?${query}`);
  const data = await res.json();
  if (!res.ok) {
    const raw = data.message || `Erro GitHub (${res.status})`;
    if (/rate limit/i.test(raw)) {
      throw new Error(
        'Limite da API GitHub atingido. Adiciona GITHUB_TOKEN ao .env (local) ou à Vercel e reinicia. ' +
          'Vê: https://github.com/settings/tokens (scope: public_repo)',
      );
    }
    throw new Error(raw);
  }
  return data as T;
}

export async function getRepoInfo(): Promise<GitHubRepoInfo> {
  return githubFetch({ action: 'repo' });
}

export async function listContents(path = ''): Promise<GitHubContentItem[]> {
  const data = await githubFetch<GitHubContentItem | GitHubContentItem[]>({
    action: 'contents',
    path,
  });
  return Array.isArray(data) ? data : [data];
}

export async function getFileContent(
  path: string,
  branch = 'main',
): Promise<{ content: string; item: GitHubContentItem }> {
  const data = await githubFetch<GitHubContentItem & { decodedContent?: string }>({
    action: 'file',
    path,
    branch,
  });
  const content = data.decodedContent ?? '';
  return { content, item: data };
}

export function getRawBaseUrl(branch = 'main'): string {
  return `https://raw.githubusercontent.com/AfonsoBitoque/EstudoMestrado/${branch}`;
}

export function resolveRelativeUrl(relativePath: string, filePath: string, branch = 'main'): string {
  const base = getRawBaseUrl(branch);
  const dir = filePath.includes('/') ? filePath.slice(0, filePath.lastIndexOf('/')) : '';
  const segments = dir ? dir.split('/') : [];
  for (const segment of relativePath.split('/')) {
    if (segment === '..') segments.pop();
    else if (segment !== '.' && segment) segments.push(segment);
  }
  return `${base}/${segments.join('/')}`;
}

export function isMarkdownFile(name: string): boolean {
  return /\.(md|markdown)$/i.test(name);
}

export function getFileIcon(name: string, type: 'file' | 'dir'): string {
  if (type === 'dir') return '📁';
  if (isMarkdownFile(name)) return '📝';
  if (/\.(pdf)$/i.test(name)) return '📕';
  if (/\.(png|jpe?g|gif|webp|svg)$/i.test(name)) return '🖼️';
  if (/\.(py|js|ts|tsx|jsx|java|c|cpp|h)$/i.test(name)) return '💻';
  return '📄';
}
