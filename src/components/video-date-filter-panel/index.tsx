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
import type { PlaylistItemVideoOutput } from '@/api';
import { cn } from '@/lib/utils';
import './index.css';
import { RangeCalendar } from '../range-calendar';

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
  const { selectedVideos } = useVideoSelection();

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

  const handleSelectByDateRange = () => {};

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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Selección por Fecha
          </DialogTitle>
          <DialogDescription>
            Selecciona videos agregados a la lista por rango de fechas o por mes
            específico
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Select Buttons */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Eliminar</h3>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                Último mes
              </Button>
              <Button variant="outline" size="sm">
                Últimos 3 meses
              </Button>
              <Button variant="outline" size="sm">
                Últimos 6 meses
              </Button>
              <Button variant="outline" size="sm">
                Último año
              </Button>
            </div>
          </div>

          {/* Custom Date Range */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Rango Personalizado</h3>
            <div className="w-full max-w-full overflow-x-hidden">
              <RangeCalendar
                dateRange={
                  dateRange.start || dateRange.end
                    ? {
                        from: dateRange.start || undefined,
                        to: dateRange.end || undefined,
                      }
                    : undefined
                }
                onDateRangeChange={(range) => {
                  setDateRange({
                    start: range?.from || null,
                    end: range?.to || null,
                  });
                }}
              />
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
                const selectedCount = videos.filter(
                  (video: PlaylistItemVideoOutput) =>
                    selectedVideos.some((id: string) => id === video.id)
                ).length;

                return (
                  <div
                    key={yearMonth}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg border'
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
                      <Button size="sm" className="gap-2">
                        <CheckSquare className="h-4 w-4" />
                        Seleccionar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
