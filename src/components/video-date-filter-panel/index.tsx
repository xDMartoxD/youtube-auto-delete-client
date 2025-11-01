import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Calendar, Filter, CheckSquare } from 'lucide-react';
import { usePlaylistVideos, useVideoSelection } from '@/hooks';
import useYoutube from '@/stores/youtube';
import { cn } from '@/lib/utils';

interface DateRange {
  start: Date | null;
  end: Date | null;
}

export function VideoDateFilterPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: null,
    end: null,
  });
  const { videosItems } = usePlaylistVideos();
  const { selectAllVideos, clearSelectedVideos } = useVideoSelection();
  const {
    selectedVideos,
    toggleVideoSelection,
    selectVideosByDateRange,
  } = useYoutube();

  // Group videos by date (year-month)
  const videosByDate = useMemo(() => {
    const grouped: Record<string, typeof videosItems> = {};
    
    videosItems.forEach((video) => {
      if (!video.snippet?.publishedAt) return;
      
      const date = new Date(video.snippet.publishedAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(video);
    });

    return Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a));
  }, [videosItems]);

  // Helper to get videos in date range for display purposes
  const getVideosInRange = useMemo(() => {
    return (start: Date | null, end: Date | null) => {
      if (!start && !end) return [];

      return videosItems.filter((video) => {
        if (!video.snippet?.publishedAt) return false;
        const videoDate = new Date(video.snippet.publishedAt);
        videoDate.setHours(0, 0, 0, 0);

        if (start && end) {
          const startDate = new Date(start);
          startDate.setHours(0, 0, 0, 0);
          const endDate = new Date(end);
          endDate.setHours(23, 59, 59, 999);
          return videoDate >= startDate && videoDate <= endDate;
        }
        if (start) {
          const startDate = new Date(start);
          startDate.setHours(0, 0, 0, 0);
          return videoDate >= startDate;
        }
        if (end) {
          const endDate = new Date(end);
          endDate.setHours(23, 59, 59, 999);
          return videoDate <= endDate;
        }
        return false;
      });
    };
  }, [videosItems]);

  const handleSelectByDateRange = () => {
    selectVideosByDateRange(dateRange.start, dateRange.end);
  };

  const handleQuickSelect = (monthsAgo: number) => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - monthsAgo);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    selectVideosByDateRange(start, end);
  };

  const handleSelectByMonth = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-').map(Number);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);
    selectVideosByDateRange(start, end);
  };

  const isMonthSelected = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-').map(Number);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);
    const videosInRange = getVideosInRange(start, end);
    return videosInRange.length > 0 && videosInRange.every((video) =>
      selectedVideos.some((v) => v.id === video.id)
    );
  };

  const formatMonthYear = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-').map(Number);
    const date = new Date(year, month - 1);
    const monthName = date.toLocaleDateString('es-ES', { month: 'long' });
    return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filtros avanzados</span>
          <span className="sm:hidden">Filtros</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Selección por Fecha
          </DialogTitle>
          <DialogDescription>
            Selecciona videos por rango de fechas o por mes específico
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Select Buttons */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Selección Rápida</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickSelect(1)}
              >
                Último mes
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickSelect(3)}
              >
                Últimos 3 meses
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickSelect(6)}
              >
                Últimos 6 meses
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickSelect(12)}
              >
                Último año
              </Button>
            </div>
          </div>

          {/* Custom Date Range */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Rango Personalizado</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  value={
                    dateRange.start
                      ? dateRange.start.toISOString().split('T')[0]
                      : ''
                  }
                  onChange={(e) =>
                    setDateRange({
                      ...dateRange,
                      start: e.target.value ? new Date(e.target.value) : null,
                    })
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">
                  Fecha Fin
                </label>
                <input
                  type="date"
                  value={
                    dateRange.end
                      ? dateRange.end.toISOString().split('T')[0]
                      : ''
                  }
                  onChange={(e) =>
                    setDateRange({
                      ...dateRange,
                      end: e.target.value ? new Date(e.target.value) : null,
                    })
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={handleSelectByDateRange}
              disabled={!dateRange.start && !dateRange.end}
              className="gap-2"
            >
              <CheckSquare className="h-4 w-4" />
              Seleccionar en rango
            </Button>
          </div>

          {/* Videos by Month */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">
              Videos por Mes ({videosByDate.length} períodos)
            </h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {videosByDate.map(([yearMonth, videos]) => {
                const isAllSelected = isMonthSelected(yearMonth);
                const selectedCount = videos.filter((video) =>
                  selectedVideos.some((v) => v.id === video.id)
                ).length;

                return (
                  <div
                    key={yearMonth}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg border',
                      isAllSelected && 'bg-primary/10 border-primary'
                    )}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {formatMonthYear(yearMonth)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedCount} / {videos.length} seleccionados
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={isAllSelected ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => handleSelectByMonth(yearMonth)}
                        disabled={isAllSelected}
                        className="gap-2"
                      >
                        <CheckSquare className="h-4 w-4" />
                        Seleccionar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={selectAllVideos}
              className="flex-1"
            >
              Seleccionar todo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearSelectedVideos}
              className="flex-1"
            >
              Deseleccionar todo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

