import React from 'react';
import styled from 'styled-components';
import ModelViewer from '../components/ModelViewer';

const CreateContainer = styled.div`
  padding: 2rem;
`;

function Create() {
  return (
    <CreateContainer>
      <h1>创建新模型</h1>
      <ModelViewer />
    </CreateContainer>
  );
}

export default Create;
