# Architecture Documentation

## Overview

The YouTube Auto Delete Frontend follows a layered architecture pattern with clear separation of concerns. This document describes the architecture, data flow, and design decisions.

## Architecture Layers

```
┌─────────────────────────────────────────┐
│         Components (UI Layer)           │
│  - Pages, Feature Components, UI Kit    │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Hooks (Logic Layer)             │
│  - Custom hooks, State selectors        │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Stores (State Layer)            │
│  - Zustand stores, State management     │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Services (API Layer)            │
│  - API calls, Response validation       │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         API Client (Generated)          │
│  - Auto-generated from OpenAPI spec     │
└─────────────────────────────────────────┘
```

## Data Flow

1. **User Interaction** → Component triggers action
2. **Hook** → Calls store action or selector
3. **Store** → Calls service method
4. **Service** → Validates request, calls API client
5. **API Client** → Makes HTTP request to backend
6. **Response** → Service validates with Zod
7. **Store** → Updates state with validated data
8. **Hook** → Returns updated state to component
9. **Component** → Re-renders with new data

## Design Decisions

### State Management: Zustand

**Why Zustand?**
- Lightweight and simple API
- No boilerplate compared to Redux
- Built-in TypeScript support
- Excellent DevTools integration
- Atomic selectors prevent unnecessary re-renders

**Store Structure:**
- Modular stores in `src/stores/youtube/`
- Each module handles a specific domain (playlists, videos, selection)
- Actions are grouped in an `actions` object for stability

### Validation: Zod

**Why Zod?**
- Runtime validation for API responses
- Type inference from schemas
- Catches API contract changes early
- Better error messages than manual validation

**Usage:**
- All API responses are validated before being used
- Validation errors are logged and handled gracefully
- Schemas are defined in `src/schemas/`

### Service Layer Pattern

**Why a service layer?**
- Encapsulates API calls
- Centralizes error handling
- Validates responses before returning
- Makes testing easier (can mock services)

**Service Structure:**
```typescript
ServiceResult<T> {
  data?: T;
  error?: ErrorType;
  success: boolean;
}
```

### Atomic Selectors

**Why atomic selectors?**
- Prevents unnecessary re-renders
- Components only subscribe to data they need
- Better performance with large state trees

**Example:**
```typescript
// Good: Atomic selector
const playlists = usePlaylists();

// Bad: Selecting entire state
const { playlists } = useYoutubeStore();
```

## Module Structure

### YouTube Store Modules

1. **playlists.store.ts**: Playlist management
   - State: playlists, loading, errors
   - Actions: getUserPlaylists, setSelectedPlaylistId

2. **videos.store.ts**: Video management
   - State: playlist videos, loading, errors
   - Actions: getVideosFromSelectedPlaylist, clearVideos

3. **video-selection.store.ts**: Video selection logic
   - State: selected videos, date ranges, filters
   - Actions: Selection, date range, deletion operations

### Utility Modules

- **video-helpers.ts**: Business logic for video detection
  - isPrivateVideo, isDeletedVideo, filterVideosByType

- **error-handler.ts**: Centralized error handling
  - getErrorMessage, handleApiError, handleServiceError

## Testing Strategy

- **Unit Tests**: Services, utilities, hooks
- **Component Tests**: Critical UI components
- **Integration Tests**: Store actions and hooks
- **E2E Tests**: (Future) User flows

## Performance Optimizations

1. **Atomic Selectors**: Prevent unnecessary re-renders
2. **useMemo/useCallback**: Memoize expensive computations
3. **Code Splitting**: Lazy load routes (planned)
4. **React.memo**: Memoize components (planned)

## Future Improvements

- [ ] Implement code splitting for routes
- [ ] Add React.memo to heavy components
- [ ] Implement state persistence with zustand-persist
- [ ] Add retry logic for failed API calls
- [ ] Implement optimistic updates
- [ ] Add E2E tests with Playwright

