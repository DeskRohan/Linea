
export interface Product {
  id: string; // This is the barcode
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  imageHint: string;
}

export interface CartItem extends Product {
  quantity: number;
}

// This mock data is now only used on the customer-facing scanner page.
// The store inventory is managed in Firestore.
export const mockProducts: Omit<Product, 'quantity'>[] = [
  { id: '8851934005615', name: 'Instant Noodles', price: 104, imageUrl: 'https://picsum.photos/seed/noodle/200/200', imageHint: 'instant noodles' },
  { id: '4902102072615', name: 'Green Tea (Bottle)', price: 208, imageUrl: 'https://picsum.photos/seed/tea/200/200', imageHint: 'green tea' },
  { id: '9556072002361', name: 'Crispy Crackers', price: 312, imageUrl: 'https://picsum.photos/seed/crackers/200/200', imageHint: 'crackers food' },
  { id: '8992761131158', name: 'Chocolate Bar', price: 150, imageUrl: 'https://picsum.photos/seed/chocolate/200/200', imageHint: 'chocolate bar' },
  { id: '073333104328', name: 'Sparkling Water', price: 183, imageUrl: 'https://picsum.photos/seed/water/200/200', imageHint: 'sparkling water' },
  { id: '030000326456', name: 'Oatmeal Cereal', price: 374, imageUrl: 'https://picsum.photos/seed/oatmeal/200/200', imageHint: 'oatmeal cereal' },
  { id: '049000050103', name: 'Classic Potato Chips', price: 331, imageUrl: 'https://picsum.photos/seed/chips/200/200', imageHint: 'potato chips' },
  { id: '012000809938', name: 'Cola Can (6-pack)', price: 456, imageUrl: 'https://picsum.photos/seed/cola/200/200', imageHint: 'soda can' },
  { id: '725999230588', name: 'Organic Apples (Bag)', price: 415, imageUrl: 'https://picsum.photos/seed/apples/200/200', imageHint: 'apples fruit' },
];

export const findProductByBarcode = (barcode: string): Omit<Product, 'quantity'> | undefined => {
  return mockProducts.find(p => p.id === barcode);
};
