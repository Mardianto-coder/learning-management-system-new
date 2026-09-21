/**
 * Helper function untuk handle API responses
 * Memastikan semua response di-parse dengan benar (JSON atau text)
 */

/**
 * Parse response dengan handle untuk JSON dan text
 */
export async function parseResponse(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
        return await response.json();
    } else {
        // If not JSON, try to get text and parse
        const text = await response.text();
        try {
            return JSON.parse(text);
        } catch {
            // If can't parse, return error object
            return { message: text || 'Request failed' };
        }
    }
}

/**
 * Handle API error dengan format yang konsisten
 */
export function handleApiError(error: any, defaultMessage: string = 'Request failed'): Error {
    if (error instanceof Error) {
        return error;
    }
    return new Error(error?.message || error?.error || defaultMessage);
}

