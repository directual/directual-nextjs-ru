import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Утилита для объединения классов Tailwind
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

// PascalCase → kebab-case (для DynamicIcon из lucide-react)
export function toKebab(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}





