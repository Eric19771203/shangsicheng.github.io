import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background-color: #1a1a1a;
  color: #fff;
  padding: 1rem;
  text-align: center;
`;

function Footer() {
  return (
    <FooterContainer>
      <p>&copy; 2023 YouYan3D克隆. 保留所有权利。</p>
    </FooterContainer>
  );
}

export default Footer;
