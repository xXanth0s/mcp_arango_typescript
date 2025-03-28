export interface Order {
  _key?: string;
  _id?: string;
  _rev?: string;
  orderDate: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

// Edge between order and item
export interface OrderItem {
  _key?: string;
  _id?: string;
  _rev?: string;
  _from: string; // Order ID
  _to: string;   // Item ID
  amount: number; // Quantity of items
}

// Edge between user and order
export interface UserOrder {
  _key?: string;
  _id?: string;
  _rev?: string;
  _from: string; // User ID
  _to: string;   // Order ID
  purchaseDate: string;
} 