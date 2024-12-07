// components/Header.js
import React, { useState } from 'react';
import './Header.css';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="header">
      <h1>Personalized Diet Recommendations</h1>
      <p>Get the perfect diet plan tailored to your needs</p>
      <div className="hamburger-menu">
        <button className="menu-button" onClick={toggleMenu}>
          ☰
        </button>
        {menuOpen && (
          <ul className="menu-list">
            <li><a href="#">設定</a></li>
            <li><a href="#">個人資料</a></li>
            <li><a href="#">營養師諮詢</a></li>
          </ul>
        )}
      </div>
    </header>
  );
};

export default Header;