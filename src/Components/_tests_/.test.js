import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Unit tests for Login component
describe('Login Component', () => {
  test('renders login form', () => {
    render(<Login onLogin={() => {}} />);
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('handles login submission', async () => {
    const mockOnLogin = jest.fn();
    render(<Login onLogin={mockOnLogin} />);
    
    await userEvent.type(screen.getByPlaceholderText('Username'), 'Kartik');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'password1');
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    expect(mockOnLogin).toHaveBeenCalledWith('Kartik');
  });
});

// Unit tests for ChatTriggerUI component
describe('ChatTriggerUI Component', () => {
  beforeEach(() => {
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  });

  test('renders chat interface when user is logged in', () => {
    window.localStorage.getItem.mockReturnValue('Kartik');
    render(<ChatTriggerUI />);
    expect(screen.getByPlaceholderText('Type your message here...')).toBeInTheDocument();
  });

  test('sends message when send button is clicked', async () => {
    window.localStorage.getItem.mockReturnValue('Kartik');
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ output: 'Test response' })
      })
    );

    render(<ChatTriggerUI />);
    await userEvent.type(screen.getByPlaceholderText('Type your message here...'), 'Test message');
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.any(String)
        })
      );
    });
  });
});

// Integration tests
describe('Integration Tests', () => {
  test('full login and chat flow', async () => {
    render(<ChatTriggerUI />);
    
    // Login
    await userEvent.type(screen.getByPlaceholderText('Username'), 'Kartik');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'password1');
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Verify chat interface appears
    expect(screen.getByPlaceholderText('Type your message here...')).toBeInTheDocument();

    // Send a message
    await userEvent.type(screen.getByPlaceholderText('Type your message here...'), 'Hello');
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    // Verify message appears in chat
    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });
  });
});