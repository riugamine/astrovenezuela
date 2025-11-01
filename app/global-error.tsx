'use client'

import { useEffect } from 'react'

/**
 * Global error boundary for the root layout
 * This catches errors that occur in the root layout itself
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global Application Error:', error)
  }, [error])

  const showDetailedError = process.env.NEXT_PUBLIC_SHOW_ERROR_DETAILS === 'true' || 
                           process.env.NODE_ENV === 'development'

  return (
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fef2f2',
          padding: '20px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            maxWidth: '600px',
            width: '100%',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            padding: '40px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '20px'
            }}>
              ⚠️
            </div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#dc2626',
              marginBottom: '16px'
            }}>
              Error 500 - Error Global del Servidor
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              marginBottom: '24px'
            }}>
              Ha ocurrido un error crítico en la aplicación
            </p>

            {showDetailedError && (
              <div style={{
                backgroundColor: '#fee2e2',
                border: '1px solid #fca5a5',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px',
                textAlign: 'left'
              }}>
                <h3 style={{
                  fontWeight: 'bold',
                  color: '#991b1b',
                  marginBottom: '8px',
                  fontSize: '14px'
                }}>
                  Mensaje de Error:
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#7f1d1d',
                  fontFamily: 'monospace',
                  wordBreak: 'break-word'
                }}>
                  {error.message || 'No error message available'}
                </p>

                {error.digest && (
                  <div style={{ marginTop: '12px' }}>
                    <h3 style={{
                      fontWeight: 'bold',
                      color: '#991b1b',
                      marginBottom: '8px',
                      fontSize: '14px'
                    }}>
                      Error ID:
                    </h3>
                    <p style={{
                      fontSize: '14px',
                      color: '#7f1d1d',
                      fontFamily: 'monospace'
                    }}>
                      {error.digest}
                    </p>
                  </div>
                )}

                {error.stack && (
                  <div style={{ marginTop: '12px' }}>
                    <h3 style={{
                      fontWeight: 'bold',
                      color: '#991b1b',
                      marginBottom: '8px',
                      fontSize: '14px'
                    }}>
                      Stack Trace:
                    </h3>
                    <pre style={{
                      fontSize: '12px',
                      color: '#7f1d1d',
                      fontFamily: 'monospace',
                      overflow: 'auto',
                      maxHeight: '200px',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}>
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            )}

            <div style={{
              display: 'flex',
              gap: '12px',
              flexDirection: 'column'
            }}>
              <button
                onClick={reset}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
              >
                🔄 Intentar de Nuevo
              </button>
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              >
                🏠 Ir al Inicio
              </button>
            </div>

            <div style={{
              marginTop: '24px',
              paddingTop: '24px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <p style={{
                fontSize: '14px',
                color: '#9ca3af'
              }}>
                Si el problema persiste, contacta al administrador del sistema
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}

