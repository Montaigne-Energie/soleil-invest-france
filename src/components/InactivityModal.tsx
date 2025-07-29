import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, LogOut } from "lucide-react";

interface InactivityModalProps {
  isOpen: boolean;
  onContinue: () => void;
  onLogout: () => void;
  countdown?: number; // temps en secondes avant déconnexion automatique
}

export const InactivityModal = ({ 
  isOpen, 
  onContinue, 
  onLogout, 
  countdown = 30 
}: InactivityModalProps) => {
  const [timeLeft, setTimeLeft] = useState(countdown);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(countdown);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, countdown, onLogout]);

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(countdown);
    }
  }, [isOpen, countdown]);

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            Session inactive
          </DialogTitle>
          <DialogDescription>
            Votre session sera automatiquement fermée dans <strong>{timeLeft} secondes</strong> par mesure de sécurité.
            <br />
            <br />
            Souhaitez-vous continuer votre session ou vous déconnecter ?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={onLogout}
            className="w-full sm:w-auto"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Se déconnecter
          </Button>
          <Button 
            onClick={onContinue}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90"
          >
            Continuer la session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};