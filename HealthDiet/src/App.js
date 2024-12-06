// App.js
// App.js
import React from 'react';
import Header from './components/Header';
import DietForm from './components/DietForm';
import Recommendations from './components/Recommendations';

const App = () => {
  return (
    <div className="app">
      <Header />
      <main>
        <DietForm />
        <Recommendations />
      </main>
    </div>
  );
};

export default App;