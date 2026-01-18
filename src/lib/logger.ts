import { invoke } from "@tauri-apps/api/core";

/**
 * Safely logs an error message to the backend logs.txt file.
 */
export async function logError(message: string, context?: string) {
    const formattedMessage = context ? `[${context}] ${message}` : message;
    try {
        await invoke("log_error_to_file", { message: formattedMessage });
    } catch (err) {
        console.error("Failed to log error to backend:", err);
    }
}

/**
 * A wrapper for async operations that logs any caught errors.
 */
export async function tryLog<T>(
    operation: () => Promise<T>,
    context: string
): Promise<T | null> {
    try {
        return await operation();
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        await logError(errorMessage, context);
        return null;
    }
}
