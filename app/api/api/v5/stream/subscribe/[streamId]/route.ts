// Прокси для SSE subscribe по streamId (фаза 2 initStream).
// GET /api/api/v5/stream/subscribe/{streamId} → api.alfa.directual.com

const STREAM_HOST = 'https://api.alfa.directual.com';

export async function GET(
  _request: Request,
  context: { params: Promise<{ streamId: string }> }
) {
  try {
    const { streamId } = await context.params;
    const targetUrl = `${STREAM_HOST}/api/v5/stream/subscribe/${streamId}`;

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/event-stream',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return new Response(error, { status: response.status });
    }

    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[subscribe-proxy] error:', error);
    return new Response(JSON.stringify({ error: 'Proxy error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
