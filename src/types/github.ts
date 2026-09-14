export interface GitHubContentItem {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: 'file' | 'dir';
  content?: string;
  encoding?: string;
}

export interface GitHubRepoInfo {
  name: string;
  full_name: string;
  default_branch: string;
  html_url: string;
  description: string | null;
  private: boolean;
}
