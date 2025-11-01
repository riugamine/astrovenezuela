# Guía de Debugging para Errores 500

Esta guía te ayudará a identificar y solucionar errores 500 en tu aplicación Next.js desplegada en Linux con Nginx.

## 🔧 Archivos Creados

1. **`app/error.tsx`** - Error boundary para errores en páginas específicas
2. **`app/global-error.tsx`** - Error boundary para errores globales (incluyendo el root layout)
3. **`.env.local.example`** - Ejemplo de variables de entorno

## 📋 Cómo Habilitar Errores Detallados

### En Desarrollo (Automático)
Los errores detallados se muestran automáticamente cuando ejecutas:
```bash
npm run dev
```

### En Producción (Servidor Linux/Nginx)

#### Opción 1: Variable de Entorno (Recomendado)
Agrega esta línea a tu archivo `.env.local` en el servidor:
```bash
NEXT_PUBLIC_SHOW_ERROR_DETAILS=true
```

Luego reinicia tu aplicación:
```bash
pm2 restart astrovenezuela
# o si usas otro process manager
systemctl restart your-app-service
```

#### Opción 2: Temporalmente en el Código
Si no tienes acceso a `.env.local`, puedes modificar temporalmente `app/error.tsx`:
```typescript
// Cambiar esta línea:
const showDetailedError = process.env.NEXT_PUBLIC_SHOW_ERROR_DETAILS === 'true' || 
                         process.env.NODE_ENV === 'development'

// Por esta (muestra errores siempre):
const showDetailedError = true
```

⚠️ **IMPORTANTE**: No dejes `showDetailedError = true` en producción permanentemente, ya que expone información sensible.

## 🔍 Información que Muestra la Página de Error

Cuando está habilitado, verás:

1. **Mensaje del Error** - Descripción del problema
2. **Error Digest/ID** - Identificador único para tracking
3. **Stack Trace** - Rastro completo de dónde ocurrió el error
4. **Tipo de Error** - Nombre/categoría del error
5. **Información del Entorno**:
   - NODE_ENV (development/production)
   - User Agent del navegador
   - URL donde ocurrió el error

## 🐛 Cómo Debuggear en tu Servidor Linux

### 1. Ver Logs de Next.js
Si usas PM2:
```bash
pm2 logs astrovenezuela
```

Si usas systemd:
```bash
journalctl -u your-app-service -f
```

### 2. Ver Logs de Nginx
```bash
# Errores
sudo tail -f /var/log/nginx/error.log

# Access logs
sudo tail -f /var/log/nginx/access.log
```

### 3. Verificar Memoria y Recursos
```bash
# Ver uso de memoria
free -h

# Ver procesos de Node
ps aux | grep node

# Ver uso de CPU
top
```

### 4. Verificar Variables de Entorno
```bash
# En el servidor, ve al directorio de la app
cd /ruta/a/tu/app

# Verifica que el archivo .env.local existe
cat .env.local

# Verifica que las variables están cargadas
pm2 env 0  # Si usas PM2
```

## 🔥 Problemas Comunes y Soluciones

### Error: "Cannot read property of undefined"
**Causa**: Datos faltantes del servidor (exchange rate, productos, etc.)
**Solución**: 
- Verifica conexión a Supabase
- Revisa que las variables de entorno estén configuradas
- Asegúrate de que los datos se cargan con try/catch

### Error: "Hydration mismatch"
**Causa**: Diferencia entre render de servidor y cliente
**Solución**: 
- Usa `'use client'` en componentes que usan hooks
- Implementa verificación `isMounted` para componentes cliente

### Error: "Module not found"
**Causa**: Dependencias no instaladas en producción
**Solución**:
```bash
cd /ruta/a/tu/app
npm install
npm run build
pm2 restart astrovenezuela
```

### Error 500 en "/" (página principal)
**Causas posibles**:
1. ✅ **Ya solucionado**: ProductGrid sin productos iniciales
2. ✅ **Ya solucionado**: Demasiados revalidatePath
3. ⚠️ **Verificar**: Conexión a Supabase
4. ⚠️ **Verificar**: Variables de entorno

**Verificación**:
```bash
# En el servidor
curl -I http://localhost:3000/

# Deberías ver:
# HTTP/1.1 200 OK  ✅ Funciona
# HTTP/1.1 500 Internal Server Error  ❌ Hay problema
```

## 📊 Logs Útiles para Compartir

Si necesitas ayuda, comparte:
```bash
# 1. Últimas 50 líneas de logs de Next.js
pm2 logs astrovenezuela --lines 50 > nextjs-logs.txt

# 2. Últimas 50 líneas de Nginx
sudo tail -n 50 /var/log/nginx/error.log > nginx-logs.txt

# 3. Estado del sistema
free -h > system-status.txt
df -h >> system-status.txt
```

## 🚨 Desactivar Errores Detallados en Producción

Una vez que hayas identificado el problema:

1. Edita `.env.local`:
```bash
NEXT_PUBLIC_SHOW_ERROR_DETAILS=false
```

2. O elimina la línea completamente

3. Reinicia la app:
```bash
pm2 restart astrovenezuela
```

## 🎯 Checklist de Debugging

- [ ] Habilitar `NEXT_PUBLIC_SHOW_ERROR_DETAILS=true`
- [ ] Reproducir el error y capturar el stack trace completo
- [ ] Verificar logs de Next.js (`pm2 logs`)
- [ ] Verificar logs de Nginx (`/var/log/nginx/error.log`)
- [ ] Comprobar variables de entorno (`.env.local`)
- [ ] Verificar conexión a Supabase
- [ ] Revisar uso de memoria y CPU
- [ ] Probar en modo development local
- [ ] Aplicar solución
- [ ] Desactivar errores detallados

## 💡 Tips Adicionales

1. **Backup antes de cambios**:
```bash
pm2 save
cp .env.local .env.local.backup
```

2. **Recargar sin caché**:
```bash
# Limpiar caché de Next.js
rm -rf .next
npm run build
pm2 restart astrovenezuela
```

3. **Verificar permisos**:
```bash
# La app debe tener permisos para leer .env.local
chmod 644 .env.local
```

## 📞 Soporte

Si después de seguir estos pasos el error persiste:
1. Captura screenshots de la página de error completa
2. Guarda los logs como se indica arriba
3. Anota exactamente qué pasos llevaron al error
4. Comparte esta información para ayuda adicional

