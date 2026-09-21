# TPM Restaurant AI Ordering Platform

The Pixel Muses restaurant website and AI phone-ordering platform.

## MVP
- Restaurant website and menu
- Online ordering
- Shared order engine
- Restaurant dashboard
- AI phone ordering via a voice provider
- Customer and order management

## Architecture
Next.js frontend -> FastAPI API -> Supabase PostgreSQL

The website and AI voice agent use the same backend order engine. AI never writes directly to the database; it uses validated backend tools.

## Environment variables
Never commit secrets. Use local environment variables for Supabase, voice/telephony, AI, and Stripe credentials.

## Status
Initial architecture scaffold.
