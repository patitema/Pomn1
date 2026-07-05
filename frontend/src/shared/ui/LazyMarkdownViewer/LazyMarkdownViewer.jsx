import { lazy, Suspense } from 'react';
import { Loader } from '@shared/ui/Loader';

const MarkdownViewer = lazy(() => import('@shared/ui/MarkdownViewer/MarkdownViewer'));

const LazyMarkdownViewer = (props) => (
  <Suspense fallback={<Loader size="small" />}>
    <MarkdownViewer {...props} />
  </Suspense>
);

export default LazyMarkdownViewer;
