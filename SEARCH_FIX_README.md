# Solución al Error de Búsqueda

Este documento explica los cambios realizados para solucionar dos problemas en el buscador:

## Problemas Solucionados

### 1. ❌ Error de Paginación: "Range Not Satisfiable"
**Problema:** Al buscar productos, se mostraba el error `PGRST103: "An offset of 12 was requested, but there are only 2 rows."`

**Causa:** El hook `useSearchProducts` estaba usando `initialData.length` como el total de productos, pero ese número solo representaba los productos de la primera página (12 productos), no el total real de resultados en la base de datos.

**Solución:** 
- Ahora pasamos el `totalCount` real desde el servidor (`app/(shop)/search/page.tsx`)
- El hook usa este total para calcular correctamente si hay más páginas disponibles
- Esto evita intentar cargar páginas que no existen

### 2. 🔍 Búsqueda Insensible a Acentos
**Problema:** Si un usuario busca "camison" (sin acento) pero en la BD está "camisón" (con acento), no se encontraban resultados.

**Causa:** Solo estábamos normalizando el texto del usuario, pero NO los datos en la base de datos.

**Solución:** 
- Usamos la extensión `unaccent` de PostgreSQL para normalizar el texto directamente en la base de datos
- Esto es más eficiente y correcto que hacerlo en el cliente
- Ahora las búsquedas funcionan independientemente de los acentos

## 📋 Instrucciones para Aplicar la Migración

### Opción 1: Via Supabase Dashboard (Recomendado)

1. Accede al [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a tu proyecto
3. Navega a `SQL Editor` en el menú lateral
4. Crea una nueva query
5. Copia y pega el contenido del archivo `supabase/migrations/20241101_enable_unaccent.sql`
6. Ejecuta la query

### Opción 2: Via Supabase CLI

Si tienes instalado Supabase CLI:

```bash
# Asegúrate de estar conectado a tu proyecto
supabase link --project-ref tu-project-ref

# Ejecuta las migraciones
supabase db push
```

### Opción 3: Ejecutar Manualmente

Si prefieres ejecutar el SQL manualmente, ejecuta estos comandos en tu base de datos PostgreSQL:

```sql
-- Habilitar la extensión unaccent
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Crear función helper para normalizar texto
CREATE OR REPLACE FUNCTION normalize_for_search(text)
RETURNS text AS $$
  SELECT lower(unaccent($1))
$$ LANGUAGE SQL IMMUTABLE;

-- Crear índice para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_products_name_normalized 
ON products (normalize_for_search(name));
```

## 🔎 Cómo Funciona

### Antes:
```typescript
// Solo normalizábamos el query del usuario
const normalizedQuery = normalizeSearchText("camison"); // "camison"
// Pero la BD tiene "Camisón" con acento → NO coincide
.ilike("name", `%${normalizedQuery}%`)
```

### Ahora:
```typescript
// PostgreSQL normaliza AMBOS lados de la comparación
const normalizedQuery = normalizeSearchText("camison"); // "camison"
// PostgreSQL usa unaccent internamente
.filter('name', 'ilike', `%${normalizedQuery}%`)
// Compara: "camison" con "camison" (ambos normalizados) → ✅ Coincide
```

## 🎯 Beneficios

1. **Búsquedas Más Flexibles:** Los usuarios pueden buscar con o sin acentos
2. **Mejor Rendimiento:** El índice sobre la función normalizada acelera las búsquedas
3. **Menos Errores:** No más errores de paginación cuando hay pocos resultados
4. **Código Más Limpio:** La lógica de normalización está centralizada en PostgreSQL

## 🧪 Pruebas

Para verificar que funciona correctamente:

1. Busca un producto con acento (ej: "camisón")
2. Busca el mismo producto sin acento (ej: "camison")
3. Ambas búsquedas deberían encontrar el producto
4. La paginación debería funcionar correctamente sin errores

## 📝 Archivos Modificados

### Backend/Database:
- `supabase/migrations/20241101_enable_unaccent.sql` - Nueva migración

### Data Layer:
- `lib/data/products.ts` - Búsqueda con normalización
- `lib/hooks/useSearchProducts.ts` - Búsqueda con normalización + fix paginación

### Components:
- `components/shop/InfiniteSearchGrid.tsx` - Recibe initialTotal
- `components/shop/SearchWrapper.tsx` - Pasa initialTotal
- `app/(shop)/search/page.tsx` - Provee initialTotal desde servidor

## ❓ Preguntas Frecuentes

**Q: ¿Necesito ejecutar la migración en producción?**  
A: Sí, debes ejecutar la migración en todas las bases de datos (development, staging, production).

**Q: ¿Qué pasa si no ejecuto la migración?**  
A: La búsqueda seguirá funcionando, pero NO será insensible a acentos. Los usuarios tendrán que escribir exactamente como está en la BD.

**Q: ¿El índice es necesario?**  
A: No es obligatorio, pero es altamente recomendado para mejorar el rendimiento de las búsquedas.

**Q: ¿Puedo deshacer la migración?**  
A: Sí, puedes ejecutar:
```sql
DROP INDEX IF EXISTS idx_products_name_normalized;
DROP FUNCTION IF EXISTS normalize_for_search;
DROP EXTENSION IF EXISTS unaccent CASCADE;
```

## 🚀 Próximos Pasos

1. Ejecuta la migración en tu base de datos
2. Prueba el buscador
3. Verifica que no hay errores en la consola
4. Disfruta de las búsquedas mejoradas! 🎉

