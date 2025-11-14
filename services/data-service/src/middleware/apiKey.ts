import { Request, Response, NextFunction } from 'express';
import { env } from '@/env';

const VALID_API_KEYS = env.API_KEYS?.split(',').map(key => key.trim()) || [];

export const apiKeyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Skip API key for docs, health endpoints, and root
  const publicEndpoints = [
    '/',
    '/docs',
    '/status',
    '/openapi',
    '/status/health',
    '/status/info'
  ];
  
  if (publicEndpoints.some(endpoint => req.path.startsWith(endpoint))) {
    return next();
  }

  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    return res.status(401).json({
      error: 'API key required',
      message: 'Please provide an API key in the x-api-key header',
      code: 'MISSING_API_KEY'
    });
  }

  if (!VALID_API_KEYS.includes(apiKey)) {
    return res.status(403).json({
      error: 'Invalid API key',
      message: 'The provided API key is not valid',
      code: 'INVALID_API_KEY'
    });
  }
  
  next();
};

export const conditionalApiKeyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (env.REQUIRE_API_KEY === "true") {
    return apiKeyMiddleware(req, res, next);
  }
  next();
};