// App.js
import React from 'react';
import Header from './components/Header';
import WelcomeBanner from './components/WelcomeBanner';
import Features from './components/Features';
import Recommendations from './components/Recommendations';
import MemberArea from './components/MemberArea';

const App = () => {
  return (
    <div className="app">
      <Header />
      <main>
        <WelcomeBanner />
        <Features />
        <Recommendations />
        <MemberArea />
      </main>
    </div>
  );
};

export default App;