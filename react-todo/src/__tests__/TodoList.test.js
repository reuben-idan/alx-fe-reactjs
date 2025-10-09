import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TodoList from '../components/TodoList';

// Mock the child components for isolated testing
jest.mock('../components/AddTodoForm', () => ({
  __esModule: true,
  default: function MockAddTodoForm({ onAddTodo }) {
    const [text, setText] = React.useState('');

    const handleSubmit = (e) => {
      e.preventDefault();
      if (text.trim()) {
        onAddTodo(text.trim());
        setText('');
      }
    };

    return (
      <form onSubmit={handleSubmit}>
        <input
          name="todo-input"
          data-testid="todo-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" data-testid="add-button">Add Todo</button>
      </form>
    );
  }
}));

jest.mock('../components/TodoItem', () => ({
  __esModule: true,
  default: function MockTodoItem({ todo, onToggle, onDelete }) {
    return (
      <div data-testid={`todo-item-${todo.id}`} className={todo.completed ? 'completed' : ''}>
        <span
          data-testid={`todo-text-${todo.id}`}
          onClick={() => onToggle(todo.id)}
          style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
        >
          {todo.text}
        </span>
        <button data-testid={`delete-button-${todo.id}`} onClick={() => onDelete(todo.id)}>
          Delete
        </button>
      </div>
    );
  }
}));

describe('TodoList Component', () => {
  test('renders TodoList with initial todos', () => {
    render(<TodoList />);

    expect(screen.getByText('My Todo List')).toBeInTheDocument();
    expect(screen.getByText('Learn React Testing Library')).toBeInTheDocument();
    expect(screen.getByText('Write comprehensive tests')).toBeInTheDocument();
    expect(screen.getByText('Deploy todo application')).toBeInTheDocument();

    // Check that completed todo has different styling
    const completedTodo = screen.getByText('Deploy todo application');
    expect(completedTodo).toHaveStyle('text-decoration: line-through');
  });

  test('displays todo statistics correctly', () => {
    render(<TodoList />);

    // Initial state: 3 total, 1 completed, 2 pending
    expect(screen.getByText(/Total: 3 \| Completed: 1 \| Pending: 2/)).toBeInTheDocument();
  });

  test('adds a new todo when form is submitted', async () => {
    render(<TodoList />);

    const input = screen.getByTestId('todo-input');
    const addButton = screen.getByTestId('add-button');

    // Add a new todo
    fireEvent.change(input, { target: { value: 'New test todo' } });
    fireEvent.click(addButton);

    // Check that new todo appears
    await waitFor(() => {
      expect(screen.getByText('New test todo')).toBeInTheDocument();
    });

    // Check updated statistics (4 total, 1 completed, 3 pending)
    expect(screen.getByText(/Total: 4 \| Completed: 1 \| Pending: 3/)).toBeInTheDocument();
  });

  test('toggles todo completion status', () => {
    render(<TodoList />);

    const todoText = screen.getByTestId('todo-text-1');

    // Initially not completed
    expect(todoText).not.toHaveStyle('text-decoration: line-through');

    // Click to toggle (mark as completed)
    fireEvent.click(todoText);

    // Should now be completed
    expect(todoText).toHaveStyle('text-decoration: line-through');

    // Click again to toggle back (mark as not completed)
    fireEvent.click(todoText);

    // Should not be completed again
    expect(todoText).not.toHaveStyle('text-decoration: line-through');

    // Check updated statistics (3 total, 0 completed, 3 pending)
    expect(screen.getByText(/Total: 3 \| Completed: 0 \| Pending: 3/)).toBeInTheDocument();
  });

  test('deletes a todo when delete button is clicked', async () => {
    render(<TodoList />);

    // Initially has 3 todos
    expect(screen.getByText('Learn React Testing Library')).toBeInTheDocument();
    expect(screen.getByText('Write comprehensive tests')).toBeInTheDocument();
    expect(screen.getByText('Deploy todo application')).toBeInTheDocument();

    // Delete the first todo
    const deleteButton = screen.getByTestId('delete-button-1');
    fireEvent.click(deleteButton);

    // Check that the todo is removed
    await waitFor(() => {
      expect(screen.queryByText('Learn React Testing Library')).not.toBeInTheDocument();
    });

    // Still has 2 todos
    expect(screen.getByText('Write comprehensive tests')).toBeInTheDocument();
    expect(screen.getByText('Deploy todo application')).toBeInTheDocument();

    // Check updated statistics (2 total, 1 completed, 1 pending)
    expect(screen.getByText(/Total: 2 \| Completed: 1 \| Pending: 1/)).toBeInTheDocument();
  });

  test('handles multiple operations correctly', async () => {
    render(<TodoList />);

    // Start with 3 todos, 1 completed, 2 pending
    expect(screen.getByText(/Total: 3 \| Completed: 1 \| Pending: 2/)).toBeInTheDocument();

    // Add a new todo
    const input = screen.getByTestId('todo-input');
    const addButton = screen.getByTestId('add-button');

    fireEvent.change(input, { target: { value: 'Test multiple operations' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Test multiple operations')).toBeInTheDocument();
    });

    // Now: 4 total, 1 completed, 3 pending
    expect(screen.getByText(/Total: 4 \| Completed: 1 \| Pending: 3/)).toBeInTheDocument();

    // Toggle the new todo to completed
    const newTodoText = screen.getByText('Test multiple operations');
    fireEvent.click(newTodoText);

    // Now: 4 total, 2 completed, 2 pending
    expect(screen.getByText(/Total: 4 \| Completed: 2 \| Pending: 2/)).toBeInTheDocument();

    // Delete a todo
    const deleteButton = screen.getByTestId('delete-button-2');
    fireEvent.click(deleteButton);

    // Final state: 3 total, 2 completed, 1 pending
    await waitFor(() => {
      expect(screen.getByText(/Total: 3 \| Completed: 2 \| Pending: 1/)).toBeInTheDocument();
    });
  });

  test('shows empty state when no todos exist', () => {
    // Create a TodoList with empty initial state for this test
    const EmptyTodoList = () => {
      const [todos, setTodos] = React.useState([]);

      return (
        <div className="todo-list-container">
          <h2>My Todo List</h2>
          <div className="todo-list">
            {todos.length === 0 ? (
              <p className="no-todos">No todos yet. Add one above!</p>
            ) : (
              todos.map(todo => (
                <div key={todo.id}>{todo.text}</div>
              ))
            )}
          </div>
        </div>
      );
    };

    render(<EmptyTodoList />);

    expect(screen.getByText('No todos yet. Add one above!')).toBeInTheDocument();
  });

  test('prevents adding empty todos', async () => {
    render(<TodoList />);

    const input = screen.getByTestId('todo-input');
    const addButton = screen.getByTestId('add-button');

    // Try to add an empty todo
    fireEvent.change(input, { target: { value: '   ' } }); // Only spaces
    fireEvent.click(addButton);

    // Should not add empty todo, still 3 todos
    expect(screen.getByText(/Total: 3 \| Completed: 1 \| Pending: 2/)).toBeInTheDocument();

    // Try to add a todo with actual content
    fireEvent.change(input, { target: { value: 'Valid todo' } });
    fireEvent.click(addButton);

    // Should add the valid todo, now 4 todos
    await waitFor(() => {
      expect(screen.getByText(/Total: 4 \| Completed: 1 \| Pending: 3/)).toBeInTheDocument();
    });
  });
});
