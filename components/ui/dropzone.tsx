'use client';

import { UploadIcon } from 'lucide-react';
import { createContext, useContext, ReactNode } from 'react';
import { useDropzone, Accept, FileRejection, DropEvent } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const renderBytes = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)}${units[unitIndex]}`;
};

interface DropzoneContextValue {
  accept?: Accept;
  maxFiles?: number;
  maxSize?: number;
  minSize?: number;
}

const DropzoneContext = createContext<DropzoneContextValue | undefined>(undefined);

interface DropzoneProps {
  accept?: Accept;
  maxFiles?: number;
  maxSize?: number;
  minSize?: number;
  onDrop?: (acceptedFiles: File[], fileRejections: FileRejection[], event: DropEvent) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
  src?: string;
  className?: string;
  children?: ReactNode;
  [key: string]: unknown;
}

/**
 * Dropzone компонент для загрузки файлов drag&drop
 * Основной контейнер для загрузки
 */
export const Dropzone = ({
  accept,
  maxFiles = 1,
  maxSize,
  minSize,
  onDrop,
  onError,
  disabled,
  src,
  className,
  children,
  ...props
}: DropzoneProps) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    maxFiles,
    maxSize,
    minSize,
    onError,
    disabled,
    onDrop: (acceptedFiles, fileRejections, event) => {
      if (fileRejections.length > 0) {
        const message = fileRejections.at(0)?.errors.at(0)?.message;
        onError?.(new Error(message));
        return;
      }

      onDrop?.(acceptedFiles, fileRejections, event);
    },
    ...props,
  });

  return (
    <DropzoneContext.Provider value={{ accept, maxFiles, maxSize, minSize }}>
      <div
        {...getRootProps({
          className: cn(
            'relative w-full cursor-pointer rounded-lg border-2 border-dashed border-border bg-background p-4 transition-all duration-200 hover:border-accent hover:bg-accent/5',
            isDragActive && 'border-accent bg-accent/10',
            disabled && 'cursor-not-allowed opacity-50 hover:border-border hover:bg-background',
            className
          ),
        })}
      >
        <input {...getInputProps()} />
        {children}
      </div>
    </DropzoneContext.Provider>
  );
};

interface DropzoneContentProps {
  className?: string;
  children?: ReactNode;
}

/**
 * Контент области Dropzone
 */
export const DropzoneContent = ({ className, children }: DropzoneContentProps) => {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2 text-center', className)}>
      {children}
    </div>
  );
};

interface DropzoneEmptyStateProps {
  Icon?: React.ElementType;
  title?: string;
  description?: string;
  buttonText?: string;
  disabled?: boolean;
}

/**
 * Состояние когда файлы не загружены
 */
export const DropzoneEmptyState = ({
  Icon = UploadIcon,
  title = 'Перетащите файлы сюда',
  description,
  buttonText = 'Выбрать файлы',
  disabled,
}: DropzoneEmptyStateProps) => {
  const context = useContext(DropzoneContext);

  // Создаем описание на основе ограничений
  const autoDescription = () => {
    const parts: string[] = [];

    if (context?.maxFiles !== undefined) {
      parts.push(`до ${context.maxFiles} файл${context.maxFiles > 1 ? 'ов' : ''}`);
    }

    if (context?.maxSize !== undefined) {
      parts.push(`макс. ${renderBytes(context.maxSize)}`);
    }

    if (context?.accept) {
      const extensions = Object.keys(context.accept).join(', ');
      parts.push(extensions);
    }

    return parts.length > 0 ? parts.join(' • ') : null;
  };

  const finalDescription = description || autoDescription();

  return (
    <>
      <Icon className="h-10 w-10 text-muted-foreground" />
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {finalDescription && <p className="text-xs text-muted-foreground">{finalDescription}</p>}
      </div>
      <Button variant="outline" size="sm" disabled={disabled} type="button">
        {buttonText}
      </Button>
    </>
  );
};
