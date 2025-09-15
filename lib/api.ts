const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new ApiError(response.status, errorData.message || 'Request failed');
  }

  return response.json();
}

// Cart API functions
export const cartApi = {
  getCart: () => apiRequest<{ success: boolean; data: any[] }>('/api/cart'),

  addToCart: (productId: number, variantId?: number, quantity = 1) =>
    apiRequest<{ success: boolean; message: string }>('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, variantId, quantity }),
    }),

  updateCartItem: (cartId: number, quantity: number) =>
    apiRequest<{ success: boolean; message: string }>(`/api/cart/${cartId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }),

  removeCartItem: (cartId: number) =>
    apiRequest<{ success: boolean; message: string }>(`/api/cart/${cartId}`, {
      method: 'DELETE',
    }),
};

// Products API functions
export const productsApi = {
  getProducts: (params?: any) => {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return apiRequest<{ success: boolean; data: any }>('/api/products' + (queryString ? `?${queryString}` : ''));
  },

  getProduct: (id: number) =>
    apiRequest<{ success: boolean; data: any }>(`/api/products/${id}`),

  getFeaturedProducts: () =>
    apiRequest<{ success: boolean; data: any[] }>('/api/products/featured'),

  getCategories: () =>
    apiRequest<{ success: boolean; data: any[] }>('/api/products/categories'),

  requestRestockNotification: (productId: number, variantId?: number) =>
    apiRequest<{ success: boolean; message: string }>('/api/products/notify-restock', {
      method: 'POST',
      body: JSON.stringify({ productId, variantId }),
    }),
};

// Orders API functions
export const ordersApi = {
  placeOrder: (orderData: any) =>
    apiRequest<{ success: boolean; message: string; data: any }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),
};

// Promotions API functions
export const promotionsApi = {
  validatePromoCode: (promoCode: string, subtotal: number) =>
    apiRequest<{ success: boolean; data: any }>('/api/promotions/validate', {
      method: 'POST',
      body: JSON.stringify({ promoCode, subtotal }),
    }),
};
