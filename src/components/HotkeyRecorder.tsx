import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Keyboard } from "lucide-react";

interface HotkeyRecorderProps {
    initialValue: string;
    onSave: (hotkey: string) => void;
}

export function HotkeyRecorder({ initialValue, onSave }: HotkeyRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [currentHotkey, setCurrentHotkey] = useState(initialValue);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isRecording) return;
            e.preventDefault();
            e.stopPropagation();

            // We only care about specific keys for now: F1-F12, or Alphanumeric with modifiers
            // But for simplicity and based on user request (F6/F7), let's support any key.

            let key = e.key;

            // Handle special naming to match Tauri/Enigo if needed, 
            // but tauri_plugin_global_shortcut uses standard Code or simple strings.
            // We'll use a simple approach: if it's a function key, use it.
            if (key.startsWith('F') && key.length > 1) {
                // F1-F12
            } else if (key === 'Escape') {
                setIsRecording(false);
                return;
            }

            setCurrentHotkey(key);
            onSave(key);
            setIsRecording(false);
        };

        if (isRecording) {
            window.addEventListener('keydown', handleKeyDown, true);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown, true);
        };
    }, [isRecording, onSave]);

    return (
        <Button
            ref={buttonRef}
            variant="outline"
            size="sm"
            className={`h-9 min-w-[100px] font-mono transition-all relative ${isRecording ? 'bg-primary/20 border-primary animate-pulse ring-2 ring-primary/50 text-primary' : 'bg-secondary border-border'}`}
            onClick={() => setIsRecording(true)}
        >
            <Keyboard className="h-3.5 w-3.5 mr-2" />
            <span className="truncate">
                {isRecording ? 'Press F1-F12' : currentHotkey}
            </span>
        </Button>
    );
}
