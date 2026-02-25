import { render, screen, act, waitFor } from '@testing-library/react'
import { AuthProvider, AuthContext } from '../../../context/AuthContext'
import authenticate from '../../../services/functions-authenticate'
import React from 'react'

jest.mock('../../../services/functions-authenticate')

// Helper component that consumes AuthContext and displays state
function AuthConsumer() {
  const context = React.useContext(AuthContext)
  if (!context) return <div>No context</div>

  return (
    <div>
      <span data-testid="authenticated">{String(context.isAuthenticated)}</span>
      <span data-testid="token">{context.token || 'null'}</span>
      <span data-testid="userId">{context.userId || 'null'}</span>
      <span data-testid="loading">{String(context.isLoading)}</span>
      <button onClick={() => context.login('google-id-token-xyz')}>Login</button>
      <button onClick={context.logout}>Logout</button>
    </div>
  )
}

describe('AuthContext - session persistence', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.restoreAllMocks()
    ;(authenticate as jest.Mock).mockResolvedValue({
      token: 'backend-jwt-abc',
      userId: 'server-user-123',
    })
  })

  it('should call authenticate service and store backend JWT on login', async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )

    await act(async () => {
      screen.getByText('Login').click()
    })

    expect(authenticate).toHaveBeenCalledWith('google-id-token-xyz')
    expect(screen.getByTestId('authenticated').textContent).toBe('true')
    expect(screen.getByTestId('token').textContent).toBe('backend-jwt-abc')
    expect(screen.getByTestId('userId').textContent).toBe('server-user-123')
  })

  it('should store backend JWT in localStorage (not the Google token)', async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )

    await act(async () => {
      screen.getByText('Login').click()
    })

    expect(localStorage.getItem('auth_token')).toBe('backend-jwt-abc')
    // Should NOT be the Google token
    expect(localStorage.getItem('auth_token')).not.toBe('google-id-token-xyz')
  })

  it('should store a login timestamp when logging in', async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )

    await act(async () => {
      screen.getByText('Login').click()
    })

    const timestamp = localStorage.getItem('auth_login_time')
    expect(timestamp).not.toBeNull()
    expect(Number(timestamp)).toBeGreaterThan(0)
  })

  it('should not authenticate if authenticate service throws', async () => {
    ;(authenticate as jest.Mock).mockRejectedValue(new Error('Auth failed'))
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )

    await act(async () => {
      screen.getByText('Login').click()
    })

    expect(screen.getByTestId('authenticated').textContent).toBe('false')
    expect(screen.getByTestId('token').textContent).toBe('null')
    expect(localStorage.getItem('auth_token')).toBeNull()

    consoleErrorSpy.mockRestore()
  })

  it('should remain authenticated when token is within 2-week window', () => {
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
    expect(localStorage.getItem('auth_token')).toBeNull()
    expect(localStorage.getItem('auth_login_time')).toBeNull()
  })

  it('should auto-logout when token has no login timestamp (legacy token)', () => {
    localStorage.setItem('auth_token', 'legacy-token')
    localStorage.setItem('user_id', 'user-123')

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )

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
