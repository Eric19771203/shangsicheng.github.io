import React from 'react';
import styled from 'styled-components';

const HomeContainer = styled.div`
  text-align: center;
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #666;
`;

function Home() {
  return (
    <HomeContainer>
      <Title>欢迎来到 YouYan3D 克隆</Title>
      <Subtitle>探索、创建和分享令人惊叹的 3D 模型</Subtitle>
    </HomeContainer>
  );
}

export default Home;

