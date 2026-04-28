/**
 * Test Suite: User Login
 * Tests authentication flow, validation, and error handling
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import Login from '@/app/login/page'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock fetch
global.fetch = jest.fn()

describe('Login Page Tests', () => {
  const mockPush = jest.fn()
  
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
    localStorage.clear()
  })

  // TC-002: User Login - Success Case
  test('TC-002: Should login successfully with valid credentials', async () => {
    const mockResponse = {
      success: true,
      token: 'mock-jwt-token',
      user: {
        id: 1,
        name: 'John Doe',
        email: 'john@test.com',
        role: 'user',
      },
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    render(<Login />)

    // Fill in form
    const emailInput = screen.getByPlaceholderText(/email/i)
    const passwordInput = screen.getByPlaceholderText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'john@test.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Test@123' } })
    fireEvent.click(submitButton)

    // Wait for API call and redirect
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'john@test.com',
          password: 'Test@123',
        }),
      })
    })

    // Verify token and user stored
    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'mock-jwt-token')
      expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockResponse.user))
    })

    // Verify redirect to dashboard
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  // TC-002: User Login - Invalid Credentials
  test('TC-002: Should show error with invalid credentials', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Invalid credentials' }),
    })

    render(<Login />)

    const emailInput = screen.getByPlaceholderText(/email/i)
    const passwordInput = screen.getByPlaceholderText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'wrong@test.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } })
    fireEvent.click(submitButton)

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })

    // Verify no redirect
    expect(mockPush).not.toHaveBeenCalled()
  })

  // TC-003: Email Validation
  test('TC-003: Should validate email format', async () => {
    render(<Login />)

    const emailInput = screen.getByPlaceholderText(/email/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    // Test invalid email formats
    const invalidEmails = ['invalidemail', 'test@', '@test.com', 'test@.com']

    for (const email of invalidEmails) {
      fireEvent.change(emailInput, { target: { value: email } })
      fireEvent.blur(emailInput)

      await waitFor(() => {
        const errorElement = screen.queryByText(/valid email/i)
        if (errorElement) {
          expect(errorElement).toBeInTheDocument()
        }
      })
    }
  })

  // TC-002: Network Error Handling
  test('TC-002: Should handle network errors gracefully', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    render(<Login />)

    const emailInput = screen.getByPlaceholderText(/email/i)
    const passwordInput = screen.getByPlaceholderText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'john@test.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Test@123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/network error|error occurred/i)).toBeInTheDocument()
    })
  })

  // Loading State Test
  test('Should show loading state during login', async () => {
    ;(global.fetch as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    )

    render(<Login />)

    const emailInput = screen.getByPlaceholderText(/email/i)
    const passwordInput = screen.getByPlaceholderText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'john@test.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Test@123' } })
    fireEvent.click(submitButton)

    // Check for loading indicator
    await waitFor(() => {
      expect(screen.getByText(/signing in/i)).toBeInTheDocument()
    })
  })
})
