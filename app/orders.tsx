import React, { useEffect, useState } from 'react';
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	Image,
	TouchableOpacity,
	ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { API_URL } from '../constants/Api';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OrderItem {
	product: {
		_id: string;
		name: string;
		price: number;
		image: string;
		discountPrice?: number;
	};
	quantity: number;
}

interface Order {
	_id: string;
	products: OrderItem[];
	totalPrice: number;
	status: string;
	createdAt: string;
	updatedAt: string;
}

const OrdersScreen = () => {
	const { user } = useAuth();
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);

	const getAuthHeader = async () => {
		const token = await AsyncStorage.getItem('token');
		if (!token) {
			router.push('/auth/login');
			return null;
		}
		return {
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
		};
	};

	const fetchOrders = async () => {
		try {
			setLoading(true);
			const authHeader = await getAuthHeader();
			if (!authHeader) return;

			const response = await axios.get(`${API_URL}/orders`, authHeader);
			setOrders(response.data);
		} catch (error: any) {
			console.error('Error fetching orders:', error);
			if (error.response) {
				console.error('Error response:', error.response.data);
			}
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (!user) {
			router.replace('/auth/login');
			return;
		}
		fetchOrders();
	}, [user]);

	const formatDate = (date: string) => {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case 'pending':
				return '#FFA500';
			case 'processing':
				return '#4169E1';
			case 'shipped':
				return '#9370DB';
			case 'delivered':
				return Colors.light.tint;
			default:
				return '#666';
		}
	};

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color={Colors.light.tint} />
			</View>
		);
	}

	if (!orders || orders.length === 0) {
		return (
			<View style={styles.emptyContainer}>
				<Ionicons
					name='receipt-outline'
					size={64}
					color={Colors.light.tint}
				/>
				<Text style={styles.emptyText}>No orders yet</Text>
				<TouchableOpacity
					style={styles.shopButton}
					onPress={() => router.push('/')}
				>
					<Text style={styles.shopButtonText}>Start Shopping</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<FlatList
				data={orders}
				keyExtractor={item => item._id}
				renderItem={({ item }) => (
					<TouchableOpacity
						onPress={() => router.push(`/order/${item._id}`)}
						activeOpacity={0.7}
					>
						<View style={styles.orderCard}>
							<View style={styles.orderHeader}>
								<Text style={styles.orderId}>Order #{item._id}</Text>
								<View
									style={[
										styles.statusBadge,
										{
											backgroundColor: getStatusColor(
												item.status
											),
										},
									]}
								>
									<Text style={styles.statusText}>
										{item.status}
									</Text>
								</View>
							</View>

							<Text style={styles.date}>{formatDate(item.createdAt)}</Text>

							<View style={styles.itemsList}>
								{item.products.map(orderItem => (
									<View
										key={orderItem.product._id}
										style={styles.orderItem}
									>
										<Image
											source={{ uri: orderItem.product.image }}
											style={styles.itemImage}
										/>
										<View style={styles.itemDetails}>
											<Text style={styles.itemName}>
												{orderItem.product.name}
											</Text>
											<Text style={styles.itemQuantity}>
												Qty: {orderItem.quantity}
											</Text>
											<Text style={styles.itemPrice}>
												₹{Math.floor(orderItem.product.discountPrice || orderItem.product.price)}
											</Text>
										</View>
									</View>
								))}
							</View>

							<View style={styles.orderFooter}>
								<Text style={styles.totalLabel}>Total:</Text>
								<Text style={styles.totalAmount}>
									₹{Math.floor(item.totalPrice)}
								</Text>
							</View>
						</View>
					</TouchableOpacity>
				)}
				contentContainerStyle={styles.listContent}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.light.background,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: Colors.light.background,
	},
	listContent: {
		padding: 16,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: Colors.light.background,
		padding: 20,
	},
	emptyText: {
		fontSize: 18,
		color: Colors.light.text,
		marginTop: 16,
		marginBottom: 24,
	},
	shopButton: {
		backgroundColor: Colors.light.tint,
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 8,
	},
	shopButtonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
	},
	orderCard: {
		backgroundColor: '#fff',
		borderRadius: 12,
		padding: 16,
		marginBottom: 16,
		borderWidth: 1,
		borderColor: '#eee',
	},
	orderHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 8,
	},
	orderId: {
		fontSize: 16,
		fontWeight: '600',
		color: Colors.light.text,
	},
	statusBadge: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 4,
	},
	statusText: {
		color: '#fff',
		fontSize: 12,
		fontWeight: '500',
	},
	date: {
		fontSize: 14,
		color: '#666',
		marginBottom: 16,
	},
	itemsList: {
		borderTopWidth: 1,
		borderTopColor: '#eee',
		paddingTop: 16,
	},
	orderItem: {
		flexDirection: 'row',
		marginBottom: 12,
	},
	itemImage: {
		width: 60,
		height: 60,
		borderRadius: 8,
		marginRight: 12,
	},
	itemDetails: {
		flex: 1,
	},
	itemName: {
		fontSize: 16,
		fontWeight: '500',
		color: Colors.light.text,
		marginBottom: 4,
	},
	itemQuantity: {
		fontSize: 14,
		color: '#666',
	},
	itemPrice: {
		fontSize: 14,
		color: Colors.light.tint,
		fontWeight: '500',
	},
	orderFooter: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: 16,
		paddingTop: 16,
		borderTopWidth: 1,
		borderTopColor: '#eee',
	},
	totalLabel: {
		fontSize: 16,
		fontWeight: '600',
		color: Colors.light.text,
	},
	totalAmount: {
		fontSize: 18,
		fontWeight: '600',
		color: Colors.light.tint,
	},
});

export default OrdersScreen;
