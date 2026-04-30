import ReactMarkdown from 'react-markdown';
import './MarkdownViewer.css';

const MarkdownViewer = ({
  content,
  className = ''
}) => {
  return (
    <div className={`markdown-viewer ${className}`}>
      <ReactMarkdown>
        {content || 'Содержимое отсутствует'}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownViewer;
