import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeleteVideosDialog } from '../delete-videos-dialog';

// Mock the hook
const mockDeleteSelectedVideos = vi.fn();
const mockSelectedVideosCount = 5;
const mockIsDeleting = false;

vi.mock('@/hooks', () => ({
  useVideoSelection: vi.fn(() => ({
    selectedVideosCount: mockSelectedVideosCount,
    deleteSelectedVideos: mockDeleteSelectedVideos,
    isDeleting: mockIsDeleting,
  })),
}));

describe('DeleteVideosDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dialog when open', () => {
    const onOpenChange = vi.fn();
    render(
      <DeleteVideosDialog open={true} onOpenChange={onOpenChange} />
    );

    expect(screen.getByText('Confirm deletion')).toBeInTheDocument();
    expect(
      screen.getByText(/Are you sure you want to delete/)
    ).toBeInTheDocument();
    expect(screen.getByText('5 videos')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    const onOpenChange = vi.fn();
    render(
      <DeleteVideosDialog open={false} onOpenChange={onOpenChange} />
    );

    expect(screen.queryByText('Confirm deletion')).not.toBeInTheDocument();
  });

  it('should show singular form for one video', () => {
    vi.mocked(require('@/hooks').useVideoSelection).mockReturnValue({
      selectedVideosCount: 1,
      deleteSelectedVideos: mockDeleteSelectedVideos,
      isDeleting: false,
    });

    const onOpenChange = vi.fn();
    render(
      <DeleteVideosDialog open={true} onOpenChange={onOpenChange} />
    );

    expect(screen.getByText('1 video')).toBeInTheDocument();
  });

  it('should call onOpenChange when cancel is clicked', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <DeleteVideosDialog open={true} onOpenChange={onOpenChange} />
    );

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should call deleteSelectedVideos and close when confirm is clicked', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    mockDeleteSelectedVideos.mockResolvedValue(undefined);

    render(
      <DeleteVideosDialog open={true} onOpenChange={onOpenChange} />
    );

    const deleteButton = screen.getByText('Delete videos');
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockDeleteSelectedVideos).toHaveBeenCalled();
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('should disable buttons when deleting', () => {
    vi.mocked(require('@/hooks').useVideoSelection).mockReturnValue({
      selectedVideosCount: 5,
      deleteSelectedVideos: mockDeleteSelectedVideos,
      isDeleting: true,
    });

    const onOpenChange = vi.fn();
    render(
      <DeleteVideosDialog open={true} onOpenChange={onOpenChange} />
    );

    expect(screen.getByText('Deleting...')).toBeInTheDocument();
    const cancelButton = screen.getByText('Cancel');
    expect(cancelButton).toBeDisabled();
  });
});

