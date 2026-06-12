import ReactMarkdown, { defaultUrlTransform } from 'react-markdown';
import './MarkdownViewer.css';

const markdownUrlTransform = (url, key, node) => {
  if (key === 'src' && node?.tagName === 'img' && /^data:image\/[a-zA-Z0-9.+-]+;base64,/i.test(url)) {
    return url;
  }

  return defaultUrlTransform(url);
};

const MarkdownViewer = ({
  content,
  className = ''
}) => {
  return (
    <div className={`markdown-viewer ${className}`}>
      <ReactMarkdown urlTransform={markdownUrlTransform}>
        {content || 'Содержимое отсутствует'}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownViewer;
