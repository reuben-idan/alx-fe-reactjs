import React, { useState } from 'react';

const AddTodoForm = ({ onAddTodo }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onAddTodo(text.trim());
      setText('');
    }
  };

  return (
    <form className="add-todo-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter a new todo..."
        className="todo-input"
        data-testid="todo-input"
      />
      <button type="submit" className="add-button" data-testid="add-button">
        Add Todo
      </button>
    </form>
  );
};

export default AddTodoForm;
