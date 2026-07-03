export class AppError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = 'AppError';
  }
}

export class InstagramAPIError extends AppError {
  constructor(
    message: string,
    statusCode: number,
    public retryAfter?: number
  ) {
    super(message, statusCode);
    this.name = 'InstagramAPIError';
  }
}

export class TokenExpiredError extends InstagramAPIError {
  constructor(message: string = 'Instagram access token has expired') {
    super(message, 401);
    this.name = 'TokenExpiredError';
  }
}

export class RateLimitError extends InstagramAPIError {
  constructor(retryAfter: number = 3600) {
    super('Instagram API rate limit exceeded', 429, retryAfter);
    this.name = 'RateLimitError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string) {
    super(message, 500);
    this.name = 'DatabaseError';
  }
}

export class AIError extends AppError {
  constructor(message: string) {
    super(message, 500);
    this.name = 'AIError';
  }
}
