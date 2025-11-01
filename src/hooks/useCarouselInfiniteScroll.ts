import { useEffect, useRef, useCallback } from 'react';
import type { CarouselApi } from '@/components/ui/carousel';

interface UseCarouselInfiniteScrollOptions {
  api: CarouselApi | null;
  lastItemRef: React.RefObject<HTMLElement | null>;
  hasNextPage: boolean;
  isLoading: boolean;
  onLoadNext: () => void | Promise<void>;
  debounceMs?: number;
  itemsCount?: number;
}

/**
 * Hook para implementar scroll infinito en un carousel
 * Combina Intersection Observer con eventos de Embla para detección confiable
 */
export function useCarouselInfiniteScroll({
  api,
  lastItemRef,
  hasNextPage,
  isLoading,
  onLoadNext,
  debounceMs = 800,
  itemsCount = 0,
}: UseCarouselInfiniteScrollOptions): void {
  const lastLoadTimeRef = useRef(0);
  const loadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLoadingRef = useRef(false);

  const triggerLoad = useCallback(() => {
    const now = Date.now();
    
    if (
      now - lastLoadTimeRef.current > debounceMs &&
      !isLoadingRef.current &&
      !isLoading
    ) {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }

      isLoadingRef.current = true;
      loadTimeoutRef.current = setTimeout(async () => {
        lastLoadTimeRef.current = Date.now();
        try {
          await onLoadNext();
        } finally {
          isLoadingRef.current = false;
        }
      }, 150);
    }
  }, [onLoadNext, debounceMs, isLoading]);

  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    let handleScroll: (() => void) | null = null;
    let handleSelect: (() => void) | null = null;

    // Use a small delay to ensure DOM is updated
    const timeoutId = setTimeout(() => {
      const lastItem = lastItemRef.current;
      if (!lastItem || !hasNextPage || isLoading) {
        return;
      }

      // Intersection Observer for detecting when last item is visible
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry.isIntersecting && hasNextPage && !isLoading) {
            triggerLoad();
          }
        },
        {
          root: null, // Use viewport
          rootMargin: '400px 0px', // Start loading when 400px before last item
          threshold: 0.01,
        }
      );

      observer.observe(lastItem);

      // Also use Embla events as backup
      handleScroll = () => {
        if (!api || isLoading || !hasNextPage) return;

        const cannotScrollNext = !api.canScrollNext();
        const currentIndex = api.selectedScrollSnap();
        const totalSlides = api.slideNodes().length;
        const isNearEnd = currentIndex >= totalSlides - 3; // Within last 3 items

        if (cannotScrollNext || isNearEnd) {
          triggerLoad();
        }
      };

      handleSelect = () => {
        if (!api || isLoading || !hasNextPage) return;
        handleScroll?.();
      };

      if (api) {
        api.on('scroll', handleScroll);
        api.on('select', handleSelect);
        api.on('settle', handleScroll);
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (observer) {
        observer.disconnect();
      }
      if (api && handleScroll && handleSelect) {
        api.off('scroll', handleScroll);
        api.off('select', handleSelect);
        api.off('settle', handleScroll);
      }
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [api, lastItemRef, hasNextPage, isLoading, triggerLoad, itemsCount]);
}

