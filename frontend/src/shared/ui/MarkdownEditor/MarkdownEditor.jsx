import MDEditor from '@uiw/react-md-editor';
import './MarkdownEditor.css';

const MarkdownEditor = ({
  value,
  onChange,
  placeholder = 'Введите текст...',
  height = 400,
  preview = 'edit'
}) => {
  return (
    <div className="markdown-editor">
      <MDEditor
        value={value}
        onChange={onChange}
        height={height}
        preview={preview}
        placeholder={placeholder}
        textareaProps={{
          placeholder: placeholder
        }}
      />
    </div>
  );
};

export default MarkdownEditor;
