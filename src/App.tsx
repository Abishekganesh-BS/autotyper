import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AutoClicker } from "./components/AutoClicker";
import { AutoTyper } from "./components/AutoTyper";
import { MousePointer2, Keyboard, Laptop, Settings as SettingsIcon, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { loadSettings, saveSettings } from "@/lib/settings";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { HotkeyRecorder } from "./components/HotkeyRecorder";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

function App() {
  const [activeTab, setActiveTab] = useState("clicker");
  const [clickHotkey, setClickHotkey] = useState("F6");
  const [typeHotkey, setTypeHotkey] = useState("F7");

  // Hoisted Clicker State
  const [clickDelay, setClickDelay] = useState(100);
  const [clickButton, setClickButton] = useState("left");
  const [clickLimit, setClickLimit] = useState(10);
  const [clickIsUnlimited, setClickIsUnlimited] = useState(true);
  const [clickIsActive, setClickIsActive] = useState(false);

  // Hoisted Typer State
  const [typerText, setTyperText] = useState("");
  const [typerInterval, setTyperInterval] = useState(1000);
  const [typerPressEnter, setTyperPressEnter] = useState(true);
  const [typerLimit, setTyperLimit] = useState(10);
  const [typerIsUnlimited, setTyperIsUnlimited] = useState(true);
  const [typerIsActive, setTyperIsActive] = useState(false);

  useEffect(() => {
    loadSettings().then(s => {
      setClickHotkey(s.clickHotkey);
      setTypeHotkey(s.typeHotkey);

      // Load feature settings
      setClickDelay(s.delay_ms);
      setClickButton(s.clickButton);
      setClickLimit(s.clickRepeatLimit);
      setClickIsUnlimited(s.clickIsUnlimited);

      setTyperText(s.typerText);
      setTyperInterval(s.typerInterval);
      setTyperPressEnter(s.autoEnter);
      setTyperLimit(s.typeRepeatLimit);
      setTyperIsUnlimited(s.typeIsUnlimited);

      // Initial Sync with Backend
      invoke("sync_click_settings", {
        settings: { delay_ms: s.delay_ms, button: s.clickButton, repeat_limit: s.clickRepeatLimit, is_unlimited: s.clickIsUnlimited }
      }).catch(console.error);

      invoke("sync_type_settings", {
        settings: { text: s.typerText, interval_ms: s.typerInterval, press_enter: s.autoEnter, repeat_limit: s.typeRepeatLimit, is_unlimited: s.typeIsUnlimited }
      }).catch(console.error);

      invoke("update_hotkeys", { clickKey: s.clickHotkey, typeKey: s.typeHotkey }).catch(console.error);
    });

    // Listen for backend events
    const unlistenClickStarted = listen("clicker-started", () => setClickIsActive(true));
    const unlistenClickStopped = listen("clicker-stopped", () => setClickIsActive(false));
    const unlistenTypeStarted = listen("typer-started", () => setTyperIsActive(true));
    const unlistenTypeStopped = listen("typer-stopped", () => setTyperIsActive(false));

    return () => {
      unlistenClickStarted.then(u => u());
      unlistenClickStopped.then(u => u());
      unlistenTypeStarted.then(u => u());
      unlistenTypeStopped.then(u => u());
    };
  }, []);

  // Enforce light mode on root
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.add("light");
    root.classList.remove("dark");
  }, []);

  const handleHotkeyChange = (type: 'click' | 'type', key: string) => {
    if (type === 'click') {
      setClickHotkey(key);
      saveSettings({ clickHotkey: key });
      invoke("update_hotkeys", { clickKey: key, typeKey: typeHotkey }).catch(console.error);
    } else {
      setTypeHotkey(key);
      saveSettings({ typeHotkey: key });
      invoke("update_hotkeys", { clickKey: clickHotkey, typeKey: key }).catch(console.error);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 selection:bg-primary/20 relative">
      <header className="sticky top-0 z-50 w-full glass-header">
        <div className="container flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
              <Laptop className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-black tracking-tighter text-foreground">
              AUTO <span className="text-primary">CT</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-secondary/80">
                  <HelpCircle className="h-5 w-5 text-muted-foreground" />
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-window max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black flex items-center gap-2">
                    <HelpCircle className="h-6 w-6 text-primary" />
                    USER GUIDE
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground pt-2">
                    Quick instructions to get you started with Auto CT.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 pt-6">
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-primary">How to Use</h3>
                    <ul className="space-y-4">
                      <li className="flex gap-4">
                        <div className="flex-none h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">1</div>
                        <p className="text-sm leading-relaxed">Configure your desired settings in the Clicker or Typer tab.</p>
                      </li>
                      <li className="flex gap-4">
                        <div className="flex-none h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">2</div>
                        <p className="text-sm leading-relaxed">Place your mouse cursor exactly where you want the action to happen.</p>
                      </li>
                      <li className="flex gap-4">
                        <div className="flex-none h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">3</div>
                        <p className="text-sm leading-relaxed">Press the global hotkey (<span className="font-mono font-bold text-primary">{clickHotkey}</span> for Clicker, <span className="font-mono font-bold text-primary">{typeHotkey}</span> for Typer) to start or stop the tool.</p>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3 pt-2">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Changing Settings</h3>
                    <p className="text-sm leading-relaxed opacity-80">Click the gear icon next to this help button to open the settings menu. You can record new hotkeys by clicking the recorder button and pressing any key from F1 to F12.</p>
                  </div>
                </div>
                <div className="bg-secondary/20 p-4 border-t border-border text-center mt-6">
                  <p className="text-[10px] font-black tracking-[0.3em] uppercase opacity-30 text-foreground">Version V0.1</p>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-secondary/80">
                  <SettingsIcon className="h-5 w-5 text-muted-foreground" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden glass-window border-border shadow-2xl">
                <div className="bg-secondary/40 px-6 py-6 border-b border-border">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-black text-foreground uppercase tracking-tight">Application Settings</DialogTitle>
                    <DialogDescription className="text-muted-foreground/80 font-bold uppercase text-[10px] tracking-widest">
                      Customize behavior and interface.
                    </DialogDescription>
                  </DialogHeader>
                </div>
                <div className="p-6 space-y-8">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Global Hotkeys</Label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl transition-all border border-transparent hover:border-border">
                        <div className="space-y-1">
                          <p className="text-sm font-bold uppercase tracking-tight text-foreground">Auto Clicker</p>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Start / Stop Toggle</p>
                        </div>
                        <HotkeyRecorder initialValue={clickHotkey} onSave={(val) => handleHotkeyChange('click', val)} />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl transition-all border border-transparent hover:border-border">
                        <div className="space-y-1">
                          <p className="text-sm font-bold uppercase tracking-tight text-foreground">Auto Typer</p>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Start / Stop Toggle</p>
                        </div>
                        <HotkeyRecorder initialValue={typeHotkey} onSave={(val) => handleHotkeyChange('type', val)} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-secondary/20 p-4 border-t border-border text-center">
                  <p className="text-[10px] font-black tracking-[0.3em] uppercase opacity-30 text-foreground">v0.1.0</p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-12 px-6 max-w-5xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-12">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-[420px] grid-cols-2 p-1.5 h-16 bg-secondary/40 backdrop-blur-3xl border border-border shadow-xl rounded-2xl">
              <TabsTrigger value="clicker" className="rounded-xl gap-2 h-full transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md border border-transparent data-[state=active]:border-black/5">
                <MousePointer2 className="h-4 w-4" />
                <span className="text-xs font-black uppercase tracking-widest">Clicker</span>
              </TabsTrigger>
              <TabsTrigger value="typer" className="rounded-xl gap-2 h-full transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md border border-transparent data-[state=active]:border-black/5">
                <Keyboard className="h-4 w-4" />
                <span className="text-xs font-black uppercase tracking-widest">Typer</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <TabsContent value="clicker" className="mt-0 focus-visible:outline-none">
                <div className="max-w-xl mx-auto">
                  <AutoClicker
                    delay={clickDelay} setDelay={setClickDelay}
                    button={clickButton} setButton={setClickButton}
                    limit={clickLimit} setLimit={setClickLimit}
                    isUnlimited={clickIsUnlimited} setMode={setClickIsUnlimited}
                    isActive={clickIsActive}
                  />
                </div>
              </TabsContent>
              <TabsContent value="typer" className="mt-0 focus-visible:outline-none">
                <div className="max-w-2xl mx-auto">
                  <AutoTyper
                    text={typerText} setText={setTyperText}
                    interval={typerInterval} setIntervalVal={setTyperInterval}
                    pressEnter={typerPressEnter} setPressEnter={setTyperPressEnter}
                    limit={typerLimit} setLimit={setTyperLimit}
                    isUnlimited={typerIsUnlimited} setMode={setTyperIsUnlimited}
                    isActive={typerIsActive}
                  />
                </div>
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </main>

      <footer className="py-8 mt-auto border-t border-border">
        <div className="container text-center flex flex-col items-center gap-2">
          <p className="text-[10px] font-black tracking-[0.4em] uppercase opacity-30 text-foreground">Auto CT &bull; All rights are reserved &copy; 2026</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
