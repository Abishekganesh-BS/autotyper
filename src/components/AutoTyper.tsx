import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Keyboard, Timer, Infinity as InfinityIcon, Target, SendHorizontal } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { saveSettings } from "@/lib/settings";
import { logError } from "@/lib/logger";

interface AutoTyperProps {
    text: string;
    setText: (val: string) => void;
    interval: number;
    setIntervalVal: (val: number) => void;
    pressEnter: boolean;
    setPressEnter: (val: boolean) => void;
    limit: number;
    setLimit: (val: number) => void;
    isUnlimited: boolean;
    setMode: (unlimited: boolean) => void;
    isActive: boolean;
}

export function AutoTyper({
    text, setText,
    interval, setIntervalVal,
    pressEnter, setPressEnter,
    limit, setLimit,
    isUnlimited, setMode,
    isActive
}: AutoTyperProps) {

    const syncWithBackend = async (t: string, i: number, e: boolean, l: number, u: boolean) => {
        try {
            await invoke("sync_type_settings", {
                settings: { text: t, interval_ms: i, press_enter: e, repeat_limit: l, is_unlimited: u }
            });
        } catch (err) {
            logError(String(err), "AutoTyper:syncWithBackend");
        }
    };

    const handleTextChange = async (val: string) => {
        try {
            setText(val);
            saveSettings({ typerText: val });
            await syncWithBackend(val, interval, pressEnter, limit, isUnlimited);
        } catch (err) {
            logError(String(err), "AutoTyper:handleTextChange");
        }
    };

    const handleIntervalChange = async (val: string) => {
        try {
            const num = Math.max(1, parseInt(val) || 0);
            setIntervalVal(num);
            saveSettings({ typerInterval: num });
            await syncWithBackend(text, num, pressEnter, limit, isUnlimited);
        } catch (err) {
            logError(String(err), "AutoTyper:handleIntervalChange");
        }
    };

    const handleEnterToggle = async (checked: boolean) => {
        try {
            setPressEnter(checked);
            saveSettings({ autoEnter: checked });
            await syncWithBackend(text, interval, checked, limit, isUnlimited);
        } catch (err) {
            logError(String(err), "AutoTyper:handleEnterToggle");
        }
    };

    const handleLimitChange = async (val: string) => {
        try {
            const num = Math.max(1, parseInt(val) || 0);
            setLimit(num);
            saveSettings({ typeRepeatLimit: num });
            await syncWithBackend(text, interval, pressEnter, num, isUnlimited);
        } catch (err) {
            logError(String(err), "AutoTyper:handleLimitChange");
        }
    };

    const handleModeChange = async (unlimited: boolean) => {
        try {
            setMode(unlimited);
            saveSettings({ typeIsUnlimited: unlimited });
            await syncWithBackend(text, interval, pressEnter, limit, unlimited);
        } catch (err) {
            logError(String(err), "AutoTyper:handleModeChange");
        }
    };

    return (
        <Card className="glass-card overflow-hidden">
            <CardHeader className="bg-secondary/20 pb-8 border-b border-border">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-2xl font-black tracking-tight text-foreground">
                            <Keyboard className="h-6 w-6 text-primary" />
                            AUTO <span className="text-primary">TYPER</span>
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">Rapid text sequence automation.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-8 pt-8 px-8">
                <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        <SendHorizontal className="h-3.5 w-3.5 text-primary" />
                        Text to Type
                    </Label>
                    <Input
                        value={text}
                        onChange={(e) => handleTextChange(e.target.value)}
                        placeholder="Enter text to automate..."
                        className="h-12 bg-secondary/30 border-none text-foreground placeholder:text-muted-foreground/50"
                    />
                </div>

                <div className="grid grid-cols-2 gap-8 items-end">
                    <div className="space-y-4">
                        <Label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            <Timer className="h-3.5 w-3.5 text-primary" />
                            Interval (ms)
                        </Label>
                        <Input
                            type="number"
                            value={interval}
                            onChange={(e) => handleIntervalChange(e.target.value)}
                            className="h-12 text-lg font-mono bg-secondary/30 border-none text-foreground"
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl border border-transparent h-12">
                        <Label htmlFor="auto-enter" className="text-[10px] font-black uppercase tracking-widest cursor-pointer">Auto Enter</Label>
                        <Switch
                            id="auto-enter"
                            checked={pressEnter}
                            onCheckedChange={handleEnterToggle}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <Label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Operational Mode
                    </Label>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-secondary/20 rounded-2xl border border-border">
                        <Button
                            variant={isUnlimited ? "default" : "ghost"}
                            className={`rounded-xl gap-2 h-11 transition-all ${isUnlimited ? 'bg-primary/90 text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary/40'}`}
                            onClick={() => handleModeChange(true)}
                        >
                            <InfinityIcon className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Unlimited</span>
                        </Button>
                        <Button
                            variant={!isUnlimited ? "default" : "ghost"}
                            className={`rounded-xl gap-2 h-11 transition-all ${!isUnlimited ? 'bg-primary/90 text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary/40'}`}
                            onClick={() => handleModeChange(false)}
                        >
                            <Target className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Limited</span>
                        </Button>
                    </div>

                    {!isUnlimited && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300 pt-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Repeat Limit</Label>
                            <Input
                                type="number"
                                value={limit}
                                onChange={(e) => handleLimitChange(e.target.value)}
                                className="h-12 text-lg font-mono bg-secondary/30 border-none text-foreground"
                                placeholder="Total repetitions..."
                            />
                        </div>
                    )}
                </div>

                <div className="pt-4">
                    <div className={`flex items-center gap-3 justify-center py-4 rounded-2xl border transition-all duration-700 ${isActive ? 'bg-primary/10 border-primary/20 shadow-sm' : 'bg-secondary/10 border-border text-muted-foreground'}`}>
                        {isActive ? (
                            <>
                                <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
                                <span className="font-black tracking-widest uppercase text-xs text-foreground">SYSTEM ACTIVE</span>
                            </>
                        ) : (
                            <span className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-70">typer standby</span>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
