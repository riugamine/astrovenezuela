'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle, faRefresh, faHome, faBug } from '@fortawesome/free-solid-svg-icons'

/**
 * Global error boundary for the application
 * Shows detailed error information to help with debugging
 * @param error - The error that was thrown
 * @param reset - Function to reset the error boundary
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('Application Error:', error)
  }, [error])

  // Determine if we should show detailed errors
  // You can control this with an environment variable
  const showDetailedError = process.env.NEXT_PUBLIC_SHOW_ERROR_DETAILS === 'true' || 
                           process.env.NODE_ENV === 'development'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="max-w-2xl w-full shadow-2xl border-red-200 dark:border-red-900">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <FontAwesomeIcon 
              icon={faExclamationTriangle} 
              className="h-10 w-10 text-red-600 dark:text-red-400" 
            />
          </div>
          <CardTitle className="text-3xl font-bold text-red-600 dark:text-red-400">
            Error 500 - Internal Server Error
          </CardTitle>
          <CardDescription className="text-lg">
            Algo salió mal al procesar esta página
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error Details */}
          {showDetailedError && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <FontAwesomeIcon icon={faBug} className="h-4 w-4" />
                Detalles del Error (Solo visible en desarrollo)
              </div>

              {/* Error Message */}
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 dark:text-red-300 mb-2">
                  Mensaje:
                </h3>
                <p className="text-sm text-red-700 dark:text-red-400 font-mono break-words">
                  {error.message || 'No error message available'}
                </p>
              </div>

              {/* Error Digest */}
              {error.digest && (
                <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                  <h3 className="font-semibold text-orange-800 dark:text-orange-300 mb-2">
                    Error Digest (ID de seguimiento):
                  </h3>
                  <p className="text-sm text-orange-700 dark:text-orange-400 font-mono">
                    {error.digest}
                  </p>
                </div>
              )}

              {/* Stack Trace */}
              {error.stack && (
                <div className="bg-gray-50 dark:bg-gray-950/30 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-300 mb-2">
                    Stack Trace:
                  </h3>
                  <pre className="text-xs text-gray-700 dark:text-gray-400 font-mono overflow-x-auto whitespace-pre-wrap break-words max-h-64 overflow-y-auto">
                    {error.stack}
                  </pre>
                </div>
              )}

              {/* Error Name/Type */}
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                  Tipo de Error:
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-400 font-mono">
                  {error.name || 'Error'}
                </p>
              </div>

              {/* Environment Info */}
              <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <h3 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">
                  Información del Entorno:
                </h3>
                <div className="text-sm text-purple-700 dark:text-purple-400 space-y-1">
                  <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV || 'unknown'}</p>
                  <p><strong>User Agent:</strong> {typeof window !== 'undefined' ? navigator.userAgent : 'Server-side'}</p>
                  <p><strong>URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {/* User-friendly message for production */}
          {!showDetailedError && (
            <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                Se ha producido un error interno del servidor. 
                Nuestro equipo ha sido notificado y está trabajando en solucionarlo.
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-2">
                ID de error: {error.digest || 'No disponible'}
              </p>
            </div>
          )}

          {/* Debugging Tips */}
          {showDetailedError && (
            <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
              <h3 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-2">
                💡 Tips para debugging:
              </h3>
              <ul className="text-sm text-indigo-700 dark:text-indigo-400 space-y-1 list-disc list-inside">
                <li>Revisa los logs del servidor Next.js</li>
                <li>Verifica los logs de Nginx en: <code className="bg-indigo-100 dark:bg-indigo-900 px-1 rounded">/var/log/nginx/error.log</code></li>
                <li>Revisa las variables de entorno en el servidor</li>
                <li>Verifica la conexión a la base de datos (Supabase)</li>
                <li>Comprueba si hay problemas de memoria o recursos</li>
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={reset}
              className="flex-1 bg-primary hover:bg-primary/90"
              size="lg"
            >
              <FontAwesomeIcon icon={faRefresh} className="mr-2 h-4 w-4" />
              Intentar de Nuevo
            </Button>
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              <FontAwesomeIcon icon={faHome} className="mr-2 h-4 w-4" />
              Ir al Inicio
            </Button>
          </div>

          {/* Additional Help */}
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Si el problema persiste, contacta al soporte técnico
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

