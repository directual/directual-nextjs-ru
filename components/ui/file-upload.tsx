'use client';

import { useState, useRef } from 'react';
import { CheckCircle2, XCircle, FileIcon, X, User, Upload } from 'lucide-react';
import { Dropzone, DropzoneEmptyState, DropzoneContent } from '@/components/ui/dropzone';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import fetcher from '@/lib/directual/fetcher';
import { FileData } from '@/types';

// Хелпер для форматирования размера файла
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

interface FileUploadProps {
  onSuccess?: (fileData: FileData) => void;
  onError?: (error: Error) => void;
  onChange?: (fileData: FileData | null) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  className?: string;
  profileImage?: boolean;
  value?: string | null;
}

/**
 * Компонент для загрузки файлов с прогресс-баром
 */
export function FileUpload({ 
  onSuccess, 
  onError, 
  onChange,
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB по умолчанию
  className,
  profileImage = false, // Режим аватарки
  value = null, // Для controlled режима (URL фотки)
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[] | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<FileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Общая логика загрузки
  const uploadFile = async (file: File) => {
    setFiles([file]);
    setError(null);
    setUploadedFile(null);
    setProgress(0);
    setUploading(true);

    try {
      const result = await fetcher.uploadFile(file, (percent) => {
        setProgress(percent);
      });

      if (result.success && result.data) {
        const fileData: FileData = {
          urlLink: result.data.urlLink,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        };

        setUploadedFile(fileData);
        setProgress(100);

        // Вызываем коллбэки
        onSuccess?.(fileData);
        onChange?.(fileData);
      } else {
        const errorMessage = result.error || 'Ошибка загрузки файла';
        setError(errorMessage);
        onError?.(new Error(errorMessage));
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка загрузки';
      setError(errorMessage);
      onError?.(new Error(errorMessage));
    } finally {
      setUploading(false);
    }
  };

  // Обработка выбора файла
  const handleDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      uploadFile(file);
    }
  };

  // Обработка ошибок валидации
  const handleError = (err: Error) => {
    setError(err.message);
    onError?.(err);
  };

  // Удаление файла
  const handleRemove = () => {
    setFiles(null);
    setUploadedFile(null);
    setError(null);
    setProgress(0);
    onChange?.(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Клик на аватарку для загрузки нового фото
  const handleAvatarClick = () => {
    if (fileInputRef.current && !uploading) {
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      uploadFile(selectedFile);
    }
  };

  // Режим аватарки
  if (profileImage) {
    const displayUrl = uploadedFile?.urlLink || value;

    return (
      <div className="flex flex-col items-center gap-4">
        <div
          className={cn(
            "relative cursor-pointer group",
            uploading && "pointer-events-none opacity-50"
          )}
          onClick={handleAvatarClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Avatar className="h-24 w-24 ring-2 ring-offset-2 ring-offset-background transition-all group-hover:ring-accent">
            {displayUrl ? (
              <AvatarImage src={displayUrl} alt="Profile" />
            ) : (
              <AvatarFallback>
                <User className="h-12 w-12 text-muted-foreground" />
              </AvatarFallback>
            )}
          </Avatar>

          {/* Оверлей при наведении */}
          {isHovered && !uploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
              <Upload className="h-8 w-8 text-white" />
            </div>
          )}

          {/* Прогресс при загрузке */}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
              <span className="text-white text-sm font-semibold">{Math.round(progress)}%</span>
            </div>
          )}
        </div>

        {/* Скрытый input для выбора файла */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept ? Object.keys(accept).join(',') : 'image/*'}
          onChange={handleFileInputChange}
          className="hidden"
        />

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Нажмите на аватар чтобы изменить фото
        </p>
      </div>
    );
  }

  // Обычный режим загрузки
  return (
    <div className={cn("w-full space-y-4", className)}>
      <Dropzone
        accept={accept}
        maxSize={maxSize}
        onDrop={handleDrop}
        onError={handleError}
        disabled={uploading}
      >
        <DropzoneContent>
          {!files && !uploading && !uploadedFile && !error && (
            <DropzoneEmptyState
              title="Перетащите файл сюда"
              description={`Максимальный размер: ${formatFileSize(maxSize)}`}
              buttonText="Выбрать файл"
              disabled={uploading}
            />
          )}

          {files && uploading && (
            <div className="w-full space-y-2">
              <div className="flex items-center gap-3">
                <FileIcon className="h-8 w-8 text-primary shrink-0" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-foreground truncate">{files[0]?.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(files[0]?.size || 0)}</p>
                </div>
              </div>
              <Progress value={progress} />
              <p className="text-xs text-muted-foreground text-center">Загрузка... {Math.round(progress)}%</p>
            </div>
          )}

          {uploadedFile && !error && (
            <div className="w-full space-y-2">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-green-500 shrink-0" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-foreground truncate">{uploadedFile.fileName}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(uploadedFile.fileSize)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemove}
                  className="shrink-0"
                  type="button"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {error && !uploading && (
            <div className="w-full space-y-2">
              <div className="flex items-center gap-3">
                <XCircle className="h-8 w-8 text-destructive shrink-0" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-destructive">Ошибка загрузки</p>
                  <p className="text-xs text-muted-foreground">{error}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemove}
                  className="shrink-0"
                  type="button"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </DropzoneContent>
      </Dropzone>
    </div>
  );
}
