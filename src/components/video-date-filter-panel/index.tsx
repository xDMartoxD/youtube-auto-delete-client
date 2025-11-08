import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Calendar, Filter, Plus, X } from 'lucide-react';
import { useVideoSelection } from '@/hooks';
import './index.css';
import { RangeCalendar } from '../range-calendar';
import { Badge } from '../ui/badge';
import { formatDate } from '@/utils';

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
  const { getDateRangesSelection, addDateRange, removeDateRange } =
    useVideoSelection();
  const handleSelectByDateRange = () => {
    addDateRange(dateRange.start, dateRange.end);
    setDateRange({ start: null, end: null });
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
            Selecciona videos agregados a la lista por rango de fechas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Select Buttons */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Eliminar</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(getDateRangesSelection).map(
                ([dateKey, range]) => (
                  <Badge
                    key={dateKey}
                    variant="secondary"
                    className="flex items-center gap-1.5 pr-1"
                  >
                    <span>
                      {formatDate(range.start)} - {formatDate(range.end)}
                    </span>
                    <button
                      onClick={() => removeDateRange(range.start)}
                      className="ml-1 rounded-full hover:bg-secondary/80 p-0.5 transition-colors"
                      aria-label="Eliminar rango de fecha"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )
              )}
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
              <Plus className="h-4 w-4" />
              Agregar rango
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
