import React from 'react';
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	Image,
	TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

const OrdersScreen = () => {
	const { orders } = useOrders();
	const { user } = useAuth();

	// Redirect if not logged in
	React.useEffect(() => {
		if (!user) {
			router.replace('/auth/login');
		}
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
				keyExtractor={item => item.id}
				renderItem={({ item }) => (
					<View style={styles.orderCard}>
						<View style={styles.orderHeader}>
							<Text style={styles.orderId}>Order #{item.id}</Text>
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

						<Text style={styles.date}>{formatDate(item.date)}</Text>

						<View style={styles.itemsList}>
							{item.items.map(orderItem => (
								<View
									key={orderItem.id}
									style={styles.orderItem}
								>
									<Image
										source={{ uri: orderItem.image }}
										style={styles.itemImage}
									/>
									<View style={styles.itemDetails}>
										<Text style={styles.itemName}>
											{orderItem.name}
										</Text>
										<Text style={styles.itemQuantity}>
											Qty: {orderItem.quantity}
										</Text>
										<Text style={styles.itemPrice}>
											${orderItem.price.toFixed(2)}
										</Text>
									</View>
								</View>
							))}
						</View>

						<View style={styles.orderFooter}>
							<Text style={styles.totalLabel}>Total:</Text>
							<Text style={styles.totalAmount}>
								${item.total.toFixed(2)}
							</Text>
						</View>
					</View>
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
