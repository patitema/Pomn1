import { lazy, Suspense } from 'react';
import { Loader } from '@shared/ui/Loader';

const MarkdownEditor = lazy(() => import('@shared/ui/MarkdownEditor/MarkdownEditor'));

const LazyMarkdownEditor = (props) => (
  <Suspense fallback={<Loader size="small" />}>
    <MarkdownEditor {...props} />
  </Suspense>
);

export default LazyMarkdownEditor;
