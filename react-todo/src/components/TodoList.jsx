import React, { useState } from 'react';
import AddTodoForm from './AddTodoForm';
import TodoItem from './TodoItem';

const TodoList = () => {
  // Initialize with demo todos as specified in requirements
  const [todos, setTodos] = useState([
    {
      id: 1,
      text: 'Learn React Testing Library',
      completed: false
    },
    {
      id: 2,
      text: 'Write comprehensive tests',
      completed: false
    },
    {
      id: 3,
      text: 'Deploy todo application',
      completed: true
    }
  ]);

  const addTodo = (text) => {
    const newTodo = {
      id: Date.now(),
      text,
      completed: false
    };
    setTodos([...todos, newTodo]);
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div className="todo-list-container">
      <h2>My Todo List</h2>

      <AddTodoForm onAddTodo={addTodo} />

      <div className="todo-list">
        {todos.length === 0 ? (
          <p className="no-todos">No todos yet. Add one above!</p>
        ) : (
          todos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
            />
          ))
        )}
      </div>

      <div className="todo-stats">
        <p>Total: {todos.length} | Completed: {todos.filter(todo => todo.completed).length} | Pending: {todos.filter(todo => !todo.completed).length}</p>
      </div>
    </div>
  );
};

export default TodoList;
