import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";

interface BookingModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookingModal({ isOpen, onOpenChange }: BookingModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] w-[95vw] h-[80vh] p-0 overflow-hidden bg-white border-0">
        <DialogTitle className="sr-only">Schedule Strategy Call</DialogTitle>
        <DialogDescription className="sr-only">
          Book a strategy call with BKT Advisory using Calendly
        </DialogDescription>
        <iframe 
          src="https://calendly.com/bktadvisory-john-burkhardt" 
          style={{ border: 0, width: '100%', height: '100%' }} 
          frameBorder="0"
          title="Book Strategy Call"
        />
      </DialogContent>
    </Dialog>
  );
}