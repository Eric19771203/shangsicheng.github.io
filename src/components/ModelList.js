import React from 'react';
import styled from 'styled-components';

const ListContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1rem;
`;

const ModelCard = styled.div`
  background-color: #f0f0f0;
  padding: 1rem;
  border-radius: 8px;
`;

function ModelList() {
  const dummyModels = [
    { id: 1, name: '模型1' },
    { id: 2, name: '模型2' },
    { id: 3, name: '模型3' },
  ];

  return (
    <ListContainer>
      {dummyModels.map((model) => (
        <ModelCard key={model.id}>
          <h3>{model.name}</h3>
        </ModelCard>
      ))}
    </ListContainer>
  );
}

export default ModelList;
