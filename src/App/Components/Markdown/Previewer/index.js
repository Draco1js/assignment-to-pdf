import React, { Suspense, lazy } from 'react';
import styled from 'styled-components';
import Loading from './Loading';
import ErrorBoundary from './ErrorBoundary.js';
import 'github-markdown-css';
const Wrapper = styled.div`
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
  width: 100%;
  padding: 10px;
  
  /* Override github-markdown-css for dark code blocks */
  &.markdown-body pre {
    background-color: #282c34 !important;
  }
  
  &.markdown-body code {
    background-color: #282c34 !important;
    color: #abb2bf !important;
  }
  
  @media print {
    padding: 0;
    overflow-y: hidden;
  }
`;
const LazyPreview = lazy(() => import('./Preview.js'));
export default ({ source, children }) => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading duration={0.5} />}>
        <Wrapper className="preview markdown-body dark-code">
          <LazyPreview source={source}>{children}</LazyPreview>
        </Wrapper>
      </Suspense>
    </ErrorBoundary>
  );
};
