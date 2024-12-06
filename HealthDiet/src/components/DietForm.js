// components/DietForm.js
import React, { useState } from 'react';

const DietForm = () => {
  const [age, setAge] = useState('');
  const [goal, setGoal] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    // Logic to fetch recommendations based on user's needs
  };

  return (
    <form onSubmit={handleSubmit} className="diet-form">
      <label>
        Age:
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          required
        />
      </label>
      <label>
        Goal:
        <select value={goal} onChange={(e) => setGoal(e.target.value)} required>
          <option value="">Select Goal</option>
          <option value="weight-loss">Weight Loss</option>
          <option value="muscle-gain">Muscle Gain</option>
          <option value="maintain">Maintain Weight</option>
        </select>
      </label>
      <button type="submit">Get Recommendations</button>
    </form>
  );
};

export default DietForm;