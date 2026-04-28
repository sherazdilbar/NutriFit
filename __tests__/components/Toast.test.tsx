/**
 * Test Suite: Toast Component
 * Tests notification component functionality
 */

import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Toast from '@/components/Toast'

describe('Toast Component Tests', () => {
  
  // TC-007: Toast Display
  test('Should display toast with correct message and type', () => {
    const message = 'Operation successful!'
    const onClose = jest.fn()

    render(<Toast message={message} type="success" onClose={onClose} />)

    expect(screen.getByText(message)).toBeInTheDocument()
  })

  // TC-007: Toast Types
  test('Should render different toast types correctly', () => {
    const onClose = jest.fn()

    const { rerender } = render(
      <Toast message="Success message" type="success" onClose={onClose} />
    )
    expect(screen.getByText('Success message')).toBeInTheDocument()

    rerender(<Toast message="Error message" type="error" onClose={onClose} />)
    expect(screen.getByText('Error message')).toBeInTheDocument()

    rerender(<Toast message="Warning message" type="warning" onClose={onClose} />)
    expect(screen.getByText('Warning message')).toBeInTheDocument()

    rerender(<Toast message="Info message" type="info" onClose={onClose} />)
    expect(screen.getByText('Info message')).toBeInTheDocument()
  })

  // TC-007: Toast Close Button
  test('Should call onClose when close button is clicked', () => {
    const onClose = jest.fn()

    render(<Toast message="Test message" type="success" onClose={onClose} />)

    const closeButton = screen.getByRole('button')
    fireEvent.click(closeButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  // TC-007: Toast Auto-dismiss
  test('Should auto-dismiss after 3 seconds', async () => {
    jest.useFakeTimers()
    const onClose = jest.fn()

    render(<Toast message="Auto dismiss test" type="success" onClose={onClose} />)

    // Fast-forward time by 3 seconds
    jest.advanceTimersByTime(3000)

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled()
    })

    jest.useRealTimers()
  })

  // Accessibility Test
  test('Should have proper ARIA attributes', () => {
    const onClose = jest.fn()

    render(<Toast message="Accessible toast" type="success" onClose={onClose} />)

    const toastElement = screen.getByRole('alert', { hidden: true })
    expect(toastElement).toBeInTheDocument()
  })
})
