import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { Alert } from 'react-native';
import { useAuth } from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://10.0.2.2:5000';

interface CartItem {
	_id: string;
	name: string;
	price: number;
	discountPrice?: number;
	image: string;
	quantity: number;
	variant?: Variant;
}

interface CartContextType {
	items: CartItem[];
	loading: boolean;
	addToCart: (product: any, quantity: number) => Promise<void>;
	removeFromCart: (productId: string) => Promise<void>;
	updateQuantity: (productId: string, quantity: number) => Promise<void>;
	clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
	const [items, setItems] = useState<CartItem[]>([]);
	const [loading, setLoading] = useState(false);
	const { user } = useAuth();

	useEffect(() => {
		if (user) {
			fetchCartItems();
		} else {
			setItems([]);
		}
	}, [user]);

	const getAuthHeader = async () => {
		const token = await AsyncStorage.getItem('token');
		return {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		};
	};

	const fetchCartItems = async () => {
		try {
			setLoading(true);
			const authHeader = await getAuthHeader();
			const response = await axios.get(
				`${API_URL}/api/carts`,
				authHeader
			);

			if (response.data.success) {
				// Transform the cart items to match the frontend format
				const formattedItems = response.data.cart.map((item: any) => ({
					_id: item.productId._id,
					name: item.productId.name,
					price: item.productId.price,
					discountPrice: item.productId.discountPrice,
					image: item.productId.images
						? item.productId.images[0]
						: item.productId.image,
					quantity: item.quantity,
				}));
				console.log('Formatted cart items:', formattedItems);
				setItems(formattedItems);
			} else {
				Alert.alert('Error', response.data.message);
			}
		} catch (error: any) {
			console.error('Error fetching cart:', error);
			Alert.alert(
				'Error',
				error.response?.data?.message || 'Failed to fetch cart items'
			);
		} finally {
			setLoading(false);
		}
	};

	const addToCart = async (product: any, quantity: number) => {
		try {
			setLoading(true);
			const authHeader = await getAuthHeader();
			console.log('Adding to cart:', {
				productId: product.productId,
				quantity,
			});

			const response = await axios.post(
				`${API_URL}/api/carts/add`,
				{
					productId: product.productId,
					quantity: quantity,
				},
				authHeader
			);

			if (response.data.success) {
				console.log('Add to cart response:', response.data);
				await fetchCartItems();
			} else {
				Alert.alert('Error', response.data.message);
			}
		} catch (error: any) {
			console.error(
				'Error adding to cart:',
				error.response?.data || error
			);
			Alert.alert(
				'Error',
				error.response?.data?.message || 'Failed to add item to cart'
			);
		} finally {
			setLoading(false);
		}
	};

	const removeFromCart = async (productId: string) => {
		try {
			setLoading(true);
			const authHeader = await getAuthHeader();
			const response = await axios.post(
				`${API_URL}/api/carts/remove`,
				{ productId },
				authHeader
			);

			if (response.data.success) {
				await fetchCartItems();
			} else {
				Alert.alert('Error', response.data.message);
			}
		} catch (error: any) {
			console.error('Error removing from cart:', error);
			Alert.alert(
				'Error',
				error.response?.data?.message ||
					'Failed to remove item from cart'
			);
		} finally {
			setLoading(false);
		}
	};

	const updateQuantity = async (productId: string, quantity: number) => {
		try {
			setLoading(true);
			if (quantity === 0) {
				await removeFromCart(productId);
				return;
			}

			const authHeader = await getAuthHeader();
			const response = await axios.post(
				`${API_URL}/api/carts/update`,
				{
					productId,
					quantity,
				},
				authHeader
			);

			if (response.data.success) {
				await fetchCartItems();
			} else {
				Alert.alert('Error', response.data.message);
			}
		} catch (error: any) {
			console.error('Error updating quantity:', error);
			Alert.alert(
				'Error',
				error.response?.data?.message || 'Failed to update quantity'
			);
		} finally {
			setLoading(false);
		}
	};

	const clearCart = async () => {
		try {
			setLoading(true);
			const authHeader = await getAuthHeader();
			const response = await axios.post(
				`${API_URL}/api/carts/clear`,
				{},
				authHeader
			);

			if (response.data.success) {
				setItems([]);
			} else {
				Alert.alert('Error', response.data.message);
			}
		} catch (error: any) {
			console.error('Error clearing cart:', error);
			Alert.alert(
				'Error',
				error.response?.data?.message || 'Failed to clear cart'
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<CartContext.Provider
			value={{
				items,
				loading,
				addToCart,
				removeFromCart,
				updateQuantity,
				clearCart,
			}}
		>
			{children}
		</CartContext.Provider>
	);
};

export const useCart = () => {
	const context = useContext(CartContext);
	if (!context) {
		throw new Error('useCart must be used within a CartProvider');
	}
	return context;
};
