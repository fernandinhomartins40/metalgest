import cors from 'cors';

const localOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3010',
  'http://127.0.0.1:3010',
  'http://localhost',
  'http://127.0.0.1',
];

const splitOrigins = (value?: string) =>
  (value || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const buildDomainOrigins = (domain?: string) => {
  if (!domain) {
    return [];
  }

  const normalizedDomain = domain.trim().replace(/^https?:\/\//, '').replace(/\/+$/, '');
  if (!normalizedDomain) {
    return [];
  }

  return [`https://${normalizedDomain}`, `http://${normalizedDomain}`];
};

const normalizeOrigin = (origin: string) => origin.trim().replace(/\/+$/, '');

const allowedOrigins = Array.from(
  new Set(
    [
      ...localOrigins,
      ...splitOrigins(process.env.CORS_ALLOWED_ORIGINS),
      ...splitOrigins(process.env.FRONTEND_URL),
      ...splitOrigins(process.env.APP_PUBLIC_URL),
      ...buildDomainOrigins(process.env.APP_DOMAIN),
      ...buildDomainOrigins(process.env.APP_DOMAIN_WWW),
    ].map(normalizeOrigin)
  )
);

const allowedHosts = new Set(
  [process.env.APP_DOMAIN, process.env.APP_DOMAIN_WWW]
    .filter(Boolean)
    .map((domain) => domain!.trim().replace(/^https?:\/\//, '').replace(/\/+$/, '').toLowerCase())
);

const isAllowedOrigin = (origin: string) => {
  const normalizedOrigin = normalizeOrigin(origin);

  if (allowedOrigins.includes(normalizedOrigin)) {
    return true;
  }

  try {
    const hostname = new URL(normalizedOrigin).hostname.toLowerCase();
    return allowedHosts.has(hostname);
  } catch {
    return false;
  }
};

export const corsAllowedOrigins = allowedOrigins;

export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400,
};
