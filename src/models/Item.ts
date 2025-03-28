export interface Item {
  _key?: string;
  _id?: string;
  _rev?: string;
  name: string;
  description: string;
  sku: string; 
  price: number;
  stock: number;
  createdAt: string;
  updatedAt: string;
} 