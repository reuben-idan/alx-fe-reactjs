import React, { useState } from 'react';
import './App.css';
import TodoList from './components/TodoList';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Todo List App</h1>
        <p>A comprehensive todo list with full testing coverage</p>
      </header>
      <main>
        <TodoList />
      </main>
    </div>
  );
}

export default App;
