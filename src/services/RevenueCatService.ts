export type SubscriptionProduct = {
  id: string;
  title: string;
  description: string;
  price: number;
  period: 'weekly' | 'monthly' | 'annual';
};

export interface SubscriptionStatus {
  isActive: boolean;
  isPremium: boolean;
  activeSubscriptions: string[];
  expirationDate?: Date;
}

class RevenueCatWebService {
  private products: SubscriptionProduct[] = [
    { id: 'com.magic1frog2.TastyPath.Weekly', title: 'Semanal', description: 'Acceso premium semanal', price: 4.99, period: 'weekly' },
    { id: 'com.magic1frog2.TastyPath.Monthly', title: 'Mensual', description: 'Acceso premium mensual', price: 7.99, period: 'monthly' },
    { id: 'com.magic1frog2.TastyPath.Annual', title: 'Anual', description: 'Acceso premium anual', price: 79.99, period: 'annual' },
  ];

  async initialize(_userId?: string): Promise<boolean> {
      return true;
  }

  async loadOfferings(): Promise<SubscriptionProduct[]> {
      return this.products;
  }

  getProducts(): SubscriptionProduct[] {
    return this.products;
  }

  getProduct(productId: string): SubscriptionProduct | undefined {
    return this.products.find(p => p.id === productId);
  }

  async purchaseProduct(_productId: string): Promise<{ success: boolean; error?: string }> {
        return { success: true };
  }

  async restorePurchases(): Promise<{ success: boolean; error?: string }> {
        return { success: true };
  }

  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
      return {
        isActive: false,
        isPremium: false,
      activeSubscriptions: [],
      };
    }
  }

export const revenueCatService = new RevenueCatWebService();
export default revenueCatService;
