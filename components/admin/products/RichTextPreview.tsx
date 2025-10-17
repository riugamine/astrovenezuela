"use client";

import { sanitizeHtml } from '@/lib/utils/sanitize-html';

interface RichTextPreviewProps {
  content: string;
  className?: string;
}

/**
 * Componente para previsualizar el contenido HTML sanitizado
 * Aplica los mismos estilos que se verán en la vista del cliente
 */
export function RichTextPreview({ content, className = "" }: RichTextPreviewProps) {
  // Sanitizar el contenido HTML
  const sanitizedContent = sanitizeHtml(content || '');

  return (
    <div className={`rich-text-preview ${className}`}>
      <div 
        className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none
                   prose-headings:text-gray-900 prose-headings:font-semibold
                   prose-p:text-gray-700 prose-p:leading-relaxed
                   prose-strong:text-gray-900 prose-strong:font-semibold
                   prose-em:text-gray-800 prose-em:italic
                   prose-ul:text-gray-700 prose-ol:text-gray-700
                   prose-li:text-gray-700 prose-li:leading-relaxed
                   prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                   prose-a:font-medium
                   min-h-[200px] p-4 border border-gray-300 rounded-md bg-white"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
      
      {/* Mostrar mensaje si no hay contenido */}
      {!content || content.trim() === '' ? (
        <div className="text-gray-500 text-center py-8 italic">
          No hay contenido para previsualizar
        </div>
      ) : null}
    </div>
  );
}

/**
 * Componente de previsualización con estilos específicos para la vista del cliente
 * Usa exactamente los mismos estilos que ProductInfo
 */
export function ClientViewPreview({ content, className = "" }: RichTextPreviewProps) {
  // Sanitizar el contenido HTML
  const sanitizedContent = sanitizeHtml(content || '');

  return (
    <div className={`client-view-preview ${className}`}>
      <div 
        className="text-muted-foreground space-y-3
                   [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:mb-4
                   [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-gray-900 [&_h2]:mb-3
                   [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-gray-900 [&_h3]:mb-2
                   [&_h4]:text-base [&_h4]:font-semibold [&_h4]:text-gray-900 [&_h4]:mb-2
                   [&_h5]:text-sm [&_h5]:font-semibold [&_h5]:text-gray-900 [&_h5]:mb-1
                   [&_h6]:text-xs [&_h6]:font-semibold [&_h6]:text-gray-900 [&_h6]:mb-1
                   [&_p]:text-gray-700 [&_p]:leading-relaxed [&_p]:mb-3
                   [&_strong]:font-semibold [&_strong]:text-gray-900
                   [&_em]:italic [&_em]:text-gray-800
                   [&_u]:underline
                   [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-3
                   [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-3
                   [&_li]:mb-1 [&_li]:text-gray-700
                   [&_a]:text-blue-600 [&_a]:underline [&_a]:hover:text-blue-800 [&_a]:font-medium
                   [&_div]:mb-2
                   [&_span]:text-gray-700
                   min-h-[200px] p-4 border border-gray-300 rounded-md bg-white"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
      
      {/* Mostrar mensaje si no hay contenido */}
      {!content || content.trim() === '' ? (
        <div className="text-gray-500 text-center py-8 italic">
          No hay contenido para previsualizar
        </div>
      ) : null}
    </div>
  );
}
