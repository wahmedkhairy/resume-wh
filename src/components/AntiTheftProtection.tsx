
import React, { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface AntiTheftProtectionProps {
  isActive: boolean;
  userId?: string;
  sessionId?: string;
}

const AntiTheftProtection: React.FC<AntiTheftProtectionProps> = ({ 
  isActive, 
  userId = "guest", 
  sessionId = "demo" 
}) => {
  const { toast } = useToast();

  useEffect(() => {
    if (!isActive) return;

    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast({
        title: "Protected Content",
        description: "Right-click is disabled to protect content.",
        variant: "destructive",
      });
      return false;
    };

    // Disable common keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S, Ctrl+P, Print Screen
      if (
        e.key === "F12" ||
        e.key === "PrintScreen" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J")) ||
        (e.ctrlKey && (e.key === "u" || e.key === "U")) ||
        (e.ctrlKey && (e.key === "s" || e.key === "S")) ||
        (e.ctrlKey && (e.key === "p" || e.key === "P")) ||
        (e.ctrlKey && e.shiftKey && (e.key === "C" || e.key === "c")) ||
        (e.altKey && e.key === "Tab") ||
        (e.metaKey && e.shiftKey && (e.key === "3" || e.key === "4" || e.key === "5"))
      ) {
        e.preventDefault();
        toast({
          title: "Action Blocked",
          description: "This action is disabled to protect content.",
          variant: "destructive",
        });
        return false;
      }
    };

    // Disable text selection
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // Detect screenshot attempts and visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log("Potential screenshot attempt detected");
        toast({
          title: "Activity Detected",
          description: "Screen capture attempt detected. Content is protected.",
          variant: "destructive",
        });
      }
    };

    // Disable drag and drop
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // Block copy operations
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      toast({
        title: "Copy Blocked",
        description: "Copying content is disabled for protection.",
        variant: "destructive",
      });
      return false;
    };

    // Add event listeners
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("selectstart", handleSelectStart);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("dragstart", handleDragStart);
    document.addEventListener("copy", handleCopy);

    // Add CSS to disable text selection and drag
    const style = document.createElement("style");
    style.textContent = `
      .resume-container {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
        -webkit-tap-highlight-color: transparent !important;
        pointer-events: auto !important;
        -webkit-user-drag: none !important;
        -khtml-user-drag: none !important;
        -moz-user-drag: none !important;
        -o-user-drag: none !important;
        user-drag: none !important;
      }
      
      .resume-container * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
        -webkit-user-drag: none !important;
        -khtml-user-drag: none !important;
        -moz-user-drag: none !important;
        -o-user-drag: none !important;
        user-drag: none !important;
      }
      
      .watermark {
        pointer-events: none !important;
        position: absolute !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) rotate(45deg) !important;
        font-size: 4rem !important;
        color: rgba(0, 0, 0, 0.1) !important;
        z-index: 1000 !important;
        font-weight: bold !important;
        text-transform: uppercase !important;
      }

      /* Additional protection styles */
      .resume-container::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: transparent;
        z-index: 999;
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);

    // Cleanup function
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("selectstart", handleSelectStart);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("dragstart", handleDragStart);
      document.removeEventListener("copy", handleCopy);
      document.head.removeChild(style);
    };
  }, [isActive, toast]);

  if (!isActive) return null;

  return (
    <div className="watermark">
      {userId !== "guest" ? `USER: ${userId}` : `SESSION: ${sessionId}`}
    </div>
  );
};

export default AntiTheftProtection;
