import { API_URL } from '../constants/Api';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getAuthHeader = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('Authentication required');
    return {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
    };
};

export const razorpayService = {
    createOrder: async (totalPrice: number, products: any[], addressId: string) => {
        try {
            const authHeader = await getAuthHeader();
            console.log('Creating order with:', {
                totalPrice,
                products,
                addressId,
                headers: authHeader.headers
            });

            const response = await axios.post(
                `${API_URL}/api/payments/create-order`,
                {
                    totalPrice: Math.round(totalPrice), // Convert to paise
                    products,
                    addressId
                },
                authHeader
            );

            console.log('Order creation response:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('Error creating Razorpay order:', error.response?.data || error.message);
            throw error;
        }
    },

    verifyPayment: async (paymentData: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
        orderId: string;
    }) => {
        try {
            const authHeader = await getAuthHeader();
            console.log('Verifying payment:', paymentData);

            const response = await axios.post(
                `${API_URL}/api/payments/verify`,
                paymentData,
                authHeader
            );

            console.log('Payment verification response:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('Error verifying payment:', error.response?.data || error.message);
            throw error;
        }
    },

    getRecentSales: async () => {
        try {
            const authHeader = await getAuthHeader();
            const response = await axios.get(
                `${API_URL}/api/payments/recent-sales`,
                authHeader
            );
            return response.data;
        } catch (error: any) {
            console.error('Error fetching recent sales:', error.response?.data || error.message);
            throw error;
        }
    },

    getMonthlySales: async () => {
        try {
            const authHeader = await getAuthHeader();
            const response = await axios.get(
                `${API_URL}/api/payments/monthly-sales`,
                authHeader
            );
            return response.data;
        } catch (error: any) {
            console.error('Error fetching monthly sales:', error.response?.data || error.message);
            throw error;
        }
    }
}; 