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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
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
  const {
    getDateRangesSelection,
    addDateRange,
    removeDateRange,
    shouldRemovePrivateVideos,
    setShouldRemovePrivateVideos,
    shouldRemoveDeletedVideos,
    setShouldRemoveDeletedVideos,
  } = useVideoSelection();

  const handleSelectByDateRange = () => {
    addDateRange(dateRange.start, dateRange.end);
    setDateRange({ start: null, end: null });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Advanced filters</span>
          <span className="sm:hidden">Filters</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Date Range Selection
          </DialogTitle>
          <DialogDescription>
            Select videos added to the playlist by date range
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Remove Private Videos Checkbox */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remove-private-videos"
                checked={shouldRemovePrivateVideos}
                onCheckedChange={(checked) =>
                  setShouldRemovePrivateVideos(checked === true)
                }
              />
              <Label
                htmlFor="remove-private-videos"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Remove private videos
              </Label>
            </div>
            <p className="text-xs text-muted-foreground ml-6">
              If enabled, private videos will also be deleted
            </p>
          </div>

          {/* Remove Deleted Videos Checkbox */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remove-deleted-videos"
                checked={shouldRemoveDeletedVideos}
                onCheckedChange={(checked) =>
                  setShouldRemoveDeletedVideos(checked === true)
                }
              />
              <Label
                htmlFor="remove-deleted-videos"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Remove deleted videos
              </Label>
            </div>
            <p className="text-xs text-muted-foreground ml-6">
              If enabled, deleted videos will also be removed
            </p>
          </div>

          {/* Quick Select Buttons */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Selected date ranges</h3>
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
                      aria-label="Remove date range"
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
            <h3 className="text-sm font-semibold">Custom Range</h3>
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
              Add range
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
