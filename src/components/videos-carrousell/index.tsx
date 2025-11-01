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
import { useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import {
  usePlaylistVideos,
  useVideoSelection,
  useCarouselInfiniteScroll,
} from '@/hooks';
import { getVideoThumbnailUrl } from '@/types/video';

export function VideosCarrousell() {
  const carouselApiRef = useRef<CarouselApi | null>(null);
  const carouselContainerRef = useRef<HTMLDivElement>(null);
  const lastItemRef = useRef<HTMLDivElement>(null);

  const {
    videosItems,
    isLoadingVideos,
    videosError,
    hasNextPage,
    loadNextPage,
  } = usePlaylistVideos();

  const { isVideoSelected, toggleVideoSelection } = useVideoSelection();

  const handleSetApi = useCallback((api: CarouselApi | undefined) => {
    if (api) {
      carouselApiRef.current = api;
    }
  }, []);

  // Auto-load next page when reaching the end
  // Pass videosItems.length to trigger re-setup when videos change
  useCarouselInfiniteScroll({
    api: carouselApiRef.current,
    lastItemRef,
    hasNextPage,
    isLoading: isLoadingVideos,
    onLoadNext: loadNextPage,
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

  if (isLoadingVideos && videosItems.length === 0) {
    return (
      <div className="flex items-center justify-center w-full py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (videosError) {
    return (
      <div className="flex items-center justify-center w-full py-12">
        <p className="text-destructive">Error loading videos</p>
      </div>
    );
  }

  if (videosItems.length === 0) {
    return (
      <div className="flex items-center justify-center w-full py-12">
        <p className="text-muted-foreground">No videos found</p>
      </div>
    );
  }

  return (
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
                      'overflow-hidden transition-all hover:shadow-lg h-full flex flex-col',
                      isSelected && 'ring-2 ring-primary'
                    )}
                    onClick={() => {
                      toggleVideoSelection(video);
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
                        <div className="absolute top-2 right-2">
                          <Checkbox
                            checked={isSelected}
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
        {isLoadingVideos && hasNextPage ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : null}
      </CarouselNext>
    </Carousel>
  );
}
