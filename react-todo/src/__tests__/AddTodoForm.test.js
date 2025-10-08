const React = require('react');
const { render, screen, fireEvent } = require('@testing-library/react');
require('@testing-library/jest-dom');
const AddTodoForm = require('../components/AddTodoForm');

describe('AddTodoForm Component', () => {
  test('renders form elements correctly', () => {
    const mockOnAddTodo = jest.fn();
    render(<AddTodoForm onAddTodo={mockOnAddTodo} />);

    expect(screen.getByTestId('todo-input')).toBeInTheDocument();
    expect(screen.getByTestId('add-button')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter a new todo...')).toBeInTheDocument();
  });

  test('calls onAddTodo when form is submitted with valid input', () => {
    const mockOnAddTodo = jest.fn();
    render(<AddTodoForm onAddTodo={mockOnAddTodo} />);

    const input = screen.getByTestId('todo-input');
    const button = screen.getByTestId('add-button');

    // Enter text and submit
    fireEvent.change(input, { target: { value: 'Test todo' } });
    fireEvent.click(button);

    // Should call onAddTodo with the text
    expect(mockOnAddTodo).toHaveBeenCalledWith('Test todo');
    expect(mockOnAddTodo).toHaveBeenCalledTimes(1);
  });

  test('trims whitespace from input before calling onAddTodo', () => {
    const mockOnAddTodo = jest.fn();
    render(<AddTodoForm onAddTodo={mockOnAddTodo} />);

    const input = screen.getByTestId('todo-input');
    const button = screen.getByTestId('add-button');

    // Enter text with leading/trailing spaces
    fireEvent.change(input, { target: { value: '  Trimmed todo  ' } });
    fireEvent.click(button);

    // Should call onAddTodo with trimmed text
    expect(mockOnAddTodo).toHaveBeenCalledWith('Trimmed todo');
  });

  test('does not call onAddTodo when input is empty or only whitespace', () => {
    const mockOnAddTodo = jest.fn();
    render(<AddTodoForm onAddTodo={mockOnAddTodo} />);

    const input = screen.getByTestId('todo-input');
    const button = screen.getByTestId('add-button');

    // Try to submit empty input
    fireEvent.click(button);
    expect(mockOnAddTodo).not.toHaveBeenCalled();

    // Try to submit with only spaces
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(button);
    expect(mockOnAddTodo).not.toHaveBeenCalled();

    // Try to submit with tabs and newlines
    fireEvent.change(input, { target: { value: '\t\n  \t' } });
    fireEvent.click(button);
    expect(mockOnAddTodo).not.toHaveBeenCalled();
  });

  test('clears input after successful submission', () => {
    const mockOnAddTodo = jest.fn();
    render(<AddTodoForm onAddTodo={mockOnAddTodo} />);

    const input = screen.getByTestId('todo-input');
    const button = screen.getByTestId('add-button');

    // Enter text and submit
    fireEvent.change(input, { target: { value: 'Test todo' } });
    fireEvent.click(button);

    // Input should be cleared after submission
    expect(input.value).toBe('');
  });

  test('handles multiple submissions correctly', () => {
    const mockOnAddTodo = jest.fn();
    render(<AddTodoForm onAddTodo={mockOnAddTodo} />);

    const input = screen.getByTestId('todo-input');
    const button = screen.getByTestId('add-button');

    // First submission
    fireEvent.change(input, { target: { value: 'First todo' } });
    fireEvent.click(button);
    expect(mockOnAddTodo).toHaveBeenCalledWith('First todo');

    // Second submission
    fireEvent.change(input, { target: { value: 'Second todo' } });
    fireEvent.click(button);
    expect(mockOnAddTodo).toHaveBeenCalledWith('Second todo');

    // Should have been called twice
    expect(mockOnAddTodo).toHaveBeenCalledTimes(2);
  });

  test('input value updates correctly on change', () => {
    const mockOnAddTodo = jest.fn();
    render(<AddTodoForm onAddTodo={mockOnAddTodo} />);

    const input = screen.getByTestId('todo-input');

    // Test various inputs
    fireEvent.change(input, { target: { value: 'Hello' } });
    expect(input.value).toBe('Hello');

    fireEvent.change(input, { target: { value: 'Hello World' } });
    expect(input.value).toBe('Hello World');

    fireEvent.change(input, { target: { value: '' } });
    expect(input.value).toBe('');
  });

  test('form submission works with Enter key', () => {
    const mockOnAddTodo = jest.fn();
    render(<AddTodoForm onAddTodo={mockOnAddTodo} />);

    const input = screen.getByTestId('todo-input');

    // Enter text and press Enter
    fireEvent.change(input, { target: { value: 'Enter key todo' } });
    fireEvent.submit(input);

    // Should call onAddTodo
    expect(mockOnAddTodo).toHaveBeenCalledWith('Enter key todo');
  });
});
