
export interface Product {
  id: string; // Firestore document ID
  name: string;
  price: number;
  quantity: number; // Stock quantity
  barcode: string; // The barcode number
  imageUrl: string;
  imageHint: string;
}

export interface CartItem extends Product {
  quantity: number; // Quantity in cart
}

// This mock data is now DEPRECATED and no longer used in the shopping flow.
// The app now fetches products directly from the store owner's Firestore inventory.
// It is kept here for reference or potential fallback testing.
export const mockProducts: Omit<Product, 'quantity'>[] = [
  { id: '8851934005615', name: 'Instant Noodles', price: 104, barcode: '8851934005615', imageUrl: 'https://picsum.photos/seed/noodle/200/200', imageHint: 'instant noodles' },
  { id: '4902102072615', name: 'Green Tea (Bottle)', price: 208, barcode: '4902102072615', imageUrl: 'https://picsum.photos/seed/tea/200/200', imageHint: 'green tea' },
  { id: '9556072002361', name: 'Crispy Crackers', price: 312, barcode: '9556072002361', imageUrl: 'https://picsum.photos/seed/crackers/200/200', imageHint: 'crackers food' },
  { id: '8992761131158', name: 'Chocolate Bar', price: 150, barcode: '8992761131158', imageUrl: 'https://picsum.photos/seed/chocolate/200/200', imageHint: 'chocolate bar' },
  { id: '073333104328', name: 'Sparkling Water', price: 183, barcode: '073333104328', imageUrl: 'https://picsum.photos/seed/water/200/200', imageHint: 'sparkling water' },
  { id: '030000326456', name: 'Oatmeal Cereal', price: 374, barcode: '030000326456', imageUrl: 'https://picsum.photos/seed/oatmeal/200/200', imageHint: 'oatmeal cereal' },
  { id: '049000050103', name: 'Classic Potato Chips', price: 331, barcode: '049000050103', imageUrl: 'https://picsum.photos/seed/chips/200/200', imageHint: 'potato chips' },
  { id: '012000809938', name: 'Cola Can (6-pack)', price: 456, barcode: '012000809938', imageUrl: 'https://picsum.photos/seed/cola/200/200', imageHint: 'soda can' },
  { id: '725999230588', name: 'Organic Apples (Bag)', price: 415, barcode: '725999230588', imageUrl: 'https://picsum.photos/seed/apples/200/200', imageHint: 'apples fruit' },
];

// This function is now DEPRECATED.
export const findProductByBarcode = (barcode: string): Omit<Product, 'quantity'> | undefined => {
  console.warn("DEPRECATED: findProductByBarcode is using mock data.");
  return mockProducts.find(p => p.id === barcode);
};
