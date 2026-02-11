// Прокси для SSE стриминга к Directual.
// Пробрасываем ReadableStream от api.alfa.directual.com без буферизации.

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

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body,
    });

    if (!response.ok) {
      const error = await response.text();
      return new Response(error, { status: response.status });
    }

    // Пробрасываем ReadableStream как есть — чанки летят сразу
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[stream-proxy] error:', error);
    return new Response(JSON.stringify({ error: 'Proxy error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
