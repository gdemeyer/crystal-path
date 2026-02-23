import { render, screen, fireEvent } from '@testing-library/react'
import LoginPage from '../../../pages/LoginPage'
import { useAuth } from '../../../hooks/useAuth'

jest.mock('../../../hooks/useAuth')

describe('LoginPage component', () => {
  const mockLogin = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      isAuthenticated: false,
      token: null,
      userId: null,
      isLoading: false,
      logout: jest.fn()
    })
  })

  describe('demo account button visibility', () => {
    it('should NOT show demo button in production (non-localhost)', () => {
      // Simulate production hostname
      Object.defineProperty(window, 'location', {
        value: { ...window.location, hostname: 'crystal-path.netlify.app' },
        writable: true
      })

      render(<LoginPage />)

      expect(screen.queryByText('Use Demo Account')).not.toBeInTheDocument()
      expect(screen.queryByText(/Demo Account/)).not.toBeInTheDocument()
    })

    it('should show demo button on localhost', () => {
      Object.defineProperty(window, 'location', {
        value: { ...window.location, hostname: 'localhost' },
        writable: true
      })

      render(<LoginPage />)

      expect(screen.getByText('Use Demo Account')).toBeInTheDocument()
    })

    it('should show demo button on 127.0.0.1', () => {
      Object.defineProperty(window, 'location', {
        value: { ...window.location, hostname: '127.0.0.1' },
        writable: true
      })

      render(<LoginPage />)

      expect(screen.getByText('Use Demo Account')).toBeInTheDocument()
    })

    it('should NOT show demo button on a custom production domain', () => {
      Object.defineProperty(window, 'location', {
        value: { ...window.location, hostname: 'app.crystalpath.com' },
        writable: true
      })

      render(<LoginPage />)

      expect(screen.queryByText('Use Demo Account')).not.toBeInTheDocument()
      expect(screen.queryByText(/Demo Account/)).not.toBeInTheDocument()
    })
  })
})
