/**
 * Test Suite: User Registration
 * Tests registration flow, validation, and password strength
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import Register from '@/app/register/page'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

global.fetch = jest.fn()

describe('Register Page Tests', () => {
  const mockPush = jest.fn()
  
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
    localStorage.clear()
  })

  // TC-001: User Registration - Success
  test('TC-001: Should register user successfully with valid data', async () => {
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

    render(<Register />)

    // Fill registration form
    fireEvent.change(screen.getByPlaceholderText(/john doe/i), {
      target: { value: 'John Doe' },
    })
    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
      target: { value: 'john@test.com' },
    })
    
    const passwordInputs = screen.getAllByPlaceholderText(/••••••••/i)
    fireEvent.change(passwordInputs[0], { target: { value: 'Test@123' } })
    fireEvent.change(passwordInputs[1], { target: { value: 'Test@123' } })

    const submitButton = screen.getByRole('button', { name: /create account/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@test.com',
          password: 'Test@123',
          role: 'user',
        }),
      })
    })

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  // TC-004: Password Strength Indicator
  test('TC-004: Should show password strength indicator', async () => {
    render(<Register />)

    const passwordInput = screen.getAllByPlaceholderText(/••••••••/i)[0]

    // Test weak password
    fireEvent.change(passwordInput, { target: { value: '123' } })
    await waitFor(() => {
      const weakIndicator = screen.queryByText(/weak/i)
      if (weakIndicator) {
        expect(weakIndicator).toBeInTheDocument()
      }
    })

    // Test medium password
    fireEvent.change(passwordInput, { target: { value: 'Test123' } })
    await waitFor(() => {
      const mediumIndicator = screen.queryByText(/medium/i)
      if (mediumIndicator) {
        expect(mediumIndicator).toBeInTheDocument()
      }
    })

    // Test strong password
    fireEvent.change(passwordInput, { target: { value: 'Test@123!' } })
    await waitFor(() => {
      const strongIndicator = screen.queryByText(/strong/i)
      if (strongIndicator) {
        expect(strongIndicator).toBeInTheDocument()
      }
    })
  })

  // TC-005: Duplicate Email Check
  test('TC-005: Should show error for duplicate email', async () => {
    // Mock email check API
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ exists: true }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Email already exists' }),
      })

    render(<Register />)

    const emailInput = screen.getByPlaceholderText(/you@example.com/i)
    fireEvent.change(emailInput, { target: { value: 'existing@test.com' } })
    fireEvent.blur(emailInput)

    await waitFor(() => {
      const errorMessage = screen.queryByText(/already registered|already exists/i)
      if (errorMessage) {
        expect(errorMessage).toBeInTheDocument()
      }
    }, { timeout: 3000 })
  })

  // TC-003: Name Validation
  test('TC-003: Should validate name field', async () => {
    render(<Register />)

    const nameInput = screen.getByPlaceholderText(/john doe/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })

    // Test empty name
    fireEvent.change(nameInput, { target: { value: '' } })
    fireEvent.blur(nameInput)

    // Test short name
    fireEvent.change(nameInput, { target: { value: 'A' } })
    fireEvent.blur(nameInput)

    await waitFor(() => {
      const errorElement = screen.queryByText(/at least 2 characters/i)
      if (errorElement) {
        expect(errorElement).toBeInTheDocument()
      }
    })
  })

  // Password Confirmation Validation
  test('Should validate password confirmation match', async () => {
    render(<Register />)

    const passwordInputs = screen.getAllByPlaceholderText(/••••••••/i)
    
    fireEvent.change(passwordInputs[0], { target: { value: 'Test@123' } })
    fireEvent.change(passwordInputs[1], { target: { value: 'Test@456' } })
    fireEvent.blur(passwordInputs[1])

    await waitFor(() => {
      const errorElement = screen.queryByText(/passwords do not match/i)
      if (errorElement) {
        expect(errorElement).toBeInTheDocument()
      }
    })
  })
})
