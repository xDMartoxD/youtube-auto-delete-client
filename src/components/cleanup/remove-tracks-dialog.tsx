import { Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { pluralize } from '@/utils';

interface RemoveTracksDialogProps {
  open: boolean;
  count: number;
  playlistName: string;
  isRemoving: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function RemoveTracksDialog({
  open,
  count,
  playlistName,
  isRemoving,
  onOpenChange,
  onConfirm,
}: RemoveTracksDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove {pluralize(count, 'track')}?</DialogTitle>
          <DialogDescription>
            They will be removed from “{playlistName}”. The songs stay available
            in the service, but this can’t be undone from here.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isRemoving}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isRemoving}
          >
            {isRemoving ? <Loader2 className="animate-spin" /> : <Trash2 />}
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
