# Auto CT 🖱️⌨️

Auto CT (Clicker & Typer) is a high-performance, hotkey-centric automation tool built with **Tauri**, **Rust**, and **React**. It provides professional-grade input simulation with a sleek, minimalist interface and robust global hotkey support.

## ✨ Features

- **🚀 Global Hotkeys**: Start and stop automation instantly from any application using custom global shortcuts (Default: `F6` for Clicker, `F7` for Typer).
- **🖱️ Precision Clicker**: 
  - Choose between Left, Right, or Middle mouse buttons.
  - Set custom delay intervals in milliseconds.
  - Operational modes: **Unlimited** (infinite) or **Limited** (fixed repetition count).
- **⌨️ Rapid Typer**:
  - Automate complex text sequences with ease.
  - Adjustable typing intervals.
  - Optional "Auto Enter" functionality after each sequence.
- **💾 Persistence**: Automatically saves and loads your settings (hotkeys, text, intervals) so you're ready to go as soon as the app opens.
- **🛡️ Robust Logging**: Built-in error handling that records diagnostics to a local `logs.txt` file for troubleshooting.
- **☀️ Modern UI**: A clean, high-contrast Light Mode interface with glassmorphism aesthetics and premium micro-animations.

## 📖 How to Use

1. **Configure**: Select the **Clicker** or **Typer** tab and set your desired intervals, text, or click button.
2. **Position**: Place your mouse cursor in the target area where you want the action to occur.
3. **Activate**: Press the global hotkey to start.
   - **Clicker**: Press `F6` (Default)
   - **Typer**: Press `F7` (Default)
4. **Stop**: Press the same hotkey again to halt operation immediately.

> [!TIP]
> You can change the hotkeys anytime in the **Settings** menu (Gear icon in the top-right corner).

## 🛠️ Development

This project is built using the Tauri v2 framework.

### Prerequisites

- [Node.js](https://nodejs.org/) (for the React/Vite frontend)
- [Rust](https://www.rust-lang.org/) (for the backend)
- [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) (Windows)

### Setup & Run

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run in development mode:
   ```bash
   npm run tauri dev
   ```
4. Build for production:
   ```bash
   npm run tauri build
   ```

## 📂 Project Structure

- `src/`: React frontend (Vite environment).
- `src-tauri/`: Rust backend and Tauri configuration.
- `src-tauri/src/lib.rs`: Core logic for input simulation and hotkey management.
- `logs.txt`: Local file generated for diagnostic logging.

---
Auto CT &bull; Professional Automation &bull; 2026
