import { fetchContents, fetchFileContent, fetchRepoInfo } from '../lib/github-api.mjs';

export default async function handler(req, res) {
  const token = process.env.GITHUB_TOKEN || '';
  const action = req.query.action || 'contents';
  const path = typeof req.query.path === 'string' ? req.query.path : '';

  try {
    if (action === 'repo') {
      const { status, data } = await fetchRepoInfo(token);
      return res.status(status).json(data);
    }

    if (action === 'file') {
      const { status, data } = await fetchFileContent(path, token);
      return res.status(status).json(data);
    }

    const { status, data } = await fetchContents(path, token);
    return res.status(status).json(data);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Erro ao contactar GitHub' });
  }
}
