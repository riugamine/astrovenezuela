import sanitizeHtmlLib from 'sanitize-html';

/**
 * Configuración de sanitización HTML para descripciones de productos
 * Permite solo tags y atributos seguros para prevenir XSS y otros ataques
 */
const sanitizeOptions: sanitizeHtmlLib.IOptions = {
  // Tags HTML permitidos
  allowedTags: [
    'p', 'br', 'strong', 'em', 'u', 'b', 'i',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'a', 'span', 'div'
  ],
  
  // Atributos permitidos por tag
  allowedAttributes: {
    'a': ['href', 'target', 'rel'],
    'span': ['style'],
    'div': ['style'],
    'p': ['style'],
    'h1': ['style'],
    'h2': ['style'],
    'h3': ['style'],
    'h4': ['style'],
    'h5': ['style'],
    'h6': ['style']
  },
  
  // Estilos CSS permitidos en el atributo style
  allowedStyles: {
    '*': {
      'color': [/^#[0-9a-fA-F]{3,6}$/, /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/, /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/],
      'text-align': [/^left$/, /^center$/, /^right$/, /^justify$/],
      'font-weight': [/^bold$/, /^normal$/, /^[1-9]00$/],
      'font-style': [/^italic$/, /^normal$/],
      'text-decoration': [/^underline$/, /^none$/]
    }
  },
  
  // URLs permitidas en enlaces
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: {
    'a': ['http', 'https', 'mailto']
  },
  
  // Transformar atributos para mayor seguridad
  transformTags: {
    'a': (tagName, attribs) => {
      // Agregar rel="noopener noreferrer" para enlaces externos
      if (attribs.href && (attribs.href.startsWith('http://') || attribs.href.startsWith('https://'))) {
        attribs.target = '_blank';
        attribs.rel = 'noopener noreferrer';
      }
      return {
        tagName,
        attribs
      };
    }
  },
  
  // Remover contenido vacío
  exclusiveFilter: (frame) => {
    // Remover elementos vacíos excepto br
    if (frame.tag === 'p' && !frame.text.trim()) {
      return true;
    }
    return false;
  }
};

/**
 * Sanitiza contenido HTML para descripciones de productos
 * @param html - Contenido HTML a sanitizar
 * @returns HTML sanitizado y seguro
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  // Validar tamaño máximo (50KB)
  const maxSize = 50 * 1024; // 50KB en bytes
  if (html.length > maxSize) {
    throw new Error('El contenido HTML excede el tamaño máximo permitido (50KB)');
  }
  
  // Sanitizar el HTML
  const sanitized = sanitizeHtmlLib(html, sanitizeOptions);
  
  // Validar que no queden scripts o eventos peligrosos
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^>]*>/gi,
    /<object\b[^>]*>/gi,
    /<embed\b[^>]*>/gi,
    /<form\b[^>]*>/gi,
    /<input\b[^>]*>/gi,
    /<button\b[^>]*>/gi
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(sanitized)) {
      throw new Error('El contenido contiene elementos no permitidos por seguridad');
    }
  }
  
  return sanitized;
}

/**
 * Valida si una URL es segura para usar en enlaces
 * @param url - URL a validar
 * @returns true si la URL es segura
 */
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:', 'mailto:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

/**
 * Sanitiza y valida una URL para enlaces
 * @param url - URL a sanitizar
 * @returns URL sanitizada o null si no es válida
 */
export function sanitizeUrl(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }
  
  // Limpiar espacios y caracteres peligrosos
  const cleanUrl = url.trim();
  
  // Validar que sea una URL segura
  if (!isValidUrl(cleanUrl)) {
    return null;
  }
  
  return cleanUrl;
}
