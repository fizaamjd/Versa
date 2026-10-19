// Public pricing only: never forward browser credentials to the upstream API.
export const dynamic = 'force-dynamic';
export const maxDuration = 90;

export async function GET(): Promise<Response> {
    const base = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL
        || (process.env.NODE_ENV === 'development' ? 'http://localhost:8000/api' : '');
    const headers = { 'Cache-Control': 'no-store' };
    if (!base) {
        return Response.json({ detail: 'Pricing service is not configured.' }, { status: 503, headers });
    }

    try {
        const upstream = await fetch(`${base.replace(/\/+$/, '')}/plans`, {
            headers: { Accept: 'application/json' },
            cache: 'no-store',
            signal: AbortSignal.timeout(60_000),
        });
        if (!upstream.ok) {
            return Response.json({ detail: 'Pricing service is temporarily unavailable.' }, { status: 502, headers });
        }
        const plans: unknown = await upstream.json();
        if (!Array.isArray(plans)) {
            return Response.json({ detail: 'Pricing service returned an invalid response.' }, { status: 502, headers });
        }
        return Response.json(plans, { headers });
    } catch {
        return Response.json({ detail: 'Pricing service is temporarily unavailable. Please try again.' }, { status: 503, headers });
    }
}
