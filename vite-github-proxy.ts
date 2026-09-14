import type { Plugin } from 'vite';
import {
  fetchContents,
  fetchFileContent,
  fetchRepoInfo,
} from './lib/github-api.mjs';

export function githubProxyPlugin(): Plugin {
  return {
    name: 'github-proxy',
    configureServer(server) {
      server.middlewares.use('/api/github', async (req, res) => {
        const url = new URL(req.url ?? '/', 'http://localhost');
        const action = url.searchParams.get('action') || 'contents';
        const path = url.searchParams.get('path') || '';
        const token = process.env.GITHUB_TOKEN || '';

        try {
          let result;
          if (action === 'repo') {
            result = await fetchRepoInfo(token);
          } else if (action === 'file') {
            result = await fetchFileContent(path, token);
          } else {
            result = await fetchContents(path, token);
          }

          res.statusCode = result.status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(result.data));
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ message: err instanceof Error ? err.message : 'Erro' }));
        }
      });
    },
  };
}
