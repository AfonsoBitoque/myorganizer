import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { resolveRelativeUrl } from '@/lib/github';

interface MarkdownViewerProps {
  content: string;
  filePath: string;
  branch?: string;
}

export function MarkdownViewer({ content, filePath, branch = 'main' }: MarkdownViewerProps) {
  return (
    <article className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          img: ({ src, alt }) => {
            const resolved =
              src && !src.startsWith('http')
                ? resolveRelativeUrl(src, filePath, branch)
                : src;
            return <img src={resolved} alt={alt ?? ''} loading="lazy" />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
