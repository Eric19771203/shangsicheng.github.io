import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  background-color: #1a1a1a;
  padding: 1rem;
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  color: #fff;
  font-size: 1.5rem;
  text-decoration: none;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 1rem;
`;

const NavLink = styled(Link)`
  color: #fff;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

function Header() {
  return (
    <HeaderContainer>
      <Nav>
        <Logo to="/">YouYan3D克隆</Logo>
        <NavLinks>
          <NavLink to="/explore">探索</NavLink>
          <NavLink to="/create">创建</NavLink>
        </NavLinks>
      </Nav>
    </HeaderContainer>
  );
}

export default Header;
