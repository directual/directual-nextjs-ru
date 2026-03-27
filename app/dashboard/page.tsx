'use client';

import { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Home, Send, Zap, Square, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import fetcher from '@/lib/directual/fetcher';
import type { StreamResult, InitStreamResult } from '@/lib/directual/fetcher';

export default function DashboardPage() {
  const { user } = useAuth();
  const [sending, setSending] = useState(false);

  // --- setStream (старый) ---
  const [prompt, setPrompt] = useState('');
  const [streamOutput, setStreamOutput] = useState('');
  const [streamStatus, setStreamStatus] = useState<'idle' | 'streaming' | 'done' | 'error'>('idle');
  const activeStream = useRef<StreamResult['stream']>(null);

  // --- initStream (новый) ---
  const [initPrompt, setInitPrompt] = useState('');
  const [initStreamOutput, setInitStreamOutput] = useState('');
  const [initStreamStatus, setInitStreamStatus] = useState<'idle' | 'streaming' | 'done' | 'error'>('idle');
  const [initStreamId, setInitStreamId] = useState<string | null>(null);
  const activeInitStream = useRef<InitStreamResult['stream']>(null);

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

  // Запуск initStream
  const handleInitStream = useCallback(async () => {
    const trimmed = initPrompt.trim();
    if (!trimmed) return;

    setInitStreamOutput('');
    setInitStreamStatus('streaming');
    setInitStreamId(null);

    const result = await fetcher.initStreamPrompt(trimmed, {
      onData: (data: unknown) => {
        const chunk = data as { content?: string };
        if (!chunk || typeof chunk.content !== 'string') return;

        const line = chunk.content;
        if (!line.startsWith('data: ')) return;

        try {
          const parsed = JSON.parse(line.slice(6));
          if (parsed.type === 'content_block_delta' && parsed.delta && parsed.delta.type === 'text_delta') {
            setInitStreamOutput(prev => prev + parsed.delta.text);
          }
        } catch {
          // не JSON
        }
      },
      onError: (error: Error) => {
        console.error('[initStream] error:', error);
        setInitStreamStatus('error');
        activeInitStream.current = null;
      },
      onComplete: () => {
        console.log('[initStream] complete');
        setInitStreamStatus('done');
        activeInitStream.current = null;
      },
    });

    if (result.success && result.stream) {
      activeInitStream.current = result.stream;
      result.stream.streamId.then((id) => {
        setInitStreamId(id);
      }).catch(() => {});
    } else {
      setInitStreamStatus('error');
      setInitStreamOutput(result.error || 'Не удалось запустить стрим');
    }
  }, [initPrompt]);

  // Остановка initStream
  const handleInitAbort = useCallback(() => {
    if (activeInitStream.current) {
      activeInitStream.current.abort();
      activeInitStream.current = null;
    }
    setInitStreamStatus('done');
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

      {/* Тест стриминга (setStream) */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
          <Zap size={20} className="flex-shrink-0" />
          Тест стриминга (setStream)
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

      {/* Тест стриминга (initStream) */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
          <Zap size={20} className="flex-shrink-0" />
          Тест стриминга (initStream)
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Промпт</CardTitle>
              <CardDescription>
                Двухфазный: init → <code className="text-xs bg-muted px-1 py-0.5 rounded">streamId</code> → subscribe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleInitStream();
                }}
                className="flex flex-col gap-3"
              >
                <Input
                  placeholder="Введите промпт..."
                  value={initPrompt}
                  onChange={(e) => setInitPrompt(e.target.value)}
                  disabled={initStreamStatus === 'streaming'}
                />
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={initStreamStatus === 'streaming' || !initPrompt.trim()}
                  >
                    {initStreamStatus === 'streaming' ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Zap size={16} />
                    )}
                    {initStreamStatus === 'streaming' ? 'Стримим...' : 'Отправить'}
                  </Button>

                  {initStreamStatus === 'streaming' && (
                    <Button type="button" variant="destructive" onClick={handleInitAbort}>
                      <Square size={16} />
                      Стоп
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                Ответ
                {initStreamStatus === 'streaming' && (
                  <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                )}
                {initStreamStatus === 'done' && (
                  <span className="text-xs font-normal text-muted-foreground">завершён</span>
                )}
                {initStreamStatus === 'error' && (
                  <span className="text-xs font-normal text-destructive">ошибка</span>
                )}
              </CardTitle>
              {initStreamId && (
                <CardDescription className="font-mono text-xs">
                  Stream ID: {initStreamId}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {initStreamStatus === 'idle' && !initStreamOutput && (
                <p className="text-sm text-muted-foreground">Ответ появится здесь...</p>
              )}
              {initStreamOutput && (
                <pre className="whitespace-pre-wrap break-words text-sm font-mono bg-muted/50 rounded-md p-3 max-h-80 overflow-y-auto">
                  {initStreamOutput}
                </pre>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
