import { useMemo, useState } from 'react';
import type { TrackResponse } from '@/api';

export type TrackFilter = 'all' | 'unavailable' | 'duplicates';

export interface TrackFilters {
  query: string;
  filter: TrackFilter;
  /** yyyy-mm-dd; keep only tracks added before this day */
  addedBefore: string;
}

const INITIAL_FILTERS: TrackFilters = {
  query: '',
  filter: 'all',
  addedBefore: '',
};

function matches(
  track: TrackResponse,
  { query, filter, addedBefore }: TrackFilters,
  duplicates: Set<string>
): boolean {
  if (filter === 'unavailable' && track.is_available) return false;
  if (filter === 'duplicates' && !duplicates.has(track.item_id)) return false;
  if (addedBefore && (!track.added_at || track.added_at >= addedBefore)) {
    return false;
  }
  if (query) {
    const text = `${track.title} ${track.artist ?? ''} ${track.album ?? ''}`;
    if (!text.toLowerCase().includes(query.toLowerCase())) return false;
  }
  return true;
}

/**
 * Filtering and multi-selection for the clean-up view.
 * Selection is kept by item id so it survives filter changes.
 */
export function useTrackSelection(
  tracks: TrackResponse[] = [],
  duplicateItemIds: string[] = []
) {
  const [filters, setFilters] = useState<TrackFilters>(INITIAL_FILTERS);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const duplicates = useMemo(
    () => new Set(duplicateItemIds),
    [duplicateItemIds]
  );

  const visible = useMemo(
    () => tracks.filter((t) => matches(t, filters, duplicates)),
    [tracks, filters, duplicates]
  );

  const counts = useMemo(
    () => ({
      all: tracks.length,
      unavailable: tracks.filter((t) => !t.is_available).length,
      duplicates: duplicates.size,
    }),
    [tracks, duplicates]
  );

  const allVisibleSelected =
    visible.length > 0 && visible.every((t) => selected.has(t.item_id));

  const toggle = (itemId: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });

  const toggleAllVisible = () =>
    setSelected((current) => {
      const next = new Set(current);
      visible.forEach((t) =>
        allVisibleSelected ? next.delete(t.item_id) : next.add(t.item_id)
      );
      return next;
    });

  const updateFilters = (patch: Partial<TrackFilters>) =>
    setFilters((current) => ({ ...current, ...patch }));

  return {
    filters,
    updateFilters,
    visible,
    counts,
    duplicates,
    selected,
    allVisibleSelected,
    toggle,
    toggleAllVisible,
    clearSelection: () => setSelected(new Set()),
  };
}
