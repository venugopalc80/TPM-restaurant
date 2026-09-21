# TPM Restaurant AI MVP

## Current implementation

- Supabase PostgreSQL ordering schema is live.
- Demo restaurant: `TPM Restaurant Demo`.
- Demo menu: 10 categories and 75 items (English + Indian).
- RLS is enabled on all core tables.
- Order creation is moving through a validated PostgreSQL RPC so prices/totals are read from `menu_items`, not trusted from the browser or voice agent.
- AI/website should call the same order engine.

## Customer flows

### Website
Menu -> Cart -> Customer details -> Collection/Delivery -> Server validation -> Order confirmation -> Restaurant dashboard

### Phone
Incoming call -> AI greeting -> Menu lookup -> Order composition -> Server validation -> Customer details -> Delivery/collection -> Order confirmation -> Restaurant dashboard

## Backend rules

1. Menu and prices are authoritative in PostgreSQL.
2. AI uses backend tools and cannot invent prices, availability or allergens.
3. Order totals are calculated server-side.
4. Customer/order records are scoped by `restaurant_id`.
5. Payment details are not collected as raw card data by the AI.
6. The AI can transfer to a human when the request is outside configured capabilities.
7. Allergen/dietary information is only production-safe after recipe, supplier and cross-contact verification.

## Build sequence

- [x] Database schema
- [x] Demo menu seed
- [x] Server-side order calculation RPC
- [ ] FastAPI service
- [ ] Menu API
- [ ] Order API
- [ ] Customer API
- [ ] Restaurant dashboard
- [ ] Website ordering UI
- [ ] Voice agent tools
- [ ] Call testing
- [ ] Production deployment
- [ ] Production tenant/staff authorization
- [ ] Payment link integration
