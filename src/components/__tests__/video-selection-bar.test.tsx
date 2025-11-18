import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VideoSelectionBar } from '../video-selection-bar';

// Mock the hook
const mockClearSelectedVideos = vi.fn();
const mockSelectedVideosCount = 3;
const mockHasSelectedVideos = true;

vi.mock('@/hooks', () => ({
  useVideoSelection: vi.fn(() => ({
    selectedVideosCount: mockSelectedVideosCount,
    hasSelectedVideos: mockHasSelectedVideos,
    clearSelectedVideos: mockClearSelectedVideos,
  })),
}));

describe('VideoSelectionBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render when there are selected videos', () => {
    const onDelete = vi.fn();
    render(<VideoSelectionBar onDelete={onDelete} />);

    expect(screen.getByText('3 videos selected')).toBeInTheDocument();
    expect(screen.getByText('Clear')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('should not render when there are no selected videos', () => {
    vi.mocked(require('@/hooks').useVideoSelection).mockReturnValue({
      selectedVideosCount: 0,
      hasSelectedVideos: false,
      clearSelectedVideos: mockClearSelectedVideos,
    });

    const onDelete = vi.fn();
    const { container } = render(<VideoSelectionBar onDelete={onDelete} />);

    expect(container.firstChild).toBeNull();
  });

  it('should show singular form for one video', () => {
    vi.mocked(require('@/hooks').useVideoSelection).mockReturnValue({
      selectedVideosCount: 1,
      hasSelectedVideos: true,
      clearSelectedVideos: mockClearSelectedVideos,
    });

    const onDelete = vi.fn();
    render(<VideoSelectionBar onDelete={onDelete} />);

    expect(screen.getByText('1 video selected')).toBeInTheDocument();
  });

  it('should call onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<VideoSelectionBar onDelete={onDelete} />);

    const deleteButton = screen.getByText('Delete');
    await user.click(deleteButton);

    expect(onDelete).toHaveBeenCalled();
  });

  it('should call clearSelectedVideos when clear button is clicked', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<VideoSelectionBar onDelete={onDelete} />);

    const clearButton = screen.getByText('Clear');
    await user.click(clearButton);

    expect(mockClearSelectedVideos).toHaveBeenCalled();
  });

  it('should disable delete button when isDeleting is true', () => {
    const onDelete = vi.fn();
    render(<VideoSelectionBar onDelete={onDelete} isDeleting={true} />);

    const deleteButton = screen.getByText('Delete');
    expect(deleteButton).toBeDisabled();
  });

  it('should show loading state when deleting', () => {
    const onDelete = vi.fn();
    render(<VideoSelectionBar onDelete={onDelete} isDeleting={true} />);

    expect(screen.getByText('Deleting...')).toBeInTheDocument();
  });
});

