import React from 'react';
import styled from 'styled-components';
import ModelList from '../components/ModelList';

const ExploreContainer = styled.div`
  padding: 2rem;
`;

function Explore() {
  return (
    <ExploreContainer>
      <h1>探索 3D 模型</h1>
      <ModelList />
    </ExploreContainer>
  );
}

export default Explore;
