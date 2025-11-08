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

  // Use refs for values that need to persist and be accessible in closures
  const hasNextPageRef = useRef(hasNextPage);
  const isLoadingRefValue = useRef(isLoading);
  const isUserInteractingRef = useRef(false);
  const lastScrollPositionRef = useRef(0);
  const scrollDebounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const interactionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  // Update refs when values change
  useEffect(() => {
    hasNextPageRef.current = hasNextPage;
    isLoadingRefValue.current = isLoading;
  }, [hasNextPage, isLoading]);

  const triggerLoad = useCallback(() => {
    const now = Date.now();

    if (
      now - lastLoadTimeRef.current > debounceMs &&
      !isLoadingRef.current &&
      !isLoadingRefValue.current
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
  }, [onLoadNext, debounceMs]);

  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    let handleScroll: (() => void) | null = null;
    let handleSelect: (() => void) | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    // Use a small delay to ensure DOM is updated
    timeoutId = setTimeout(() => {
      const lastItem = lastItemRef.current;
      if (!lastItem || !hasNextPageRef.current || isLoadingRefValue.current) {
        return;
      }

      // Initialize scroll position
      if (api) {
        lastScrollPositionRef.current = api.scrollProgress();
      }

      // Intersection Observer for detecting when last item is visible
      // Only trigger on actual scroll, not on clicks
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          // Only trigger if not a user interaction (click) and actually scrolling
          if (
            entry.isIntersecting &&
            hasNextPageRef.current &&
            !isLoadingRefValue.current &&
            !isUserInteractingRef.current
          ) {
            triggerLoad();
          }
        },
        {
          root: null, // Use viewport
          rootMargin: '200px 0px', // Start loading when 200px before last item
          threshold: 0.1, // Increase threshold to avoid triggering on small movements
        }
      );

      observer.observe(lastItem);

      // Also use Embla events as backup - only trigger on actual scroll
      handleScroll = () => {
        if (!api || isLoadingRefValue.current || !hasNextPageRef.current)
          return;

        const currentScrollPosition = api.scrollProgress();
        const scrollDelta = Math.abs(
          currentScrollPosition - lastScrollPositionRef.current
        );

        // Only trigger if there was actual scroll movement (more than 0.01)
        if (scrollDelta < 0.01) {
          lastScrollPositionRef.current = currentScrollPosition;
          return;
        }

        lastScrollPositionRef.current = currentScrollPosition;

        // Clear any pending scroll debounce
        if (scrollDebounceTimeoutRef.current) {
          clearTimeout(scrollDebounceTimeoutRef.current);
        }

        // Debounce scroll events to avoid multiple triggers
        scrollDebounceTimeoutRef.current = setTimeout(() => {
          const cannotScrollNext = !api.canScrollNext();
          const currentIndex = api.selectedScrollSnap();
          const totalSlides = api.slideNodes().length;
          const isNearEnd = currentIndex >= totalSlides - 3; // Within last 3 items

          if (cannotScrollNext || isNearEnd) {
            triggerLoad();
          }
        }, 200);
      };

      handleSelect = () => {
        // Mark as user interaction to prevent Intersection Observer from triggering
        isUserInteractingRef.current = true;
        if (interactionTimeoutRef.current) {
          clearTimeout(interactionTimeoutRef.current);
        }
        // Reset after a short delay
        interactionTimeoutRef.current = setTimeout(() => {
          isUserInteractingRef.current = false;
        }, 300);
      };

      if (api) {
        api.on('scroll', handleScroll);
        api.on('select', handleSelect);
        api.on('settle', handleScroll);
      }
    }, 100);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (scrollDebounceTimeoutRef.current) {
        clearTimeout(scrollDebounceTimeoutRef.current);
      }
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
      }
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
  }, [api, lastItemRef, triggerLoad, itemsCount]);
}
