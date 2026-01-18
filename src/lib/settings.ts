import { load } from "@tauri-apps/plugin-store";

export interface AppSettings {
    delay_ms: number;
    clickButton: string;
    clickRepeatLimit: number;
    clickIsUnlimited: boolean;
    clickHotkey: string;
    typerText: string;
    typerInterval: number;
    typeRepeatLimit: number;
    typeIsUnlimited: boolean;
    typeHotkey: string;
    autoEnter: boolean;
    theme: "system" | "light" | "dark";
}

const DEFAULT_SETTINGS: AppSettings = {
    delay_ms: 100,
    clickButton: "left",
    clickRepeatLimit: 10,
    clickIsUnlimited: true,
    clickHotkey: "F6",
    typerText: "",
    typerInterval: 1000,
    typeRepeatLimit: 10,
    typeIsUnlimited: true,
    typeHotkey: "F7",
    autoEnter: true,
    theme: "system",
};

export async function saveSettings(settings: Partial<AppSettings>) {
    try {
        const store = await load("settings.json", { autoSave: true, defaults: {} });
        for (const [key, value] of Object.entries(settings)) {
            if (value !== undefined) {
                await store.set(key, value);
            }
        }
        await store.save(); // Explicit save to be safe
    } catch (e) {
        console.error("Failed to save settings:", e);
    }
}

export async function loadSettings(): Promise<AppSettings> {
    try {
        const store = await load("settings.json", { autoSave: true, defaults: {} });
        const settings = { ...DEFAULT_SETTINGS };

        const delay_ms = await store.get<number>("delay_ms");
        if (delay_ms !== undefined && delay_ms !== null) settings.delay_ms = delay_ms;

        const clickButton = await store.get<string>("clickButton");
        if (clickButton !== undefined && clickButton !== null) settings.clickButton = clickButton;

        const clickRepeatLimit = await store.get<number>("clickRepeatLimit");
        if (clickRepeatLimit !== undefined && clickRepeatLimit !== null) settings.clickRepeatLimit = clickRepeatLimit;

        const clickIsUnlimited = await store.get<boolean>("clickIsUnlimited");
        if (clickIsUnlimited !== undefined && clickIsUnlimited !== null) settings.clickIsUnlimited = clickIsUnlimited;

        const clickHotkey = await store.get<string>("clickHotkey");
        if (clickHotkey !== undefined && clickHotkey !== null) settings.clickHotkey = clickHotkey;

        const typerText = await store.get<string>("typerText");
        if (typerText !== undefined && typerText !== null) settings.typerText = typerText;

        const typerInterval = await store.get<number>("typerInterval");
        if (typerInterval !== undefined && typerInterval !== null) settings.typerInterval = typerInterval;

        const typeRepeatLimit = await store.get<number>("typeRepeatLimit");
        if (typeRepeatLimit !== undefined && typeRepeatLimit !== null) settings.typeRepeatLimit = typeRepeatLimit;

        const typeIsUnlimited = await store.get<boolean>("typeIsUnlimited");
        if (typeIsUnlimited !== undefined && typeIsUnlimited !== null) settings.typeIsUnlimited = typeIsUnlimited;

        const typeHotkey = await store.get<string>("typeHotkey");
        if (typeHotkey !== undefined && typeHotkey !== null) settings.typeHotkey = typeHotkey;

        const autoEnter = await store.get<boolean>("autoEnter");
        if (autoEnter !== undefined && autoEnter !== null) settings.autoEnter = autoEnter;

        const theme = await store.get<string>("theme");
        if (theme === "system" || theme === "light" || theme === "dark") settings.theme = theme as "system" | "light" | "dark";

        return settings;
    } catch (e) {
        console.error("Failed to load settings:", e);
        return DEFAULT_SETTINGS;
    }
}
