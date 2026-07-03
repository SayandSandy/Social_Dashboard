import { InstagramAPIError, TokenExpiredError, RateLimitError } from './errors';

export class InstagramGraphClient {
  private baseUrl: string;
  private token: string;
  private maxRetries = 3;
  private backoffMs = [1000, 2000, 4000];

  constructor(token?: string) {
    this.token = token || process.env.IG_ACCESS_TOKEN || '';
    const apiVersion = process.env.IG_API_VERSION || 'v22.0';
    this.baseUrl = `https://graph.facebook.com/${apiVersion}`;
  }

  private validateToken() {
    if (!this.token) {
      throw new Error('Instagram Access Token is not defined');
    }
  }

  private normalizeError(err: any): InstagramAPIError {
    const errorData = err?.error || {};
    const statusCode = err?.status || 500;
    const message = errorData.message || 'Unknown Instagram API Error';
    
    // Check for token expiry
    if (errorData.code === 190) {
      return new TokenExpiredError(message);
    }
    
    // Check for rate limits (Business Use Case limits)
    if (errorData.code === 4 || errorData.code === 17 || statusCode === 429) {
      const retryAfter = err?.headers?.get('Retry-After') 
        ? parseInt(err.headers.get('Retry-After')!, 10) 
        : 3600;
      return new RateLimitError(retryAfter);
    }

    return new InstagramAPIError(message, statusCode);
  }

  private async withRetry<T>(fn: () => Promise<T>): Promise<T> {
    let attempt = 0;
    while (attempt < this.maxRetries) {
      try {
        return await fn();
      } catch (error: any) {
        if (error instanceof RateLimitError) {
          // If we hit a hard rate limit, we might want to throw or sleep heavily.
          // For simplicity in a serverless func, we might just throw if retryAfter is huge.
          if (error.retryAfter && error.retryAfter > 60) {
            throw error;
          }
        }
        
        // 5xx errors or minor 429s
        if (error.statusCode >= 500 || error.statusCode === 429) {
          if (attempt < this.maxRetries - 1) {
            const delay = this.backoffMs[attempt] || 4000;
            await new Promise(res => setTimeout(res, delay));
            attempt++;
            continue;
          }
        }
        
        throw error;
      }
    }
    throw new Error('Max retries reached');
  }

  async get<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
    this.validateToken();
    
    const url = new URL(`${this.baseUrl}${path}`);
    url.searchParams.append('access_token', this.token);
    
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.append(key, String(value));
    }

    return this.withRetry(async () => {
      const response = await fetch(url.toString());
      const data = await response.json();
      
      if (!response.ok) {
        throw this.normalizeError({ ...data, status: response.status, headers: response.headers });
      }
      
      return data as T;
    });
  }

  async paginate<T>(path: string, params: Record<string, string | number> = {}): Promise<T[]> {
    let results: T[] = [];
    let currentUrl: string | null = null;
    
    this.validateToken();
    const url = new URL(`${this.baseUrl}${path}`);
    url.searchParams.append('access_token', this.token);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.append(key, String(value));
    }
    currentUrl = url.toString();

    while (currentUrl) {
      const responseData: any = await this.withRetry(async () => {
        const response = await fetch(currentUrl!);
        const data = await response.json();
        if (!response.ok) {
          throw this.normalizeError({ ...data, status: response.status, headers: response.headers });
        }
        return data;
      });

      if (responseData.data && Array.isArray(responseData.data)) {
        results = results.concat(responseData.data);
      }
      
      if (responseData.paging && responseData.paging.next) {
        currentUrl = responseData.paging.next;
      } else {
        currentUrl = null;
      }
    }

    return results;
  }
}
