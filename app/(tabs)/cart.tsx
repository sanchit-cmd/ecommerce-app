import React, { useMemo } from 'react';
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	Image,
	TouchableOpacity,
	Alert,
	ActivityIndicator,
} from 'react-native';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';

// Helper function to get the effective price
const getEffectivePrice = (item: any) => {
	return item.discountPrice || item.price;
};

export default function CartScreen() {
	const router = useRouter();
	const { items, removeFromCart, updateQuantity, loading } = useCart();
	const { user } = useAuth();

	// Calculate total using discounted prices
	const total = useMemo(() => {
		return items.reduce(
			(sum, item) => sum + getEffectivePrice(item) * item.quantity,
			0
		);
	}, [items]);

	// Calculate savings
	const savings = useMemo(() => {
		return items.reduce((sum, item) => {
			if (item.discountPrice) {
				return sum + (item.price - item.discountPrice) * item.quantity;
			}
			return sum;
		}, 0);
	}, [items]);

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size='large' color={Colors.light.tint} />
			</View>
		);
	}

	const handleCheckout = () => {
		if (items.length === 0) {
			Alert.alert(
				'Cart Empty',
				'Add some items to your cart before checking out.'
			);
			return;
		}

		if (!user) {
			Alert.alert(
				'Login Required',
				'Please login to continue with checkout',
				[
					{
						text: 'Cancel',
						style: 'cancel',
					},
					{
						text: 'Login',
						onPress: () => router.push('/auth/login'),
					},
				]
			);
			return;
		}

		// Navigate to checkout
		router.push('/checkout');
	};

	if (items.length === 0) {
		return (
			<View style={styles.emptyCart}>
				<Ionicons
					name='cart-outline'
					size={64}
					color={Colors.light.tint}
				/>
				<Text style={styles.emptyCartText}>Your cart is empty</Text>
				<TouchableOpacity
					style={styles.continueShopping}
					onPress={() => router.push('/')}
				>
					<Text style={styles.continueShoppingText}>
						Continue Shopping
					</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.headerTitle}>Shopping Cart</Text>
			</View>

			<ScrollView style={styles.cartItems}>
				{items.map(item => (
					<View key={item._id} style={styles.cartItem}>
						<View style={styles.imageContainer}>
							<Image
								source={{ uri: item.image }}
								style={styles.itemImage}
								resizeMode='cover'
							/>
						</View>
						<View style={styles.itemInfo}>
							<Text style={styles.itemName}>{item.name}</Text>
							<View style={styles.priceContainer}>
								<Text style={styles.itemPrice}>
									₹{getEffectivePrice(item).toFixed(2)}
								</Text>
								{item.discountPrice && (
									<Text style={styles.originalPrice}>
										₹{item.price.toFixed(2)}
									</Text>
								)}
							</View>
							<View style={styles.quantityContainer}>
								<TouchableOpacity
									style={styles.quantityButton}
									onPress={() =>
										updateQuantity(
											item._id,
											Math.max(0, item.quantity - 1)
										)
									}
									disabled={loading}
								>
									<Ionicons
										name='remove'
										size={20}
										color={Colors.light.text}
									/>
								</TouchableOpacity>
								<Text style={styles.quantity}>
									{item.quantity}
								</Text>
								<TouchableOpacity
									style={styles.quantityButton}
									onPress={() =>
										updateQuantity(
											item._id,
											item.quantity + 1
										)
									}
									disabled={loading}
								>
									<Ionicons
										name='add'
										size={20}
										color={Colors.light.text}
									/>
								</TouchableOpacity>
								<TouchableOpacity
									style={styles.removeButton}
									onPress={() => removeFromCart(item._id)}
									disabled={loading}
								>
									<Ionicons
										name='trash-outline'
										size={20}
										color='#ff3b30'
									/>
								</TouchableOpacity>
							</View>
						</View>
					</View>
				))}
			</ScrollView>

			<View style={styles.footer}>
				<View style={styles.totalContainer}>
					<View>
						<Text style={styles.totalLabel}>Total:</Text>
						{savings > 0 && (
							<Text style={styles.savingsText}>
								You save: ₹{savings.toFixed(2)}
							</Text>
						)}
					</View>
					<Text style={styles.totalAmount}>₹{total.toFixed(2)}</Text>
				</View>
				<TouchableOpacity
					style={styles.checkoutButton}
					onPress={handleCheckout}
				>
					<Text style={styles.checkoutButtonText}>
						Proceed to Checkout
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.light.background,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 16,
		paddingTop: 44,
		backgroundColor: Colors.light.background,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
	},
	headerTitle: {
		fontSize: 24,
		fontWeight: 'bold',
		color: Colors.light.text,
	},
	cartItems: {
		flex: 1,
		padding: 16,
	},
	cartItem: {
		flexDirection: 'row',
		backgroundColor: Colors.light.background,
		borderRadius: 12,
		padding: 12,
		marginBottom: 16,
		borderWidth: 1,
		borderColor: '#eee',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	imageContainer: {
		width: 80,
		height: 80,
		borderRadius: 8,
		backgroundColor: '#f5f5f5',
		overflow: 'hidden',
	},
	itemImage: {
		width: '100%',
		height: '100%',
	},
	itemInfo: {
		flex: 1,
		marginLeft: 12,
	},
	itemName: {
		fontSize: 16,
		fontWeight: '600',
		color: Colors.light.text,
		marginBottom: 4,
	},
	priceContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		marginBottom: 4,
	},
	itemPrice: {
		fontSize: 16,
		color: Colors.light.tint,
		fontWeight: '600',
	},
	originalPrice: {
		fontSize: 14,
		color: '#666',
		textDecorationLine: 'line-through',
	},
	savingsText: {
		fontSize: 14,
		color: '#4CAF50',
		marginTop: 4,
	},
	quantityContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 8,
	},
	quantityButton: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: '#f5f5f5',
		justifyContent: 'center',
		alignItems: 'center',
	},
	quantity: {
		fontSize: 16,
		fontWeight: '600',
		marginHorizontal: 16,
		color: Colors.light.text,
	},
	removeButton: {
		marginLeft: 'auto',
		padding: 8,
	},
	emptyCart: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	emptyCartText: {
		fontSize: 18,
		color: Colors.light.text,
		marginTop: 16,
		marginBottom: 24,
	},
	continueShopping: {
		backgroundColor: Colors.light.tint,
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 8,
	},
	continueShoppingText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
	},
	footer: {
		padding: 16,
		backgroundColor: Colors.light.background,
		borderTopWidth: 1,
		borderTopColor: '#eee',
	},
	totalContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 16,
	},
	totalLabel: {
		fontSize: 18,
		color: Colors.light.text,
		fontWeight: '600',
	},
	totalAmount: {
		fontSize: 24,
		color: Colors.light.tint,
		fontWeight: '600',
	},
	checkoutButton: {
		backgroundColor: Colors.light.tint,
		padding: 16,
		borderRadius: 12,
		alignItems: 'center',
	},
	checkoutButtonText: {
		color: '#fff',
		fontSize: 18,
		fontWeight: '600',
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
