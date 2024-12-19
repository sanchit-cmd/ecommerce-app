import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	StyleSheet,
	Image,
	ActivityIndicator,
	Alert,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { router } from 'expo-router';
import { Colors } from '../constants/Colors';
import { API_URL } from '../constants/Api';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { razorpayService } from '../services/razorpay';
import RazorpayCheckout from 'react-native-razorpay';

interface Address {
	_id: string;
	fullName: string;
	address: string;
	city: string;
	state: string;
	country: string;
	postalCode: string;
	phoneNumber: string;
}

interface CartItem {
	_id: string;
	name: string;
	price: number;
	discountPrice?: number;
	quantity: number;
	image: string;
}

const DELIVERY_FEE = 0;

export default function CheckoutScreen() {
	const { items: cart, clearCart } = useCart();
	const { user } = useAuth();
	const [addresses, setAddresses] = useState<Address[]>([]);
	const [selectedAddress, setSelectedAddress] = useState<Address | null>(
		null
	);
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

	const fetchAddresses = async () => {
		try {
			setLoading(true);
			const authHeader = await getAuthHeader();
			if (!authHeader) return;

			const response = await axios.get(
				`${API_URL}/addresses`,
				authHeader
			);

			if (response.data.success) {
				const addressData =
					response.data.addresses || response.data.data || [];
				setAddresses(Array.isArray(addressData) ? addressData : []);
				if (addressData.length > 0) {
					setSelectedAddress(addressData[0]);
				}
			} else {
				setAddresses([]);
			}
		} catch (error: any) {
			console.error('Error fetching addresses:', error);
			if (error.response) {
				console.error('Error response:', error.response.data);
			}
			setAddresses([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchAddresses();
	}, []);

	const calculateSubtotal = () => {
		return cart.reduce((total: number, item: CartItem) => {
			return total + item.price * item.quantity;
		}, 0);
	};

	const calculateDiscount = () => {
		return cart.reduce((total: number, item: CartItem) => {
			if (item.discountPrice) {
				return (
					total + (item.price - item.discountPrice) * item.quantity
				);
			}
			return total;
		}, 0);
	};

	const calculateTotal = () => {
		const subtotal = calculateSubtotal();
		const discount = calculateDiscount();
		return subtotal - discount + DELIVERY_FEE;
	};

	const handlePlaceOrder = async () => {
		if (!selectedAddress) {
			Alert.alert('Error', 'Please select a delivery address');
			return;
		}

		try {
			const totalAmount = calculateTotal();
			console.log('Creating order with total amount:', totalAmount);

			const orderResponse = await razorpayService.createOrder(
				totalAmount,
				cart.map(item => ({
					product: item._id,
					quantity: item.quantity,
					price: item.discountPrice || item.price,
				})),
				selectedAddress._id
			);

			console.log('Order created:', orderResponse);

			const options = {
				description: 'Payment for your order',
				image: require('../assets/images/logo.jpg'),
				currency: 'INR',
				key: 'rzp_live_fK3Jqtu1JBnJbg',
				amount: orderResponse.amount,
				name: 'savermart',
				order_id: orderResponse.razorpayOrderId,
				prefill: {
					email: user?.email || '',
					contact: selectedAddress.phoneNumber,
					name: selectedAddress.fullName,
				},
				theme: { color: Colors.light.tint },
			};

			console.log('Opening Razorpay with options:', options);

			try {
				const data = await RazorpayCheckout.open(options);
				console.log('Payment successful:', data);

				try {
					const verificationResponse =
						await razorpayService.verifyPayment({
							razorpay_order_id: data.razorpay_order_id,
							razorpay_payment_id: data.razorpay_payment_id,
							razorpay_signature: data.razorpay_signature,
							orderId: orderResponse.orderId,
						});

					console.log('Payment verified:', verificationResponse);

					if (verificationResponse.message === 'Payment successful') {
						clearCart();
						Alert.alert('Success', 'Order placed successfully!', [
							{
								text: 'OK',
								onPress: () => router.replace('/orders'),
							},
						]);
					}
				} catch (verifyError: any) {
					console.error(
						'Payment verification failed:',
						verifyError.response?.data || verifyError
					);
					Alert.alert(
						'Error',
						'Payment verification failed. Please contact support.'
					);
				}
			} catch (paymentError: any) {
				console.error('Payment failed:', paymentError);
				Alert.alert('Error', 'Payment failed. Please try again.');
			}
		} catch (error: any) {
			console.error(
				'Error creating order:',
				error.response?.data || error
			);
			Alert.alert(
				'Error',
				error.response?.data?.message ||
					'Failed to create order. Please try again.'
			);
		}
	};

	if (!user) {
		return (
			<View style={styles.container}>
				<Text>Please login to continue</Text>
				<TouchableOpacity onPress={() => router.push('/auth/login')}>
					<Text style={styles.loginButton}>Login</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<ScrollView style={styles.container}>
			<View style={styles.section}>
				<View style={styles.sectionHeader}>
					<Text style={styles.sectionTitle}>Delivery Address</Text>
					<TouchableOpacity
						style={styles.addAddressButton}
						onPress={() => router.push('/address')}
					>
						<Text style={styles.addAddressText}>+ Add New</Text>
					</TouchableOpacity>
				</View>

				{loading ? (
					<ActivityIndicator
						size='small'
						color={Colors.light.primary}
						style={styles.loader}
					/>
				) : addresses.length === 0 ? (
					<View style={styles.emptyAddress}>
						<Ionicons
							name='location-outline'
							size={24}
							color={Colors.light.primary}
						/>
						<Text style={styles.emptyAddressText}>
							No addresses found
						</Text>
						<Text style={styles.emptyAddressSubtext}>
							Add an address to continue
						</Text>
					</View>
				) : (
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={styles.addressScrollContainer}
					>
						{addresses.map((address: Address) => (
							<TouchableOpacity
								key={address._id}
								style={[
									styles.addressCard,
									selectedAddress?._id === address._id &&
										styles.selectedAddress,
								]}
								onPress={() => setSelectedAddress(address)}
							>
								{selectedAddress?._id === address._id && (
									<View style={styles.selectedBadge}>
										<Ionicons
											name='checkmark-circle'
											size={20}
											color={Colors.light.primary}
										/>
									</View>
								)}
								<Text style={styles.name}>
									{address.fullName}
								</Text>
								<Text style={styles.addressText}>
									{address.address}
								</Text>
								<Text style={styles.addressText}>
									{address.city}, {address.state}
								</Text>
								<Text style={styles.addressText}>
									{address.postalCode}
								</Text>
								<Text style={styles.phone}>
									{address.phoneNumber}
								</Text>
							</TouchableOpacity>
						))}
					</ScrollView>
				)}
			</View>

			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Order Summary</Text>
				{cart.map((item: CartItem) => (
					<View key={item._id} style={styles.orderItem}>
						<Image
							source={{ uri: item.image }}
							style={styles.productImage}
						/>
						<View style={styles.productInfo}>
							<Text style={styles.itemName}>{item.name}</Text>
							<View style={styles.priceContainer}>
								<Text style={styles.discountPrice}>
									₹{item.discountPrice || item.price}
								</Text>
								{item.discountPrice && (
									<Text style={styles.originalPrice}>
										₹{item.price}
									</Text>
								)}
								<Text style={styles.quantity}>
									× {item.quantity}
								</Text>
							</View>
						</View>
					</View>
				))}
			</View>

			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Price Details</Text>
				<View style={styles.priceRow}>
					<Text>Subtotal</Text>
					<Text>₹{calculateSubtotal()}</Text>
				</View>
				<View style={styles.priceRow}>
					<Text>Discount</Text>
					<Text style={styles.discountText}>
						- ₹{calculateDiscount()}
					</Text>
				</View>
				<View style={styles.priceRow}>
					<Text>Delivery Fee</Text>
					<Text style={styles.freeDelivery}>FREE</Text>
				</View>
				<View style={[styles.priceRow, styles.totalRow]}>
					<Text style={styles.totalText}>Total Amount</Text>
					<Text style={styles.totalAmount}>₹{calculateTotal()}</Text>
				</View>
			</View>

			<TouchableOpacity
				style={[
					styles.placeOrderButton,
					(!selectedAddress || cart.length === 0) &&
						styles.disabledButton,
				]}
				onPress={handlePlaceOrder}
				disabled={!selectedAddress || cart.length === 0}
			>
				<Text style={styles.placeOrderText}>Place Order</Text>
			</TouchableOpacity>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		padding: 15,
	},
	section: {
		marginBottom: 20,
		backgroundColor: '#fff',
		borderRadius: 8,
		padding: 15,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 15,
		color: '#333',
	},
	sectionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 15,
	},
	loader: {
		marginVertical: 20,
	},
	emptyAddress: {
		alignItems: 'center',
		padding: 20,
		borderWidth: 1,
		borderColor: '#eee',
		borderRadius: 8,
		borderStyle: 'dashed',
	},
	emptyAddressText: {
		fontSize: 16,
		color: '#333',
		marginTop: 10,
	},
	emptyAddressSubtext: {
		fontSize: 14,
		color: '#666',
		marginTop: 5,
	},
	addressScrollContainer: {
		paddingBottom: 10,
	},
	addressCard: {
		width: 280,
		marginRight: 15,
		padding: 15,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: '#ddd',
		backgroundColor: '#fff',
		position: 'relative',
	},
	selectedAddress: {
		borderColor: Colors.light.primary,
		backgroundColor: '#f0f9ff',
	},
	selectedBadge: {
		position: 'absolute',
		top: 10,
		right: 10,
		backgroundColor: '#fff',
		borderRadius: 12,
		padding: 2,
	},
	name: {
		fontSize: 16,
		fontWeight: '600',
		marginBottom: 8,
		color: Colors.light.text,
		paddingRight: 24,
	},
	addressText: {
		fontSize: 14,
		color: '#666',
		marginBottom: 2,
	},
	phone: {
		fontSize: 14,
		color: '#666',
		marginTop: 8,
	},
	addAddressButton: {
		backgroundColor: Colors.light.background,
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 6,
		borderWidth: 1,
		borderColor: Colors.light.primary,
	},
	addAddressText: {
		color: Colors.light.primary,
		fontSize: 14,
		fontWeight: '500',
	},
	orderItem: {
		flexDirection: 'row',
		padding: 10,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
		alignItems: 'center',
	},
	productImage: {
		width: 70,
		height: 70,
		borderRadius: 8,
		marginRight: 15,
	},
	productInfo: {
		flex: 1,
	},
	itemName: {
		fontSize: 16,
		marginBottom: 5,
		color: '#333',
	},
	priceContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	discountPrice: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#333',
	},
	originalPrice: {
		fontSize: 14,
		color: '#999',
		textDecorationLine: 'line-through',
		marginLeft: 8,
	},
	quantity: {
		fontSize: 16,
		color: '#666',
		marginLeft: 8,
	},
	priceRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingVertical: 8,
	},
	discountText: {
		color: '#4CAF50',
	},
	totalRow: {
		borderTopWidth: 1,
		borderTopColor: '#eee',
		marginTop: 10,
		paddingTop: 15,
	},
	totalText: {
		fontSize: 16,
		fontWeight: 'bold',
	},
	totalAmount: {
		fontSize: 18,
		fontWeight: 'bold',
		color: Colors.light.primary,
	},
	placeOrderButton: {
		backgroundColor: Colors.light.primary,
		padding: 18,
		borderRadius: 8,
		alignItems: 'center',
		marginVertical: 20,
	},
	disabledButton: {
		backgroundColor: '#ccc',
	},
	placeOrderText: {
		color: '#fff',
		fontSize: 18,
		fontWeight: 'bold',
	},
	loginButton: {
		color: Colors.light.primary,
		fontSize: 16,
		textDecorationLine: 'underline',
		marginTop: 10,
	},
	freeDelivery: {
		color: '#4CAF50',
		fontWeight: '500',
	},
});
