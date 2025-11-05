# 🔍 Validación con Zod - Explicación

## ¿Qué es Zod?

**Zod** es una biblioteca de validación de esquemas para TypeScript que permite:
- ✅ Validar datos en **runtime** (cuando la app está ejecutándose)
- ✅ Inferir tipos TypeScript automáticamente desde los esquemas
- ✅ Proteger contra datos malformados de APIs externas
- ✅ Proporcionar mensajes de error descriptivos

## ¿Por qué es importante?

### Problema sin Zod:
```typescript
// La API podría devolver datos inesperados
const result = await getPlaylistVideosService(playlistId);
// TypeScript cree que result.data.items existe
// Pero en runtime podría ser undefined o tener estructura diferente
result.data.items.forEach(video => {
  // 💥 Error si la API cambió su estructura
  console.log(video.snippet.title);
});
```

### Solución con Zod:
```typescript
// Validamos que los datos sean correctos antes de usarlos
const validated = VideoSchema.safeParse(result.data);
if (validated.success) {
  // ✅ Ahora SABEMOS que los datos son correctos
  validated.data.items.forEach(video => {
    console.log(video.snippet.title); // Seguro
  });
} else {
  // Manejar error de validación
  console.error('Datos inválidos:', validated.error);
}
```

## Ejemplo Práctico en tu Proyecto

### 1. Instalar Zod
```bash
npm install zod
```

### 2. Crear Esquemas de Validación

```typescript
// schemas/video.schema.ts
import { z } from 'zod';

// Esquema para un video individual
export const VideoSnippetSchema = z.object({
  title: z.string(),
  description: z.string().nullable(),
  publishedAt: z.string(), // ISO date string
  channelTitle: z.string().nullable(),
  videoOwnerChannelTitle: z.string().nullable(),
});

export const VideoSchema = z.object({
  id: z.string(),
  snippet: VideoSnippetSchema.nullable(),
});

// Esquema para la respuesta de la API
export const PlaylistVideoResponseSchema = z.object({
  items: z.array(VideoSchema),
  next_page_token: z.string().nullable(),
  page_info: z.object({
    total_results: z.number(),
    results_per_page: z.number(),
  }).optional(),
});
```

### 3. Usar en el Servicio

```typescript
// services/youtube.ts
import { PlaylistVideoResponseSchema } from '@/schemas/video.schema';

export async function getPlaylistVideos(...) {
  const result = await getPlaylistVideosApiYoutubePlaylistsPlaylistIdVideosGet(...);
  
  if (result.response.status === 200 && result.data) {
    // ✅ Validar los datos antes de devolverlos
    const validation = PlaylistVideoResponseSchema.safeParse(result.data);
    
    if (validation.success) {
      return {
        success: true,
        data: validation.data, // Datos validados y tipados
      };
    } else {
      // Los datos no cumplen el esquema esperado
      console.error('Validación fallida:', validation.error);
      return {
        success: false,
        error: new Error('Respuesta de API inválida'),
      };
    }
  }
  
  // ... resto del código
}
```

## Ventajas en tu Proyecto

### 1. **Protección contra Cambios de API**
Si el backend cambia la estructura de respuesta, Zod lo detectará antes de que cause errores en tu app.

### 2. **Tipos Automáticos**
```typescript
// Zod infiere el tipo TypeScript automáticamente
type Video = z.infer<typeof VideoSchema>;
// Equivale a:
// type Video = {
//   id: string;
//   snippet: {
//     title: string;
//     description: string | null;
//     // ...
//   } | null;
// }
```

### 3. **Validación en Formularios**
También puedes usar Zod para validar inputs de usuarios:

```typescript
// schemas/feedback.schema.ts
export const FeedbackSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
});

// En tu componente de feedback
const handleSubmit = (data: unknown) => {
  const validation = FeedbackSchema.safeParse(data);
  if (!validation.success) {
    // Mostrar errores al usuario
    validation.error.issues.forEach(issue => {
      console.error(`${issue.path}: ${issue.message}`);
    });
    return;
  }
  
  // validation.data está tipado y validado
  submitFeedback(validation.data);
};
```

## Comparación: Con vs Sin Zod

### ❌ Sin Zod (Confías en TypeScript solo)
```typescript
// TypeScript valida en COMPILE TIME, no en RUNTIME
const result = await getPlaylistVideos(playlistId);
// Si la API devuelve datos diferentes, tu app falla en runtime
result.data.items.forEach(video => {
  // 💥 Error si items es undefined
});
```

### ✅ Con Zod (Validación en Runtime)
```typescript
const result = await getPlaylistVideos(playlistId);
const validated = PlaylistVideoResponseSchema.safeParse(result.data);

if (validated.success) {
  // ✅ Datos garantizados como correctos
  validated.data.items.forEach(video => {
    // Seguro, Zod validó que items existe y es un array
  });
} else {
  // Manejar error de forma controlada
  showErrorToUser('Datos inválidos recibidos');
}
```

## ¿Es Necesario para tu Proyecto?

### ✅ **Sí, si:**
- La API es externa o puede cambiar
- Quieres máxima seguridad de tipos
- Necesitas validar formularios de usuario
- Quieres mensajes de error descriptivos

### ⚠️ **Tal vez no, si:**
- La API es tuya y controlas los cambios
- El proyecto es pequeño y no va a crecer
- Ya tienes validación robusta en el backend

## Recomendación

Para tu proyecto, **Zod sería útil** porque:
1. Protege contra cambios inesperados en la API de YouTube
2. Valida datos antes de guardarlos en el store
3. Puede validar formularios (feedback, etc.)
4. Es ligero (~2KB) y fácil de integrar

**Prioridad:** Media - No es crítico ahora, pero mejora la robustez del código.

