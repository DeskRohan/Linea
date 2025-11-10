export interface Product {
  id: string; // This is the barcode
  name: string;
  price: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export const mockProducts: Product[] = [
  { id: '8851934005615', name: 'Instant Noodles', price: 1.25 },
  { id: '4902102072615', name: 'Green Tea (Bottle)', price: 2.50 },
  { id: '9556072002361', name: 'Crispy Crackers', price: 3.75 },
  { id: '8992761131158', name: 'Chocolate Bar', price: 1.80 },
  { id: '073333104328', name: 'Sparkling Water', price: 2.20 },
  { id: '030000326456', name: 'Oatmeal Cereal', price: 4.50 },
  { id: '049000050103', name: 'Classic Potato Chips', price: 3.99 },
  { id: '012000809938', name: 'Cola Can (6-pack)', price: 5.49 },
  { id: '725999230588', name: 'Organic Apples (Bag)', price: 4.99 },
];

export const findProductByBarcode = (barcode: string): Product | undefined => {
  return mockProducts.find(p => p.id === barcode);
};
