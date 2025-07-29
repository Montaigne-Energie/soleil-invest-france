import { useState, useEffect, useRef, useCallback } from 'react';

interface UseInactivityTimerProps {
  timeout: number; // en millisecondes
  onTimeout: () => void;
  onWarning?: () => void;
  warningTime?: number; // temps avant le timeout pour afficher l'avertissement
}

export const useInactivityTimer = ({ 
  timeout, 
  onTimeout, 
  onWarning, 
  warningTime = 30000 // 30 secondes avant timeout par défaut
}: UseInactivityTimerProps) => {
  const [isIdle, setIsIdle] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningTimeoutRef = useRef<NodeJS.Timeout>();

  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

  const resetTimer = useCallback(() => {
    setIsIdle(false);
    setShowWarning(false);
    
    // Nettoyer les timers existants
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Définir le timer d'avertissement
    if (onWarning && warningTime > 0) {
      warningTimeoutRef.current = setTimeout(() => {
        setShowWarning(true);
        onWarning();
      }, timeout - warningTime);
    }

    // Définir le timer de timeout
    timeoutRef.current = setTimeout(() => {
      setIsIdle(true);
      onTimeout();
    }, timeout);
  }, [timeout, onTimeout, onWarning, warningTime]);

  const extendSession = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    // Démarrer le timer au montage
    resetTimer();

    // Écouter les événements d'activité
    const handleActivity = () => {
      if (!showWarning) {
        resetTimer();
      }
    };

    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    // Nettoyer au démontage
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [resetTimer, showWarning]);

  return {
    isIdle,
    showWarning,
    resetTimer,
    extendSession
  };
};