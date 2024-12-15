import React, { createContext, useContext, useState } from 'react';

interface Order {
  id: string;
  items: any[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  address: any;
  paymentMethod: any;
  createdAt: Date;
}

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'status' | 'createdAt'>) => void;
  getOrder: (id: string) => Order | undefined;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);

  const addOrder = (orderData: Omit<Order, 'id' | 'status' | 'createdAt'>) => {
    const newOrder: Order = {
      ...orderData,
      id: `order-${Date.now()}`,
      status: 'pending',
      createdAt: new Date(),
    };
    setOrders((prevOrders) => [newOrder, ...prevOrders]);
    return newOrder;
  };

  const getOrder = (id: string) => {
    return orders.find((order) => order.id === id);
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, getOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}
