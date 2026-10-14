# ⚙️ Configuration & Environment (`src/config`)

Centralized and validated configuration module for both client and server runtime environments.

## Principles

1. **No direct `process.env` in business logic**: All environment variable reads must be routed through `@/config/env`.
2. **Safe Client Isolation**: Variables prefixed with `NEXT_PUBLIC_` are exported via `ENV`.
3. **Server-Side Protection**: Private credentials (database passwords, admin tokens, service role keys, API keys) are strictly contained within `SERVER_ENV`.
4. **Startup Validation**: `validateEnv()` provides diagnostic feedback on missing or malformed variables in development and deployment logs.

## Usage

```ts
// In client components:
import { ENV } from '@/config/env'
console.log(ENV.SUPABASE_URL)

// In Server Actions or API routes:
import { SERVER_ENV } from '@/config/env'
const dbPass = SERVER_ENV.TIDB_PASSWORD
```
