import { RemixServer } from '@remix-run/react';
import type { EntryContext } from '@remix-run/cloudflare';
import { isbot } from 'isbot';
import { renderToReadableStream } from 'react-dom/server';

export default async function handleRequest(
  request: Request,
  statusCode: number,
  headers: Headers,
  context: EntryContext
) {
  const userAgent = request.headers.get("user-agent");
  const isBot = isbot(userAgent);

  let didError = false;

  const stream = await renderToReadableStream(
    <RemixServer context={context} url={request.url} />,
    {
      signal: request.signal,
      onError(error: unknown) {
        didError = true;
        console.error('Error during rendering:', error);
        statusCode = 500;
      },
    }
  );

  if (isBot) {
    try {
      await stream.allReady;
    } catch (error) {
      console.error('Error during bot rendering:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }

  if (didError) {
    headers.set("Content-Type", "text/html");
    return new Response(
      '<!DOCTYPE html><html><body><h1>Internal Server Error</h1><p>Something went wrong. Please try again later.</p></body></html>',
      {
        status: 500,
        headers,
      }
    );
  }

  headers.set("Content-Type", "text/html");
  return new Response(stream, {
    status: statusCode,
    headers,
  });
}
