const React = require('react');
const { render, screen, fireEvent } = require('@testing-library/react');
require('@testing-library/jest-dom');
const TodoItem = require('../components/TodoItem');

describe('TodoItem Component', () => {
  const mockTodo = {
    id: 1,
    text: 'Test todo item',
    completed: false
  };

  const mockOnToggle = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    mockOnToggle.mockClear();
    mockOnDelete.mockClear();
  });

  test('renders todo item correctly', () => {
    render(<TodoItem todo={mockTodo} onToggle={mockOnToggle} onDelete={mockOnDelete} />);

    expect(screen.getByTestId('todo-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('todo-text-1')).toBeInTheDocument();
    expect(screen.getByTestId('delete-button-1')).toBeInTheDocument();
    expect(screen.getByText('Test todo item')).toBeInTheDocument();
  });

  test('displays completed todo with strikethrough', () => {
    const completedTodo = { ...mockTodo, completed: true };
    render(<TodoItem todo={completedTodo} onToggle={mockOnToggle} onDelete={mockOnDelete} />);

    const todoText = screen.getByTestId('todo-text-1');
    expect(todoText).toHaveStyle('text-decoration: line-through');
  });

  test('displays non-completed todo without strikethrough', () => {
    render(<TodoItem todo={mockTodo} onToggle={mockOnToggle} onDelete={mockOnDelete} />);

    const todoText = screen.getByTestId('todo-text-1');
    expect(todoText).toHaveStyle('text-decoration: none');
  });

  test('calls onToggle when todo text is clicked', () => {
    render(<TodoItem todo={mockTodo} onToggle={mockOnToggle} onDelete={mockOnDelete} />);

    const todoText = screen.getByTestId('todo-text-1');
    fireEvent.click(todoText);

    expect(mockOnToggle).toHaveBeenCalledWith(1);
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  test('calls onDelete when delete button is clicked', () => {
    render(<TodoItem todo={mockTodo} onToggle={mockOnToggle} onDelete={mockOnDelete} />);

    const deleteButton = screen.getByTestId('delete-button-1');
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(1);
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  test('handles multiple clicks correctly', () => {
    render(<TodoItem todo={mockTodo} onToggle={mockOnToggle} onDelete={mockOnDelete} />);

    const todoText = screen.getByTestId('todo-text-1');

    // Click toggle multiple times
    fireEvent.click(todoText);
    fireEvent.click(todoText);
    fireEvent.click(todoText);

    expect(mockOnToggle).toHaveBeenCalledTimes(3);
    expect(mockOnToggle).toHaveBeenNthCalledWith(1, 1);
    expect(mockOnToggle).toHaveBeenNthCalledWith(2, 1);
    expect(mockOnToggle).toHaveBeenNthCalledWith(3, 1);
  });

  test('applies completed class when todo is completed', () => {
    const completedTodo = { ...mockTodo, completed: true };
    render(<TodoItem todo={completedTodo} onToggle={mockOnToggle} onDelete={mockOnDelete} />);

    const todoItem = screen.getByTestId('todo-item-1');
    expect(todoItem).toHaveClass('completed');
  });

  test('does not apply completed class when todo is not completed', () => {
    render(<TodoItem todo={mockTodo} onToggle={mockOnToggle} onDelete={mockOnDelete} />);

    const todoItem = screen.getByTestId('todo-item-1');
    expect(todoItem).not.toHaveClass('completed');
  });

  test('renders different todos with unique test ids', () => {
    const todo1 = { id: 1, text: 'First todo', completed: false };
    const todo2 = { id: 2, text: 'Second todo', completed: true };

    render(
      <div>
        <TodoItem todo={todo1} onToggle={mockOnToggle} onDelete={mockOnDelete} />
        <TodoItem todo={todo2} onToggle={mockOnToggle} onDelete={mockOnDelete} />
      </div>
    );

    expect(screen.getByTestId('todo-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('todo-item-2')).toBeInTheDocument();
    expect(screen.getByTestId('todo-text-1')).toBeInTheDocument();
    expect(screen.getByTestId('todo-text-2')).toBeInTheDocument();
    expect(screen.getByTestId('delete-button-1')).toBeInTheDocument();
    expect(screen.getByTestId('delete-button-2')).toBeInTheDocument();

    expect(screen.getByText('First todo')).toBeInTheDocument();
    expect(screen.getByText('Second todo')).toBeInTheDocument();
  });

  test('todo text is clickable and has pointer cursor', () => {
    render(<TodoItem todo={mockTodo} onToggle={mockOnToggle} onDelete={mockOnDelete} />);

    const todoText = screen.getByTestId('todo-text-1');
    expect(todoText).toHaveStyle('cursor: pointer');
  });

  test('delete button has correct text', () => {
    render(<TodoItem todo={mockTodo} onToggle={mockOnToggle} onDelete={mockOnDelete} />);

    const deleteButton = screen.getByTestId('delete-button-1');
    expect(deleteButton).toHaveTextContent('Delete');
  });

  test('handles todos with special characters in text', () => {
    const specialTodo = {
      id: 1,
      text: 'Todo with special chars: @#$%^&*()',
      completed: false
    };

    render(<TodoItem todo={specialTodo} onToggle={mockOnToggle} onDelete={mockOnDelete} />);

    expect(screen.getByText('Todo with special chars: @#$%^&*()')).toBeInTheDocument();
  });

  test('handles very long todo text', () => {
    const longTodo = {
      id: 1,
      text: 'This is a very long todo item that contains a lot of text to test how the component handles long content that might wrap or overflow in the UI',
      completed: false
    };

    render(<TodoItem todo={longTodo} onToggle={mockOnToggle} onDelete={mockOnDelete} />);

    expect(screen.getByText(longTodo.text)).toBeInTheDocument();
  });
});
