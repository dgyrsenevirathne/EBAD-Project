# Cart Backend Implementation TODO

## Phase 1: Core Infrastructure ✅
- [x] Create Next.js auth utility (lib/auth.ts)
- [x] Convert products API from Express to Next.js (app/api/products/)
- [x] Create cart API routes (app/api/cart/)
- [x] Create order placement API (app/api/orders/)
- [x] Create promotions API (app/api/promotions/)

## Phase 2: Frontend Integration
- [ ] Update cart page to use API calls (app/cart/page.tsx)
- [ ] Update cart drawer component (components/cart-drawer.tsx)
- [ ] Add JWT token handling in frontend
- [ ] Implement error handling and loading states

## Phase 3: Advanced Features
- [ ] Add stock validation and quantity limits
- [ ] Handle cart merging for guest users upon login
- [ ] Implement frontend state management
- [ ] Add error boundaries

## Phase 4: Testing & Refinement
- [ ] Test API routes and database queries
- [ ] Test cart persistence and merging functionality
- [ ] Performance optimization
- [ ] Security review
