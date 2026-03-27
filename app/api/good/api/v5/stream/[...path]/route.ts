// Прокси к api.alfa.directual.com для стриминга.
// Обслуживает и setStream (SSE напрямую), и initStream init-фазу (JSON).
// Пробрасываем оригинальные заголовки, чтобы бэкенд сам решал формат ответа.

const STREAM_HOST = 'https://api.alfa.directual.com';

export async function POST(
  request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await context.params;
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();

    const targetUrl = `${STREAM_HOST}/good/api/v5/stream/${path.join('/')}${searchParams ? `?${searchParams}` : ''}`;
    const body = await request.text();

    const headers: Record<string, string> = {
      'Content-Type': request.headers.get('Content-Type') || 'application/json',
    };
    const accept = request.headers.get('Accept');
    if (accept) {
      headers['Accept'] = accept;
    }

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body,
    });

    if (!response.ok) {
      const error = await response.text();
      return new Response(error, { status: response.status });
    }

    const contentType = response.headers.get('Content-Type') || 'application/octet-stream';
    const isSSE = contentType.includes('text/event-stream');

    const responseHeaders: Record<string, string> = {
      'Content-Type': contentType,
    };
    if (isSSE) {
      responseHeaders['Cache-Control'] = 'no-cache';
      responseHeaders['Connection'] = 'keep-alive';
    }

    return new Response(response.body, { headers: responseHeaders });
  } catch (error) {
    console.error('[stream-proxy] error:', error);
    return new Response(JSON.stringify({ error: 'Proxy error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
