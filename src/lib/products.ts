
export interface Product {
  id: string; // Firestore document ID
  name: string;
  price: number;
  quantity: number; // Stock quantity
  barcode: string; // The barcode number
}

export interface CartItem extends Product {
  quantity: number; // Quantity in cart
}

// This mock data is now DEPRECATED and no longer used in the shopping flow.
// The app now fetches products directly from the store owner's Firestore inventory.
// It is kept here for reference or potential fallback testing.
export const mockProducts: Omit<Product, 'quantity'>[] = [
  { id: '8851934005615', name: 'Instant Noodles', price: 104, barcode: '8851934005615' },
  { id: '4902102072615', name: 'Green Tea (Bottle)', price: 208, barcode: '4902102072615' },
  { id: '9556072002361', name: 'Crispy Crackers', price: 312, barcode: '9556072002361' },
  { id: '8992761131158', name: 'Chocolate Bar', price: 150, barcode: '8992761131158' },
  { id: '073333104328', name: 'Sparkling Water', price: 183, barcode: '073333104328' },
  { id: '030000326456', name: 'Oatmeal Cereal', price: 374, barcode: '030000326456' },
  { id: '049000050103', name: 'Classic Potato Chips', price: 331, barcode: '049000050103' },
  { id: '012000809938', name: 'Cola Can (6-pack)', price: 456, barcode: '012000809938' },
  { id: '725999230588', name: 'Organic Apples (Bag)', price: 415, barcode: '725999230588' },
];

// This function is now DEPRECATED.
export const findProductByBarcode = (barcode: string): Omit<Product, 'quantity'> | undefined => {
  console.warn("DEPRECATED: findProductByBarcode is using mock data.");
  return mockProducts.find(p => p.id === barcode);
};
