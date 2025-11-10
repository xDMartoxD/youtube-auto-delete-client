import { useEffect, useRef, useCallback } from 'react';
import type { CarouselApi } from '@/components/ui/carousel';

interface UseCarouselInfiniteScrollOptions {
  api: CarouselApi | null;
  lastItemRef: React.RefObject<HTMLElement | null>;
  hasNextPage: boolean;
  isLoading: boolean;
  onLoadNext: () => void | Promise<void>;
  itemsCount?: number;
}

/**
 * Hook para implementar scroll infinito en un carousel
 * Usa el evento 'select' de Embla para detectar cuando canScrollNext es false
 * y Intersection Observer como método principal
 */
export function useCarouselInfiniteScroll({
  api,
  lastItemRef,
  hasNextPage,
  isLoading,
  onLoadNext,
  itemsCount = 0,
}: UseCarouselInfiniteScrollOptions): void {
  // Refs para mantener valores actualizados en closures
  const onLoadNextRef = useRef(onLoadNext);
  const hasNextPageRef = useRef(hasNextPage);
  const isLoadingRef = useRef(isLoading);
  const isLoadingMoreRef = useRef(false);

  // Actualizar refs cuando cambian los valores
  useEffect(() => {
    onLoadNextRef.current = onLoadNext;
  }, [onLoadNext]);

  useEffect(() => {
    hasNextPageRef.current = hasNextPage;
    isLoadingRef.current = isLoading;
  }, [hasNextPage, isLoading]);

  // Función para cargar la siguiente página
  const loadNextPage = useCallback(async () => {
    // Verificar condiciones antes de cargar
    if (
      isLoadingMoreRef.current ||
      isLoadingRef.current ||
      !hasNextPageRef.current
    ) {
      return;
    }

    isLoadingMoreRef.current = true;

    try {
      await onLoadNextRef.current();
    } catch (error) {
      console.error('Error loading next page:', error);
    } finally {
      // Reset flag después de un delay para permitir actualizaciones de estado
      setTimeout(() => {
        isLoadingMoreRef.current = false;
      }, 300);
    }
  }, []);

  // Método principal: Escuchar el evento 'select' para detectar cuando canScrollNext es false
  useEffect(() => {
    if (!api || !hasNextPage) {
      return;
    }

    const handleSelect = () => {
      if (
        !api ||
        isLoadingRef.current ||
        !hasNextPageRef.current ||
        isLoadingMoreRef.current
      ) {
        return;
      }

      // Verificar si canScrollNext es false (llegamos al final)
      const cannotScrollNext = !api.canScrollNext();

      if (cannotScrollNext) {
        console.log(
          '[InfiniteScroll] canScrollNext is false, loading next page'
        );
        void loadNextPage();
      }
    };

    // Verificar inmediatamente al montar
    handleSelect();

    // Escuchar eventos de selección
    api.on('select', handleSelect);
    api.on('reInit', handleSelect);

    return () => {
      api.off('select', handleSelect);
      api.off('reInit', handleSelect);
    };
  }, [api, hasNextPage, loadNextPage]);

  // Intersection Observer como método secundario: detecta cuando el último item entra en el viewport
  useEffect(() => {
    if (!api || itemsCount === 0 || !hasNextPage) {
      return;
    }

    let observer: IntersectionObserver | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let retryCount = 0;
    const MAX_RETRIES = 10;
    let isCleanedUp = false;

    const setupObserver = () => {
      if (isCleanedUp) return;

      const lastItem = lastItemRef.current;
      if (!lastItem) {
        // Retry si el ref no está disponible aún
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          timeoutId = setTimeout(setupObserver, 100);
        }
        return;
      }

      observer = new IntersectionObserver(
        (entries) => {
          if (isCleanedUp) return;

          const entry = entries[0];
          if (
            entry.isIntersecting &&
            hasNextPageRef.current &&
            !isLoadingRef.current &&
            !isLoadingMoreRef.current
          ) {
            console.log(
              '[InfiniteScroll] Last item is visible, loading next page'
            );
            void loadNextPage();
          }
        },
        {
          root: null,
          rootMargin: '600px 0px', // Cargar cuando está a 600px del viewport
          threshold: 0.1,
        }
      );

      observer.observe(lastItem);
    };

    // Delay inicial para asegurar que el DOM esté listo
    timeoutId = setTimeout(setupObserver, 200);

    return () => {
      isCleanedUp = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (observer) {
        observer.disconnect();
      }
    };
  }, [api, lastItemRef, itemsCount, hasNextPage, loadNextPage]);
}
