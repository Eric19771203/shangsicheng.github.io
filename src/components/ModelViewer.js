import React from 'react';
import styled from 'styled-components';

const ViewerContainer = styled.div`
  width: 100%;
  height: 400px;
  background-color: #f0f0f0;
  display: flex;
  justify-content: center;
  align-items: center;
`;

function ModelViewer() {
  return (
    <ViewerContainer>
      <p>这里将显示3D模型</p>
    </ViewerContainer>
  );
}

export default ModelViewer;
