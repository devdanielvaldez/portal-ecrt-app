import { api } from '@/src/lib/api';

export type PaymentMethod = 'TAP' | 'CHIP';
export type CardBrand = 'VISA' | 'MASTERCARD' | 'OTHER';

export interface Transaction {
  id: string;
  terminal_id: string;
  amount: number;
  payment_method: PaymentMethod;
  card_brand: CardBrand;
  latitude: number;
  longitude: number;
  timestamp: string;
}

// Mock data based on the user's screenshot
const generateMockTransactions = (): Transaction[] => {
  const transactions: Transaction[] = [];
  const baseLat = 18.48260400;
  const baseLng = -69.94444700;
  const terminalId = '945296f3-4c50-4b46-9e4c-8bb62bad4c1e';

  const amounts = [250.00, 170.00, 26.00, 170.00, 25.00, 250.00, 175.50, 25.00, 26.00, 250.00, 170.00, 25.00, 250.00, 170.00, 140.00];
  const brands: CardBrand[] = ['OTHER', 'VISA', 'VISA', 'VISA', 'OTHER', 'OTHER', 'VISA', 'VISA', 'MASTERCARD', 'OTHER', 'VISA', 'MASTERCARD', 'OTHER', 'OTHER', 'VISA'];
  const methods: PaymentMethod[] = ['TAP', 'TAP', 'TAP', 'TAP', 'TAP', 'TAP', 'TAP', 'TAP', 'TAP', 'TAP', 'TAP', 'TAP', 'TAP', 'TAP', 'TAP'];

  for (let i = 0; i < amounts.length; i++) {
    transactions.push({
      id: Math.random().toString(36).substring(2, 15),
      terminal_id: terminalId,
      amount: amounts[i],
      payment_method: methods[i],
      card_brand: brands[i],
      latitude: baseLat + (Math.random() - 0.5) * 0.01,
      longitude: baseLng + (Math.random() - 0.5) * 0.01,
      timestamp: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    });
  }
  
  // Add some more random ones to make the dashboard look good
  for (let i = 0; i < 85; i++) {
    transactions.push({
      id: Math.random().toString(36).substring(2, 15),
      terminal_id: terminalId,
      amount: Math.floor(Math.random() * 500) + 10,
      payment_method: Math.random() > 0.8 ? 'CHIP' : 'TAP',
      card_brand: Math.random() > 0.5 ? 'VISA' : Math.random() > 0.5 ? 'MASTERCARD' : 'OTHER',
      latitude: baseLat + (Math.random() - 0.5) * 0.05,
      longitude: baseLng + (Math.random() - 0.5) * 0.05,
      timestamp: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    });
  }

  return transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const transactionService = {
  getAll: async () => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Return mock data since we don't have a real endpoint yet
    return {
      success: true,
      data: generateMockTransactions(),
      meta: {
        total_items: 100,
        current_page: 1,
        total_pages: 1
      }
    };
  }
};
