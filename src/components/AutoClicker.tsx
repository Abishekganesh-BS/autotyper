import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MousePointer2, Timer, Infinity as InfinityIcon, Target } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { saveSettings } from "@/lib/settings";
import { logError } from "@/lib/logger";

interface AutoClickerProps {
    delay: number;
    setDelay: (val: number) => void;
    button: string;
    setButton: (val: string) => void;
    limit: number;
    setLimit: (val: number) => void;
    isUnlimited: boolean;
    setMode: (unlimited: boolean) => void;
    isActive: boolean;
}

export function AutoClicker({
    delay, setDelay,
    button, setButton,
    limit, setLimit,
    isUnlimited, setMode,
    isActive
}: AutoClickerProps) {

    const syncWithBackend = async (d: number, b: string, l: number, u: boolean) => {
        try {
            await invoke("sync_click_settings", {
                settings: { delay_ms: d, button: b, repeat_limit: l, is_unlimited: u }
            });
        } catch (err) {
            logError(String(err), "AutoClicker:syncWithBackend");
        }
    };

    const handleDelayChange = async (val: string) => {
        try {
            const num = Math.max(1, parseInt(val) || 0);
            setDelay(num);
            saveSettings({ delay_ms: num });
            await syncWithBackend(num, button, limit, isUnlimited);
        } catch (err) {
            logError(String(err), "AutoClicker:handleDelayChange");
        }
    };

    const handleButtonChange = async (val: string) => {
        try {
            setButton(val);
            saveSettings({ clickButton: val });
            await syncWithBackend(delay, val, limit, isUnlimited);
        } catch (err) {
            logError(String(err), "AutoClicker:handleButtonChange");
        }
    };

    const handleLimitChange = async (val: string) => {
        try {
            const num = Math.max(1, parseInt(val) || 0);
            setLimit(num);
            saveSettings({ clickRepeatLimit: num });
            await syncWithBackend(delay, button, num, isUnlimited);
        } catch (err) {
            logError(String(err), "AutoClicker:handleLimitChange");
        }
    };

    const handleModeChange = async (unlimited: boolean) => {
        try {
            setMode(unlimited);
            saveSettings({ clickIsUnlimited: unlimited });
            await syncWithBackend(delay, button, limit, unlimited);
        } catch (err) {
            logError(String(err), "AutoClicker:handleModeChange");
        }
    };

    return (
        <Card className="glass-card overflow-hidden">
            <CardHeader className="bg-secondary/20 pb-8 border-b border-border">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-2xl font-black tracking-tight text-foreground">
                            <MousePointer2 className="h-6 w-6 text-primary" />
                            AUTO <span className="text-primary">CLICKER</span>
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">Precision input simulation.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-8 pt-8 px-8">
                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            <Timer className="h-3.5 w-3.5 text-primary" />
                            Delay Time (ms)
                        </Label>
                        <Input
                            type="number"
                            value={delay}
                            onChange={(e) => handleDelayChange(e.target.value)}
                            className="h-12 text-lg font-mono bg-secondary/30 border-none text-foreground"
                        />
                    </div>

                    <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            <MousePointer2 className="h-3.5 w-3.5 text-primary" />
                            Mouse Button
                        </Label>
                        <Select value={button} onValueChange={handleButtonChange}>
                            <SelectTrigger className="w-full h-12 text-lg bg-secondary/30 border-none text-foreground">
                                <SelectValue placeholder="Select Button" />
                            </SelectTrigger>
                            <SelectContent className="glass-card">
                                <SelectItem value="left">Left Click</SelectItem>
                                <SelectItem value="right">Right Click</SelectItem>
                                <SelectItem value="middle">Middle Click</SelectItem>
                            </SelectContent>
                        </Select>
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
                                placeholder="Total clicks..."
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
                            <span className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-70">clicker standby</span>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
