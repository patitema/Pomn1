export const getNotesMainClassName = ({ isFooterVisible, isReaderOpen }) => [
  'notes-page__main',
  isReaderOpen ? 'notes-page__main--reader-open' : '',
  isFooterVisible && !isReaderOpen ? 'notes-page__main--footer-visible' : '',
].filter(Boolean).join(' ')
