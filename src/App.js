import React, { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <div
        onClick={() => {
          window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        }}
        className="container" />
    </div>
  );
}

export default App;
