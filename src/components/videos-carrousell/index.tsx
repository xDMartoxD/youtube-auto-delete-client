import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Checkbox } from '@/components/ui/checkbox';
import React, { useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useVideoSelection, useCarouselInfiniteScroll } from '@/hooks';
import { getVideoThumbnailUrl } from '@/types/video';
import { type PlaylistItemVideoOutput } from '@/api';

interface VideosCarrousellProps {
  videos: PlaylistItemVideoOutput[];
  title: string;
  hasNextPage: boolean;
  isLoading: boolean;
  onLoadNext?: () => void;
}

export function VideosCarrousell(
  props: VideosCarrousellProps
): React.JSX.Element {
  const carouselApiRef = useRef<CarouselApi | null>(null);
  const carouselContainerRef = useRef<HTMLDivElement>(null);
  const lastItemRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef<number | null>(null);

  const { isVideoSelected, toggleVideoSelection } = useVideoSelection();

  const videosItems = props.videos;

  const handleSetApi = useCallback((api: CarouselApi | undefined) => {
    if (api) {
      carouselApiRef.current = api;
    }
  }, []);

  // Restore scroll position after re-renders caused by state changes
  // Only run when videosItems length changes, not on every render
  useEffect(() => {
    const api = carouselApiRef.current;
    if (api && scrollPositionRef.current !== null) {
      const restorePosition = scrollPositionRef.current;
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        if (
          api &&
          restorePosition >= 0 &&
          restorePosition < videosItems.length
        ) {
          try {
            api.scrollTo(restorePosition, false); // false = no animation
            scrollPositionRef.current = null; // Clear after restore
          } catch {
            // Ignore errors if index is invalid
            scrollPositionRef.current = null;
          }
        }
      });
    }
  }, [videosItems.length]); // Only run when videos count changes

  // Auto-load next page when reaching the end
  // Pass videosItems.length to trigger re-setup when videos change
  useCarouselInfiniteScroll({
    api: carouselApiRef.current,
    lastItemRef,
    hasNextPage: props.hasNextPage ?? false,
    isLoading: props.isLoading ?? false,
    onLoadNext: props.onLoadNext ?? (() => {}),
    itemsCount: videosItems.length,
  });

  // Handle wheel events with non-passive listener to allow preventDefault
  useEffect(() => {
    const container = carouselContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Convert vertical wheel to horizontal scroll
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        if (carouselApiRef.current) {
          const api = carouselApiRef.current;
          const currentIndex = api.selectedScrollSnap();
          const scrollOffset = e.deltaY > 0 ? 1 : -1;
          const nextIndex = currentIndex + scrollOffset;

          if (nextIndex >= 0 && nextIndex < videosItems.length) {
            api.scrollTo(nextIndex);
          } else if (scrollOffset > 0 && api.canScrollNext()) {
            api.scrollNext();
          } else if (scrollOffset < 0 && api.canScrollPrev()) {
            api.scrollPrev();
          }
        }
      }
    };

    // Register event listener with passive: false to allow preventDefault
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [videosItems.length]);

  if (videosItems.length === 0) {
    return (
      <div className="flex items-center justify-center w-full py-12">
        <p className="text-muted-foreground">No videos found</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance text-left">
        {props.title}
      </h1>
      <Carousel
        className="w-full max-w-7xl"
        setApi={handleSetApi}
        opts={{
          align: 'start',
          dragFree: true,
        }}
      >
        <div ref={carouselContainerRef} className="w-full">
          <CarouselContent className="-ml-2 md:-ml-4">
            {videosItems.map((video, index) => {
              const thumbnailUrl = getVideoThumbnailUrl(video);
              const isSelected = isVideoSelected(video.id);
              const isLastItem = index === videosItems.length - 1;
              const videoTitle = video.snippet?.title ?? 'Untitled Video';
              const channelTitle =
                video.snippet?.videoOwnerChannelTitle ||
                video.snippet?.channelTitle ||
                'Unknown Channel';

              return (
                <CarouselItem
                  key={video.id}
                  className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 mv-2 py-2"
                >
                  <div
                    ref={isLastItem ? lastItemRef : undefined}
                    className="h-full"
                  >
                    <Card
                      className={cn(
                        'overflow-hidden transition-all hover:shadow-lg h-full flex flex-col mx-1',
                        isSelected && 'ring-2 ring-primary'
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleVideoSelection(video);
                      }}
                      onMouseDown={(e) => {
                        // Prevent carousel from treating this as a drag
                        e.stopPropagation();
                      }}
                    >
                      <CardContent className="p-0 flex flex-col h-full">
                        {/* Thumbnail */}
                        <div className="relative aspect-video w-full flex-shrink-0">
                          {thumbnailUrl ? (
                            <img
                              src={thumbnailUrl}
                              alt={videoTitle}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-muted">
                              <span className="text-sm text-muted-foreground">
                                No thumbnail
                              </span>
                            </div>
                          )}
                          {/* Checkbox overlay */}
                          <div
                            className="absolute top-2 right-2"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleVideoSelection(video);
                            }}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => {
                                // Controlled by parent onClick
                              }}
                              aria-label={`Select ${videoTitle}`}
                              className="border-primary"
                            />
                          </div>
                        </div>

                        {/* Video Info */}
                        <div className="p-4 space-y-2 flex-1 flex flex-col">
                          <h3 className="font-semibold text-sm line-clamp-2">
                            {videoTitle}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {channelTitle}
                          </p>
                          <div className="mt-auto space-y-1">
                            {video.snippet?.publishedAt && (
                              <p className="text-xs text-muted-foreground">
                                Added:{' '}
                                {new Date(
                                  video.snippet.publishedAt
                                ).toLocaleDateString()}
                              </p>
                            )}
                            {video.snippet?.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {video.snippet.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </div>
        <CarouselPrevious />
        <CarouselNext>
          {props.isLoading && props.hasNextPage ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : null}
        </CarouselNext>
      </Carousel>
    </>
  );
}
