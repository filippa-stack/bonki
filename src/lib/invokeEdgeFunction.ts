import { supabase } from '@/integrations/supabase/client';

interface InvokeOptions {
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
  /** Optional context labels for logs */
  context?: {
    userId?: string | null;
    spaceId?: string | null;
  };
}

interface InvokeResult<T = unknown> {
  data: T | null;
  error: Error | null;
  /** HTTP status from the edge function response (if available) */
  status?: number;
}

/**
 * Thin wrapper around supabase.functions.invoke that logs rich diagnostics
 * in DEV mode: function name, payload, userId, spaceId, HTTP status, and
 * the raw response body on failure.
 */
export async function invokeEdgeFunction<T = unknown>(
  functionName: string,
  options: InvokeOptions = {}
): Promise<InvokeResult<T>> {
  const { body, headers, context } = options;

  if (import.meta.env.DEV) {
    console.groupCollapsed(`[edge] → ${functionName}`);
    console.log('payload :', body ?? '(none)');
    console.log('userId  :', context?.userId ?? '—');
    console.log('spaceId :', context?.spaceId ?? '—');
    console.groupEnd();
  }

  const res = await supabase.functions.invoke<T>(functionName, {
    body,
    headers,
  });

  if (import.meta.env.DEV && res.error) {
    // supabase-js wraps the edge function response — pull out what it exposes
    const err = res.error as Error & { status?: number; context?: { response?: Response } };
    const status = err.status;

    // Try to get the raw body from the underlying response if supabase-js kept it
    let rawBody: string | undefined;
    try {
      // supabase-js ≥ 2.x stores the raw Response on FunctionsHttpError.context.response
      const underlyingResponse = (err as any).context?.response as Response | undefined;
      if (underlyingResponse) {
        rawBody = await underlyingResponse.clone().text();
      }
    } catch {
      // ignore — body already consumed or not available
    }

    console.group(`[edge] ✗ ${functionName}`);
    console.error('message :', err.message);
    console.error('status  :', status ?? '(unknown)');
    if (rawBody !== undefined) console.error('body    :', rawBody);
    console.error('full err:', err);
    console.groupEnd();
  }

  if (import.meta.env.DEV && !res.error) {
    console.log(`[edge] ✓ ${functionName}`, res.data);
  }

  return {
    data: res.data,
    error: res.error,
    status: (res.error as any)?.status,
  };
}
