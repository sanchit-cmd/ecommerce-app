import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	TextInput,
	Alert,
	ActivityIndicator,
	SafeAreaView,
	Platform,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import axios from 'axios';
import { API_URL } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '@/constants/axiosInstance';

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

export default function AddressScreen() {
	const router = useRouter();
	const [addresses, setAddresses] = useState<Address[]>([]);
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [editingAddress, setEditingAddress] = useState<Address | null>(null);
	const [phoneVerificationStep, setPhoneVerificationStep] = useState<
		'phone' | 'otp' | 'form'
	>(editingAddress ? 'form' : 'phone');
	const [phoneNumber, setPhoneNumber] = useState('');
	const [otp, setOtp] = useState('');
	const [verificationLoading, setVerificationLoading] = useState(false);
	const [formData, setFormData] = useState({
		fullName: '',
		address: '',
		city: '',
		state: '',
		country: '',
		postalCode: '',
		phoneNumber: '',
	});

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

	const loadAddresses = async () => {
		try {
			setLoading(true);
			const authHeader = await getAuthHeader();
			if (!authHeader) return;

			const response = await axiosInstance.get(`/addresses`, authHeader);

			if (response.data.success) {
				const addressData =
					response.data.addresses || response.data.data || [];
				setAddresses(Array.isArray(addressData) ? addressData : []);
			} else {
				setAddresses([]);
			}
		} catch (error: any) {
			console.error('Error loading addresses:', error);
			Alert.alert(
				'Error',
				error.response?.data?.message || 'Failed to load addresses'
			);
			setAddresses([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadAddresses();
	}, []);

	const handleSendOTP = async () => {
		if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
			Alert.alert('Error', 'Please enter a valid 10-digit phone number');
			return;
		}

		try {
			setVerificationLoading(true);
			const response = await axiosInstance.post(`/mobile-otp/send-otp`, {
				phoneNumber,
			});

			if (response.data.success) {
				Alert.alert('Success', 'OTP sent successfully');
				setPhoneVerificationStep('otp');
			}
		} catch (error: any) {
			Alert.alert(
				'Error',
				error.response?.data?.message || 'Failed to send OTP'
			);
		} finally {
			setVerificationLoading(false);
		}
	};

	const handleVerifyOTP = async () => {
		if (!otp) {
			Alert.alert('Error', 'Please enter the OTP');
			return;
		}

		try {
			setVerificationLoading(true);
			const response = await axiosInstance.post(
				`/mobile-otp/verify-otp`,
				{
					phoneNumber,
					otp,
				}
			);

			if (response.data.success) {
				Alert.alert('Success', 'Phone number verified successfully');
				setPhoneVerificationStep('form');
				setFormData(prev => ({ ...prev, phoneNumber }));
			}
		} catch (error: any) {
			Alert.alert(
				'Error',
				error.response?.data?.message || 'Failed to verify OTP'
			);
		} finally {
			setVerificationLoading(false);
		}
	};

	const handleSubmit = async () => {
		try {
			if (
				!formData.fullName ||
				!formData.address ||
				!formData.city ||
				!formData.state ||
				!formData.country ||
				!formData.postalCode ||
				!formData.phoneNumber
			) {
				Alert.alert('Error', 'Please fill in all fields');
				return;
			}

			const authHeader = await getAuthHeader();
			if (!authHeader) return;

			if (editingAddress) {
				const response = await axiosInstance.put(
					`/addresses/${editingAddress._id}`,
					formData,
					authHeader
				);

				if (response.data.success) {
					Alert.alert('Success', 'Address updated successfully');
					setEditingAddress(null);
				}
			} else {
				const response = await axiosInstance.post(
					`/addresses`,
					formData,
					authHeader
				);

				if (response.data.success) {
					Alert.alert('Success', 'Address added successfully');
				}
			}

			setShowForm(false);
			setPhoneVerificationStep('phone');
			setPhoneNumber('');
			setOtp('');
			setFormData({
				fullName: '',
				address: '',
				city: '',
				state: '',
				country: '',
				postalCode: '',
				phoneNumber: '',
			});
			await loadAddresses();
		} catch (error: any) {
			Alert.alert(
				'Error',
				error.response?.data?.message || 'Failed to save address'
			);
		}
	};

	const handleEdit = (address: Address) => {
		setEditingAddress(address);
		setFormData({
			fullName: address.fullName,
			address: address.address,
			city: address.city,
			state: address.state,
			country: address.country,
			postalCode: address.postalCode,
			phoneNumber: address.phoneNumber,
		});
		setPhoneVerificationStep('form');
		setShowForm(true);
	};

	const handleDelete = async (addressId: string) => {
		Alert.alert(
			'Delete Address',
			'Are you sure you want to delete this address?',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Delete',
					style: 'destructive',
					onPress: async () => {
						try {
							const authHeader = await getAuthHeader();
							if (!authHeader) return;

							const response = await axiosInstance.delete(
								`/addresses/${addressId}`,
								authHeader
							);

							if (response.data.success) {
								Alert.alert(
									'Success',
									'Address deleted successfully'
								);
								loadAddresses();
							}
						} catch (error: any) {
							Alert.alert('Error', 'Failed to delete address');
						}
					},
				},
			]
		);
	};

	const renderVerificationForm = () => {
		if (phoneVerificationStep === 'phone') {
			return (
				<View style={styles.verificationContainer}>
					<View style={styles.verificationCard}>
						<Text style={styles.verificationTitle}>
							Verify Phone Number
						</Text>
						<TextInput
							style={styles.input}
							placeholder='Enter Phone Number'
							value={phoneNumber}
							onChangeText={setPhoneNumber}
							keyboardType='phone-pad'
							maxLength={10}
						/>
						<TouchableOpacity
							style={[
								styles.button,
								styles.saveButton,
								verificationLoading && styles.disabledButton,
							]}
							onPress={handleSendOTP}
							disabled={verificationLoading}
						>
							{verificationLoading ? (
								<ActivityIndicator color='#fff' />
							) : (
								<Text
									style={[
										styles.buttonText,
										styles.saveButtonText,
									]}
								>
									Send OTP
								</Text>
							)}
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.button, styles.cancelButton]}
							onPress={() => {
								setShowForm(false);
								setPhoneNumber('');
							}}
						>
							<Text style={styles.buttonText}>Cancel</Text>
						</TouchableOpacity>
					</View>
				</View>
			);
		}

		if (phoneVerificationStep === 'otp') {
			return (
				<View style={styles.verificationContainer}>
					<View style={styles.verificationCard}>
						<Text style={styles.verificationTitle}>Enter OTP</Text>
						<Text style={styles.verificationSubtitle}>
							Enter the OTP sent to {phoneNumber}
						</Text>
						<TextInput
							style={styles.input}
							placeholder='Enter OTP'
							value={otp}
							onChangeText={setOtp}
							keyboardType='number-pad'
							maxLength={6}
						/>
						<TouchableOpacity
							style={[
								styles.button,
								styles.saveButton,
								verificationLoading && styles.disabledButton,
							]}
							onPress={handleVerifyOTP}
							disabled={verificationLoading}
						>
							{verificationLoading ? (
								<ActivityIndicator color='#fff' />
							) : (
								<Text
									style={[
										styles.buttonText,
										styles.saveButtonText,
									]}
								>
									Verify OTP
								</Text>
							)}
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.button, styles.cancelButton]}
							onPress={() => {
								setPhoneVerificationStep('phone');
								setOtp('');
							}}
						>
							<Text style={styles.buttonText}>Back</Text>
						</TouchableOpacity>
					</View>
				</View>
			);
		}

		return (
			<ScrollView style={styles.formContainer}>
				<TextInput
					style={styles.input}
					placeholder='Full Name'
					value={formData.fullName}
					onChangeText={text =>
						setFormData({ ...formData, fullName: text })
					}
				/>
				<TextInput
					style={styles.input}
					placeholder='Address'
					value={formData.address}
					onChangeText={text =>
						setFormData({ ...formData, address: text })
					}
					multiline
				/>
				<TextInput
					style={styles.input}
					placeholder='City'
					value={formData.city}
					onChangeText={text =>
						setFormData({ ...formData, city: text })
					}
				/>
				<TextInput
					style={styles.input}
					placeholder='State'
					value={formData.state}
					onChangeText={text =>
						setFormData({ ...formData, state: text })
					}
				/>
				<TextInput
					style={styles.input}
					placeholder='Country'
					value={formData.country}
					onChangeText={text =>
						setFormData({ ...formData, country: text })
					}
				/>
				<TextInput
					style={styles.input}
					placeholder='Postal Code'
					value={formData.postalCode}
					onChangeText={text =>
						setFormData({ ...formData, postalCode: text })
					}
					keyboardType='number-pad'
				/>
				<TextInput
					style={styles.input}
					placeholder='Phone Number'
					value={formData.phoneNumber}
					editable={false}
				/>
				<View style={styles.formButtons}>
					<TouchableOpacity
						style={[styles.button, styles.cancelButton]}
						onPress={() => {
							setShowForm(false);
							setEditingAddress(null);
							setPhoneVerificationStep('phone');
							setFormData({
								fullName: '',
								address: '',
								city: '',
								state: '',
								country: '',
								postalCode: '',
								phoneNumber: '',
							});
						}}
					>
						<Text style={styles.buttonText}>Cancel</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[styles.button, styles.saveButton]}
						onPress={handleSubmit}
					>
						<Text
							style={[styles.buttonText, styles.saveButtonText]}
						>
							{editingAddress ? 'Update' : 'Save'}
						</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		);
	};

	return (
		<SafeAreaView style={styles.container}>
			<Stack.Screen
				options={{
					headerShown: false,
				}}
			/>

			<View style={styles.header}>
				<TouchableOpacity
					style={styles.backButton}
					onPress={() => router.back()}
				>
					<Ionicons
						name='arrow-back'
						size={24}
						color={Colors.light.text}
					/>
				</TouchableOpacity>
				<Text style={styles.headerTitle}>My Addresses</Text>
			</View>

			{loading ? (
				<View style={styles.loadingContainer}>
					<ActivityIndicator size='large' color={Colors.light.tint} />
				</View>
			) : showForm ? (
				renderVerificationForm()
			) : (
				<>
					<ScrollView style={styles.addressList}>
						{addresses.map(address => (
							<View key={address._id} style={styles.addressCard}>
								<View style={styles.addressInfo}>
									<Text style={styles.name}>
										{address.fullName}
									</Text>
									<Text style={styles.addressText}>
										{address.address}
									</Text>
									<Text style={styles.addressText}>
										{address.city}, {address.state}{' '}
										{address.postalCode}
									</Text>
									<Text style={styles.addressText}>
										{address.country}
									</Text>
									<Text style={styles.phone}>
										{address.phoneNumber}
									</Text>
								</View>
								<View style={styles.addressActions}>
									<TouchableOpacity
										style={styles.actionButton}
										onPress={() => handleEdit(address)}
									>
										<Ionicons
											name='create-outline'
											size={20}
											color={Colors.light.tint}
										/>
									</TouchableOpacity>
									<TouchableOpacity
										style={styles.actionButton}
										onPress={() =>
											handleDelete(address._id)
										}
									>
										<Ionicons
											name='trash-outline'
											size={20}
											color='#ff3b30'
										/>
									</TouchableOpacity>
								</View>
							</View>
						))}
					</ScrollView>
					<TouchableOpacity
						style={styles.addButton}
						onPress={() => {
							setShowForm(true);
							setPhoneVerificationStep('phone');
						}}
					>
						<Text style={styles.addButtonText}>
							Add New Address
						</Text>
					</TouchableOpacity>
				</>
			)}
		</SafeAreaView>
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
		paddingTop: Platform.OS === 'android' ? 40 : 16,
		backgroundColor: Colors.light.background,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
	},
	backButton: {
		marginRight: 12,
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		color: Colors.light.text,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	addressList: {
		flex: 1,
		padding: 16,
	},
	addressCard: {
		backgroundColor: '#fff',
		borderRadius: 12,
		padding: 16,
		marginBottom: 16,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	addressInfo: {
		flex: 1,
	},
	name: {
		fontSize: 16,
		fontWeight: '600',
		marginBottom: 4,
		color: Colors.light.text,
	},
	addressText: {
		fontSize: 14,
		color: '#666',
		marginBottom: 2,
	},
	phone: {
		fontSize: 14,
		color: '#666',
		marginTop: 4,
	},
	addressActions: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		marginTop: 12,
		borderTopWidth: 1,
		borderTopColor: '#eee',
		paddingTop: 12,
	},
	actionButton: {
		padding: 8,
		marginLeft: 16,
	},
	addButton: {
		backgroundColor: Colors.light.tint,
		padding: 16,
		margin: 16,
		borderRadius: 12,
		alignItems: 'center',
	},
	addButtonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
	},
	formContainer: {
		flex: 1,
		padding: 16,
	},
	verificationContainer: {
		flex: 1,
		padding: 16,
		justifyContent: 'center',
	},
	verificationCard: {
		backgroundColor: '#fff',
		borderRadius: 12,
		padding: 20,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	verificationTitle: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 20,
		color: Colors.light.text,
		textAlign: 'center',
	},
	verificationSubtitle: {
		fontSize: 16,
		color: Colors.light.text,
		marginBottom: 24,
		textAlign: 'center',
	},
	input: {
		backgroundColor: '#fff',
		borderRadius: 12,
		padding: 12,
		marginBottom: 16,
		fontSize: 16,
		borderWidth: 1,
		borderColor: '#eee',
	},
	formButtons: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 16,
	},
	button: {
		padding: 16,
		borderRadius: 12,
		alignItems: 'center',
		marginVertical: 8,
	},
	cancelButton: {
		backgroundColor: '#f8f8f8',
	},
	saveButton: {
		backgroundColor: Colors.light.tint,
	},
	buttonText: {
		fontSize: 16,
		fontWeight: '600',
		color: Colors.light.text,
	},
	saveButtonText: {
		color: '#fff',
	},
	disabledButton: {
		opacity: 0.7,
	},
});
