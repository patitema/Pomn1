import { useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import './MarkdownEditor.css';

const MAX_PASTED_IMAGE_SIDE = 1280;
const PASTED_IMAGE_QUALITY = 0.82;

const readImageAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });

const compressImageAsDataUrl = async (file) => {
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') {
    return readImageAsDataUrl(file);
  }

  const sourceDataUrl = await readImageAsDataUrl(file);
  const image = await loadImage(sourceDataUrl);
  const scale = Math.min(1, MAX_PASTED_IMAGE_SIDE / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

  return canvas.toDataURL('image/webp', PASTED_IMAGE_QUALITY);
};

const createImageReferenceId = (index) => `clipboard-image-${Date.now()}-${index + 1}`;

const toImageReferenceMarkdown = (markdown = '') => {
  const imageDefinitions = [];
  let imageIndex = 0;
  const nextMarkdown = markdown.replace(
    /!\[([^\]]*)]\((data:image\/[a-zA-Z0-9.+-]+;base64,[^)]+)\)/g,
    (match, altText, dataUrl) => {
      const referenceId = createImageReferenceId(imageIndex);
      imageIndex += 1;
      imageDefinitions.push(`[${referenceId}]: ${dataUrl}`);

      return `![${altText || 'изображение'}][${referenceId}]`;
    }
  );

  if (imageDefinitions.length === 0) {
    return markdown;
  }

  return `${nextMarkdown.trimEnd()}\n\n${imageDefinitions.join('\n')}`;
};

const MarkdownEditor = ({
  value,
  onChange,
  placeholder = 'Введите текст...',
  height = 400,
  preview = 'edit'
}) => {
  useEffect(() => {
    const normalizedValue = toImageReferenceMarkdown(value || '');

    if (normalizedValue !== (value || '')) {
      onChange?.(normalizedValue);
    }
  }, [onChange, value]);

  const handlePaste = async (event) => {
    const files = Array.from(event.clipboardData?.files || []);
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      return;
    }

    event.preventDefault();

    const textArea = event.currentTarget;
    const selectionStart = textArea.selectionStart ?? value?.length ?? 0;
    const selectionEnd = textArea.selectionEnd ?? selectionStart;
    const currentValue = value || '';
    const pastedImages = await Promise.all(
      imageFiles.map(async (file, index) => {
        const dataUrl = await compressImageAsDataUrl(file);
        const imageName = file.name || `clipboard-image-${index + 1}`;
        const referenceId = createImageReferenceId(index);

        return {
          markdown: `![${imageName}][${referenceId}]`,
          definition: `[${referenceId}]: ${dataUrl}`,
        };
      })
    );
    const insertText = pastedImages.map((image) => image.markdown).join('\n');
    const definitions = pastedImages.map((image) => image.definition).join('\n');
    const nextValue = `${currentValue.slice(0, selectionStart)}${insertText}${currentValue.slice(selectionEnd).trimEnd()}\n\n${definitions}`;

    onChange?.(nextValue);

    requestAnimationFrame(() => {
      const nextCursorPosition = selectionStart + insertText.length;
      textArea.setSelectionRange(nextCursorPosition, nextCursorPosition);
      textArea.focus();
    });
  };

  return (
    <div className="markdown-editor">
      <MDEditor
        value={value}
        onChange={onChange}
        height={height}
        preview={preview}
        highlightEnable={false}
        placeholder={placeholder}
        textareaProps={{
          placeholder: placeholder,
          onPaste: handlePaste
        }}
      />
    </div>
  );
};

export default MarkdownEditor;
