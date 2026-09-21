# TPM Restaurant AI MVP

## Customer flows

### Website
Menu -> Cart -> Customer details -> Collection/Delivery -> Order confirmation

### Phone
Incoming call -> AI greeting -> Menu lookup -> Order composition -> Backend validation -> Customer details -> Delivery/collection -> Order confirmation -> Restaurant dashboard

## Backend rules

1. Menu and prices are authoritative in PostgreSQL.
2. AI uses backend tools and cannot invent prices or menu items.
3. Order totals are calculated server-side.
4. Customer/order records are scoped by restaurant_id.
5. Payment details are not collected as raw card data by the AI.
6. The AI can transfer to a human when the request is outside configured capabilities.

## First implementation targets

- [ ] Database schema
- [ ] FastAPI service
- [ ] Menu API
- [ ] Order API
- [ ] Customer API
- [ ] Restaurant dashboard
- [ ] Website ordering UI
- [ ] Voice agent tools
- [ ] Call testing
- [ ] Production deployment
