use enigo::{Button, Direction, Enigo, Key, Keyboard, Mouse, Settings};
use std::sync::Mutex;
use std::fs::OpenOptions;
use std::io::Write;
use chrono::Local;
use tauri::{Emitter, Manager, State, async_runtime::JoinHandle};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, Code, ShortcutState};
use serde::{Deserialize, Serialize};

#[derive(Default)]
struct AppState {
    clicker_handle: Mutex<Option<JoinHandle<()>>>,
    typer_handle: Mutex<Option<JoinHandle<()>>>,
    click_settings: Mutex<ClickSettings>,
    type_settings: Mutex<TypeSettings>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct ClickSettings {
    pub delay_ms: u64,
    pub button: String,
    pub repeat_limit: u64,
    pub is_unlimited: bool,
}

impl Default for ClickSettings {
    fn default() -> Self {
        Self { 
            delay_ms: 100, 
            button: "left".to_string(), 
            repeat_limit: 10,
            is_unlimited: true
        }
    }
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct TypeSettings {
    pub text: String,
    pub interval_ms: u64,
    pub press_enter: bool,
    pub repeat_limit: u64,
    pub is_unlimited: bool,
}

impl Default for TypeSettings {
    fn default() -> Self {
        Self { 
            text: "".to_string(), 
            interval_ms: 1000, 
            press_enter: true, 
            repeat_limit: 10,
            is_unlimited: true
        }
    }
}

fn log_to_file(message: &str) {
    if let Ok(mut file) = OpenOptions::new()
        .create(true)
        .append(true)
        .open("logs.txt")
    {
        let now = Local::now().format("%Y-%m-%d %H:%M:%S");
        let _ = writeln!(file, "[{}] {}", now, message);
    }
}

#[tauri::command]
fn log_error_to_file(message: String) {
    log_to_file(&format!("[Frontend] {}", message));
}

fn parse_code(hotkey: &str) -> Option<Code> {
    if let Some(num_str) = hotkey.strip_prefix('F') {
        if let Ok(num) = num_str.parse::<u8>() {
            return match num {
                1 => Some(Code::F1), 2 => Some(Code::F2), 3 => Some(Code::F3), 4 => Some(Code::F4),
                5 => Some(Code::F5), 6 => Some(Code::F6), 7 => Some(Code::F7), 8 => Some(Code::F8),
                9 => Some(Code::F9), 10 => Some(Code::F10), 11 => Some(Code::F11), 12 => Some(Code::F12),
                _ => None,
            };
        }
    }
    None
}

#[tauri::command]
async fn start_clicker(settings: ClickSettings, state: State<'_, AppState>, app: tauri::AppHandle) -> Result<(), String> {
    let mut handle = state.clicker_handle.lock().map_err(|e| {
        let err = format!("Failed to lock clicker handle: {}", e);
        log_to_file(&err);
        err
    })?;
    
    if let Some(h) = handle.take() { h.abort(); }
    
    let delay = settings.delay_ms.max(1);
    let limit = if settings.is_unlimited { 0 } else { settings.repeat_limit };
    let button = match settings.button.as_str() { "right" => Button::Right, "middle" => Button::Middle, _ => Button::Left };
    
    let app_clone = app.clone();
    let new_handle = tauri::async_runtime::spawn(async move {
        let enigo = Enigo::new(&Settings::default()).ok();
        if let Some(mut e) = enigo {
            let mut count = 0;
            loop {
                if let Err(err) = e.button(button, Direction::Click) {
                    log_to_file(&format!("Click error: {:?}", err));
                    break;
                }
                count += 1;
                if limit > 0 && count >= limit { 
                    let _ = app_clone.emit("clicker-stopped", ()); 
                    break; 
                }
                tokio::time::sleep(tokio::time::Duration::from_millis(delay)).await;
            }
        } else {
            log_to_file("Failed to initialize Enigo for clicker");
        }
    });
    *handle = Some(new_handle);
    let _ = app.emit("clicker-started", ());
    Ok(())
}

#[tauri::command]
async fn stop_clicker(state: State<'_, AppState>, app: tauri::AppHandle) -> Result<(), String> {
    let mut handle = state.clicker_handle.lock().map_err(|e| format!("Lock error: {}", e))?;
    if let Some(h) = handle.take() { h.abort(); }
    let _ = app.emit("clicker-stopped", ());
    Ok(())
}

#[tauri::command]
async fn start_typer(settings: TypeSettings, state: State<'_, AppState>, app: tauri::AppHandle) -> Result<(), String> {
    let mut handle = state.typer_handle.lock().map_err(|e| format!("Lock error: {}", e))?;
    if let Some(h) = handle.take() { h.abort(); }
    
    let payload = settings.text.clone();
    let interval = settings.interval_ms.max(1);
    let press_enter = settings.press_enter;
    let limit = if settings.is_unlimited { 0 } else { settings.repeat_limit };
    
    let app_clone = app.clone();
    let new_handle = tauri::async_runtime::spawn(async move {
        let enigo = Enigo::new(&Settings::default()).ok();
        if let Some(mut e) = enigo {
            let mut count = 0;
            loop {
                if let Err(err) = e.text(&payload) {
                    log_to_file(&format!("Type error: {:?}", err));
                    break;
                }
                if press_enter { let _ = e.key(Key::Return, Direction::Click); }
                count += 1;
                if limit > 0 && count >= limit { 
                    let _ = app_clone.emit("typer-stopped", ()); 
                    break; 
                }
                tokio::time::sleep(tokio::time::Duration::from_millis(interval)).await;
            }
        } else {
            log_to_file("Failed to initialize Enigo for typer");
        }
    });
    *handle = Some(new_handle);
    let _ = app.emit("typer-started", ());
    Ok(())
}

#[tauri::command]
async fn stop_typer(state: State<'_, AppState>, app: tauri::AppHandle) -> Result<(), String> {
    let mut handle = state.typer_handle.lock().map_err(|e| format!("Lock error: {}", e))?;
    if let Some(h) = handle.take() { h.abort(); }
    let _ = app.emit("typer-stopped", ());
    Ok(())
}

#[tauri::command]
async fn sync_click_settings(settings: ClickSettings, state: State<'_, AppState>) -> Result<(), String> {
    let mut guard = state.click_settings.lock().map_err(|e| format!("Lock error: {}", e))?;
    *guard = settings;
    Ok(())
}

#[tauri::command]
async fn sync_type_settings(settings: TypeSettings, state: State<'_, AppState>) -> Result<(), String> {
    let mut guard = state.type_settings.lock().map_err(|e| format!("Lock error: {}", e))?;
    *guard = settings;
    Ok(())
}

#[tauri::command]
async fn update_hotkeys(click_key: String, type_key: String, app: tauri::AppHandle, _state: State<'_, AppState>) -> Result<(), String> {
    let gs = app.global_shortcut();
    let _ = gs.unregister_all();
    
    if let Some(code) = parse_code(&click_key) {
        let s = Shortcut::new(None, code);
        let _ = gs.on_shortcut(s, move |app, _shortcut, event| {
            if event.state() == ShortcutState::Pressed {
                let state = app.state::<AppState>();
                let lock_res = state.clicker_handle.lock();
                if let Ok(mut h) = lock_res {
                    if let Some(handle) = h.take() {
                        handle.abort();
                        let _ = app.emit("clicker-stopped", ());
                    } else {
                        if let Ok(set) = state.click_settings.lock() {
                            let set = set.clone();
                            let app_c = app.app_handle().clone();
                            let delay = set.delay_ms.max(1);
                            let button = match set.button.as_str() { "right" => Button::Right, "middle" => Button::Middle, _ => Button::Left };
                            let limit = if set.is_unlimited { 0 } else { set.repeat_limit };
                            let jh = tauri::async_runtime::spawn(async move {
                                let enigo = Enigo::new(&Settings::default()).ok();
                                if let Some(mut e) = enigo {
                                    let mut count = 0;
                                    loop {
                                        if let Err(err) = e.button(button, Direction::Click) {
                                            log_to_file(&format!("Hotkey click error: {:?}", err));
                                            break;
                                        }
                                        count += 1;
                                        if limit > 0 && count >= limit { let _ = app_c.emit("clicker-stopped", ()); break; }
                                        tokio::time::sleep(tokio::time::Duration::from_millis(delay)).await;
                                    }
                                }
                            });
                            *h = Some(jh);
                            let _ = app.emit("clicker-started", ());
                        }
                    }
                } else {
                    log_to_file("Hotkey handler: Failed to lock clicker handle");
                }
            }
        });
    }

    if let Some(code) = parse_code(&type_key) {
        let s = Shortcut::new(None, code);
        let _ = gs.on_shortcut(s, move |app, _shortcut, event| {
            if event.state() == ShortcutState::Pressed {
                let state = app.state::<AppState>();
                let lock_res = state.typer_handle.lock();
                if let Ok(mut h) = lock_res {
                    if let Some(handle) = h.take() {
                        handle.abort();
                        let _ = app.emit("typer-stopped", ());
                    } else {
                        if let Ok(set) = state.type_settings.lock() {
                            let set = set.clone();
                            if set.text.is_empty() { return; }
                            let app_c = app.app_handle().clone();
                            let payload = set.text.clone();
                            let interval = set.interval_ms.max(1);
                            let enter = set.press_enter;
                            let limit = if set.is_unlimited { 0 } else { set.repeat_limit };
                            let jh = tauri::async_runtime::spawn(async move {
                                let enigo = Enigo::new(&Settings::default()).ok();
                                if let Some(mut e) = enigo {
                                    let mut count = 0;
                                    loop {
                                        if let Err(err) = e.text(&payload) {
                                            log_to_file(&format!("Hotkey type error: {:?}", err));
                                            break;
                                        }
                                        if enter { let _ = e.key(Key::Return, Direction::Click); }
                                        count += 1;
                                        if limit > 0 && count >= limit { let _ = app_c.emit("typer-stopped", ()); break; }
                                        tokio::time::sleep(tokio::time::Duration::from_millis(interval)).await;
                                    }
                                }
                            });
                            *h = Some(jh);
                            let _ = app.emit("typer-started", ());
                        }
                    }
                } else {
                    log_to_file("Hotkey handler: Failed to lock typer handle");
                }
            }
        });
    }

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AppState::default())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            start_clicker, stop_clicker, start_typer, stop_typer,
            sync_click_settings, sync_type_settings, update_hotkeys,
            log_error_to_file
        ])
        .run(tauri::generate_context!())
        .expect("Tauri launch failed");
}
