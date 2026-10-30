import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { MessageSquare, Loader2, CheckCircle2 } from 'lucide-react';
import { handleApiError } from '@/utils';

interface FeedbackDialogProps {
  trigger?: React.ReactNode;
}

export function FeedbackDialog({ trigger }: FeedbackDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { postSuggestion } = await import('@/services/suggestions');
      const result = await postSuggestion(title, message);

      if (result.success && result.data) {
        setIsSuccess(true);
        setTitle('');
        setMessage('');
        // Close dialog after 2 seconds
        setTimeout(() => {
          setIsOpen(false);
          setIsSuccess(false);
        }, 2000);
      } else {
        throw new Error(
          result.error ? 'Failed to submit suggestion' : 'Unknown error'
        );
      }
    } catch (error) {
      handleApiError(error, 'Failed to send suggestion');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!isSubmitting) {
      setIsOpen(open);
      if (!open) {
        // Reset form when dialog closes
        setTimeout(() => {
          setTitle('');
          setMessage('');
          setIsSuccess(false);
        }, 300);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            aria-label="Send suggestion"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Send suggestion</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Send Suggestion
          </DialogTitle>
          <DialogDescription>
            Share your ideas, comments, or report issues. Your feedback helps us
            improve.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <p className="text-center text-sm font-medium">
              Thank you! Your suggestion has been sent.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="feedback-title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="feedback-title"
                placeholder="e.g., Improve video selection"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="feedback-message" className="text-sm font-medium">
                Message
              </label>
              <Textarea
                id="feedback-message"
                placeholder="Describe your suggestion, comment, or issue in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isSubmitting}
                required
                rows={6}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !title.trim() || !message.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
