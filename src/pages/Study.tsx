import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { StudyViewer } from '@/pages/StudyViewer';
import {
  getFileContent,
  getFileIcon,
  getRepoInfo,
  isMarkdownFile,
  listContents,
} from '@/lib/github';
import type { GitHubContentItem } from '@/types/github';

export function Study() {
  const navigate = useNavigate();
  const { '*': splat } = useParams();
  const currentPath = splat ?? '';
  const [items, setItems] = useState<GitHubContentItem[]>([]);
  const [branch, setBranch] = useState('main');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewing, setViewing] = useState<{ path: string; content: string } | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      setViewing(null);
      try {
        const repo = await getRepoInfo();
        if (!cancelled) setBranch(repo.default_branch || 'main');

        const contents = await listContents(currentPath);
        if (cancelled) return;

        const sorted = [...contents].sort((a, b) => {
          if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
          return a.name.localeCompare(b.name, 'pt');
        });
        setItems(sorted);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erro ao carregar ficheiros');
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [currentPath]);

  const breadcrumbs = currentPath
    ? ['Estudo', ...currentPath.split('/')]
    : ['Estudo'];

  const navigateTo = (path: string) => {
    navigate(path ? `/study/${path}` : '/study');
  };

  const openItem = async (item: GitHubContentItem) => {
    if (item.type === 'dir') {
      navigateTo(item.path);
      return;
    }

    if (isMarkdownFile(item.name)) {
      setLoadingFile(true);
      try {
        const { content } = await getFileContent(item.path);
        setViewing({ path: item.path, content });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao abrir ficheiro');
      } finally {
        setLoadingFile(false);
      }
      return;
    }

    if (item.download_url) {
      window.open(item.download_url, '_blank', 'noopener,noreferrer');
    }
  };

  if (viewing) {
    return (
      <StudyViewer
        path={viewing.path}
        content={viewing.content}
        branch={branch}
        onBack={() => setViewing(null)}
      />
    );
  }

  return (
    <div className="page study-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Estudo</h1>
          <p className="page-subtitle">EstudoMestrado no GitHub</p>
        </div>
        <a
          className="btn btn-ghost btn-sm"
          href="https://github.com/AfonsoBitoque/EstudoMestrado"
          target="_blank"
          rel="noopener noreferrer"
        >
          ↗ Repo
        </a>
      </div>

      <nav className="study-breadcrumbs" aria-label="Navegação">
        {breadcrumbs.map((crumb, i) => {
          const path = i === 0 ? '' : breadcrumbs.slice(1, i + 1).join('/');
          const isLast = i === breadcrumbs.length - 1;
          return (
            <span key={path || 'root'}>
              {i > 0 && <span className="study-crumb-sep">/</span>}
              {isLast ? (
                <span className="study-crumb-current">{crumb}</span>
              ) : (
                <button type="button" className="study-crumb-link" onClick={() => navigateTo(path)}>
                  {crumb}
                </button>
              )}
            </span>
          );
        })}
      </nav>

      {loading && (
        <div className="loading">
          <div className="spinner" />
        </div>
      )}

      {loadingFile && (
        <div className="study-loading-file">A abrir ficheiro...</div>
      )}

      {error && !loading && (
        <div className="login-error" style={{ marginBottom: 16 }}>
          {error}
          {error.includes('empty') || error.includes('Not Found') ? (
            <p style={{ marginTop: 8, fontSize: '0.85rem' }}>
              O repositório ainda está vazio. Faz push dos teus ficheiros para o GitHub.
            </p>
          ) : null}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <p>Esta pasta está vazia</p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <ul className="study-file-list">
          {currentPath && (
            <li>
              <button
                type="button"
                className="study-file-item"
                onClick={() => {
                  const parent = currentPath.includes('/')
                    ? currentPath.slice(0, currentPath.lastIndexOf('/'))
                    : '';
                  navigateTo(parent);
                }}
              >
                <span className="study-file-icon">⬆️</span>
                <span className="study-file-name">..</span>
                <span className="study-file-meta">Pasta anterior</span>
              </button>
            </li>
          )}
          {items.map((item) => (
            <li key={item.path}>
              <button type="button" className="study-file-item" onClick={() => openItem(item)}>
                <span className="study-file-icon">{getFileIcon(item.name, item.type)}</span>
                <span className="study-file-name">{item.name}</span>
                <span className="study-file-meta">
                  {item.type === 'dir' ? 'Pasta' : `${Math.max(1, Math.round(item.size / 1024))} KB`}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
