import { render, screen, act } from '@testing-library/react'
import { AuthProvider, AuthContext } from '../../../context/AuthContext'
import React from 'react'

// Helper component that consumes AuthContext and displays state
function AuthConsumer() {
  const context = React.useContext(AuthContext)
  if (!context) return <div>No context</div>

  return (
    <div>
      <span data-testid="authenticated">{String(context.isAuthenticated)}</span>
      <span data-testid="token">{context.token || 'null'}</span>
      <span data-testid="loading">{String(context.isLoading)}</span>
      <button onClick={() => context.login('test-token-abc')}>Login</button>
      <button onClick={context.logout}>Logout</button>
    </div>
  )
}

describe('AuthContext - session persistence', () => {
  const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000

  beforeEach(() => {
    localStorage.clear()
    jest.restoreAllMocks()
  })

  it('should store a login timestamp when logging in', () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )

    act(() => {
      screen.getByText('Login').click()
    })

    const timestamp = localStorage.getItem('auth_login_time')
    expect(timestamp).not.toBeNull()
    expect(Number(timestamp)).toBeGreaterThan(0)
  })

  it('should remain authenticated when token is within 2-week window', () => {
    // Store a token from 1 day ago
    const oneDayAgo = Date.now() - (1 * 24 * 60 * 60 * 1000)
    localStorage.setItem('auth_token', 'valid-token')
    localStorage.setItem('user_id', 'user-123')
    localStorage.setItem('auth_login_time', String(oneDayAgo))

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )

    expect(screen.getByTestId('authenticated').textContent).toBe('true')
    expect(screen.getByTestId('token').textContent).toBe('valid-token')
  })

  it('should remain authenticated at exactly 13 days (within 2-week window)', () => {
    const thirteenDaysAgo = Date.now() - (13 * 24 * 60 * 60 * 1000)
    localStorage.setItem('auth_token', 'valid-token')
    localStorage.setItem('user_id', 'user-123')
    localStorage.setItem('auth_login_time', String(thirteenDaysAgo))

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )

    expect(screen.getByTestId('authenticated').textContent).toBe('true')
  })

  it('should auto-logout when token is older than 2 weeks', () => {
    const threeWeeksAgo = Date.now() - (21 * 24 * 60 * 60 * 1000)
    localStorage.setItem('auth_token', 'expired-token')
    localStorage.setItem('user_id', 'user-123')
    localStorage.setItem('auth_login_time', String(threeWeeksAgo))

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )

    expect(screen.getByTestId('authenticated').textContent).toBe('false')
    expect(screen.getByTestId('token').textContent).toBe('null')
    // Should clear localStorage
    expect(localStorage.getItem('auth_token')).toBeNull()
    expect(localStorage.getItem('auth_login_time')).toBeNull()
  })

  it('should auto-logout when token has no login timestamp (legacy token)', () => {
    // Simulate a token stored before the timestamp feature was added
    localStorage.setItem('auth_token', 'legacy-token')
    localStorage.setItem('user_id', 'user-123')
    // No auth_login_time set

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )

    // Legacy tokens without timestamps should be treated as expired
    expect(screen.getByTestId('authenticated').textContent).toBe('false')
    expect(localStorage.getItem('auth_token')).toBeNull()
  })

  it('should clear login timestamp on logout', () => {
    localStorage.setItem('auth_token', 'some-token')
    localStorage.setItem('user_id', 'user-123')
    localStorage.setItem('auth_login_time', String(Date.now()))

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )

    act(() => {
      screen.getByText('Logout').click()
    })

    expect(localStorage.getItem('auth_login_time')).toBeNull()
    expect(localStorage.getItem('auth_token')).toBeNull()
  })
})
