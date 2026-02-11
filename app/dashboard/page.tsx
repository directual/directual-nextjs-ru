'use client';

import { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Home, Send, Zap, Square, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import fetcher from '@/lib/directual/fetcher';
import type { StreamResult } from '@/lib/directual/fetcher';

export default function DashboardPage() {
  const { user } = useAuth();
  const [sending, setSending] = useState(false);

  // --- Стриминг ---
  const [prompt, setPrompt] = useState('');
  const [streamOutput, setStreamOutput] = useState('');
  const [streamStatus, setStreamStatus] = useState<'idle' | 'streaming' | 'done' | 'error'>('idle');
  const activeStream = useRef<StreamResult['stream']>(null);

  // Запуск стрима
  const handleStream = useCallback(async () => {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    // Сбрасываем предыдущий результат
    setStreamOutput('');
    setStreamStatus('streaming');

    const result = await fetcher.streamPrompt(trimmed, {
      onData: (data: unknown) => {
        // Directual оборачивает каждую строку Anthropic SSE в { content: "..." }
        const chunk = data as { content?: string };
        if (!chunk || typeof chunk.content !== 'string') return;

        const line = chunk.content;

        // Нас интересуют только строки data: {...}
        if (!line.startsWith('data: ')) return;

        try {
          const parsed = JSON.parse(line.slice(6));

          // Текстовые дельты — собственно ответ модели
          if (parsed.type === 'content_block_delta' && parsed.delta && parsed.delta.type === 'text_delta') {
            setStreamOutput(prev => prev + parsed.delta.text);
          }
        } catch {
          // Не JSON — пропускаем
        }
      },
      onError: (error: Error) => {
        console.error('[stream] error:', error);
        setStreamStatus('error');
        activeStream.current = null;
      },
      onComplete: () => {
        console.log('[stream] complete');
        setStreamStatus('done');
        activeStream.current = null;
      },
    });

    if (result.success && result.stream) {
      activeStream.current = result.stream;
    } else {
      // Если стрим не запустился
      setStreamStatus('error');
      setStreamOutput(result.error || 'Не удалось запустить стрим');
    }
  }, [prompt]);

  // Остановка стрима
  const handleAbort = useCallback(() => {
    if (activeStream.current) {
      activeStream.current.abort();
      activeStream.current = null;
    }
    setStreamStatus('done');
  }, []);

  // Тестовая отправка user action
  async function handleSendAction() {
    setSending(true);
    try {
      const result = await fetcher.postUserAction('test_message', {});
      console.log('postUserAction result:', result);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold flex items-center gap-3 mb-6">
        <Home size={28} className="flex-shrink-0" />
        Главная
      </h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Добро пожаловать!</CardTitle>
            <CardDescription>
              {user ? `Привет, ${user.name || user.email}!` : 'Загрузка...'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Это стартовая страница вашего шаблона. Добавьте сюда нужный контент.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Начало работы</CardTitle>
            <CardDescription>Быстрый старт</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Настройте страницы, добавьте эндпоинты в fetcher и подключите WebSocket события.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Документация</CardTitle>
            <CardDescription>Полезные ссылки</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Проверьте README.md для инструкций по настройке Directual.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Button onClick={handleSendAction} disabled={sending}>
          <Send size={16} />
          {sending ? 'Отправка...' : 'Отправить действие'}
        </Button>
      </div>

      {/* Тест стриминга */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
          <Zap size={20} className="flex-shrink-0" />
          Тест стриминга
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Форма */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Промпт</CardTitle>
              <CardDescription>
                Структура <code className="text-xs bg-muted px-1 py-0.5 rounded">streaming</code> / эндпоинт <code className="text-xs bg-muted px-1 py-0.5 rounded">stream</code>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleStream();
                }}
                className="flex flex-col gap-3"
              >
                <Input
                  placeholder="Введите промпт..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={streamStatus === 'streaming'}
                />
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={streamStatus === 'streaming' || !prompt.trim()}
                  >
                    {streamStatus === 'streaming' ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Zap size={16} />
                    )}
                    {streamStatus === 'streaming' ? 'Стримим...' : 'Отправить'}
                  </Button>

                  {streamStatus === 'streaming' && (
                    <Button type="button" variant="destructive" onClick={handleAbort}>
                      <Square size={16} />
                      Стоп
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Ответ */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                Ответ
                {streamStatus === 'streaming' && (
                  <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                )}
                {streamStatus === 'done' && (
                  <span className="text-xs font-normal text-muted-foreground">завершён</span>
                )}
                {streamStatus === 'error' && (
                  <span className="text-xs font-normal text-destructive">ошибка</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {streamStatus === 'idle' && !streamOutput && (
                <p className="text-sm text-muted-foreground">Ответ появится здесь...</p>
              )}
              {streamOutput && (
                <pre className="whitespace-pre-wrap break-words text-sm font-mono bg-muted/50 rounded-md p-3 max-h-80 overflow-y-auto">
                  {streamOutput}
                </pre>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
