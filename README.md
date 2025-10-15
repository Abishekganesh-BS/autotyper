
# Auto Typer (Keyboard Automation with Loops)

This script is an **auto-typing tool** built using [pynput](https://pypi.org/project/pynput/).
It allows you to automatically type text with two different loop modes:

* **Continuous mode** → repeats indefinitely until stopped.
* **Limited mode** → repeats for a set number of times.

---

## ✨ Features

* Start automation with **F2**.
* Stop automation with **ESC**.
* Choose between:

  * **Continuous loop (C)** → text is typed indefinitely until stopped.
  * **Limited loop (L)** → text is typed a specified number of times.
* Adjustable **time spacing** between each typing.
* Supports any custom text input.

---

## 📦 Requirements

* Python 3.x
* [`pynput`](https://pypi.org/project/pynput/)

Install with:

```bash
pip install pynput
```

---

## ▶️ Usage

1. Run the script:

   ```bash
   python auto_typer_pro.py
   ```
2. Choose loop type:

   * `C` → Continuous loop
   * `L` → Limited loop
3. Enter the text you want typed.
4. Enter the time interval (seconds) between each repetition.
5. If you chose **Limited loop**, enter the number of times it should repeat.
6. Press **F2** to start typing.
7. Press **ESC** to stop typing.

---

## 📖 Example

```text
Loop Type: L
Text: Hello World
Time-Space: 2
Repeating Limits: 5
```

➡️ When **F2** is pressed, the script will type `Hello World` every 2 seconds, exactly 5 times.
➡️ If **C** is chosen instead, it will continue indefinitely until **ESC** is pressed.

---

## ⚠️ Notes

* Always test in a safe environment (like a text editor) before using.
* Using this in online platforms, games, or chats may violate their terms of service. Use responsibly.

---

## 🛠️ Future Improvements

* Add hotkey customization.
* Add a pause/resume feature (instead of just stop).
* GUI for easier control.

---

## 👨‍💻 Author

Made by **Abishek Ganesh**
Version: `2`

