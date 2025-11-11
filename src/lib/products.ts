export interface Product {
  id: string; // This is the barcode
  name: string;
  price: number;
}

export interface CartItem extends Product {
  quantity: number;
}

// Prices converted from USD to INR (approx. 1 USD = 83 INR)
export const mockProducts: Product[] = [
  { id: '8851934005615', name: 'Instant Noodles', price: 104 },
  { id: '4902102072615', name: 'Green Tea (Bottle)', price: 208 },
  { id: '9556072002361', name: 'Crispy Crackers', price: 312 },
  { id: '8992761131158', name: 'Chocolate Bar', price: 150 },
  { id: '073333104328', name: 'Sparkling Water', price: 183 },
  { id: '030000326456', name: 'Oatmeal Cereal', price: 374 },
  { id: '049000050103', name: 'Classic Potato Chips', price: 331 },
  { id: '012000809938', name: 'Cola Can (6-pack)', price: 456 },
  { id: '725999230588', name: 'Organic Apples (Bag)', price: 415 },
];

export const findProductByBarcode = (barcode: string): Product | undefined => {
  return mockProducts.find(p => p.id === barcode);
};
