import React from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/Colors';

export default function AccountScreen() {
	const router = useRouter();
	const { logout, user } = useAuth();

	const menuItems = [
		{
			id: 'orders',
			title: 'My Orders',
			icon: 'receipt-outline',
			onPress: () => router.push('/orders'),
		},
		{
			id: 'address',
			title: 'Manage Addresses',
			icon: 'location-outline',
			onPress: () => router.push('/address'),
		},
		{
			id: 'password',
			title: 'Change Password',
			icon: 'key-outline',
			onPress: () => router.push('/change-password'),
		},
		{
			id: 'logout',
			title: 'Logout',
			icon: 'log-out-outline',
			onPress: logout,
		},
	];

	const MenuItem = ({ item }) => (
		<TouchableOpacity style={styles.menuItem} onPress={item.onPress}>
			<View style={styles.menuItemContent}>
				<Ionicons
					name={item.icon}
					size={24}
					color={Colors.light.text}
				/>
				<Text style={styles.menuItemText}>{item.title}</Text>
			</View>
			<Ionicons
				name='chevron-forward'
				size={24}
				color={Colors.light.text}
			/>
		</TouchableOpacity>
	);

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.headerTitle}>Account</Text>
			</View>

			<ScrollView style={styles.content}>
				<View style={styles.profileSection}>
					<View style={styles.profileIcon}>
						<Ionicons
							name='person'
							size={40}
							color={Colors.light.tint}
						/>
					</View>
					<Text style={styles.profileName}>
						{user?.name || 'User'}
					</Text>
					<Text style={styles.profileEmail}>
						{user?.email || 'email@example.com'}
					</Text>
				</View>

				<View style={styles.menuSection}>
					{menuItems.map(item => (
						<MenuItem key={item.id} item={item} />
					))}
				</View>
			</ScrollView>
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
	content: {
		flex: 1,
		marginTop: 20,
	},
	profileSection: {
		alignItems: 'center',
		padding: 20,
		marginBottom: 20,
	},
	profileIcon: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: '#f5f5f5',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 12,
	},
	profileName: {
		fontSize: 20,
		fontWeight: '600',
		color: Colors.light.text,
		marginBottom: 4,
	},
	profileEmail: {
		fontSize: 14,
		color: Colors.light.text,
		opacity: 0.7,
	},
	menuSection: {
		paddingHorizontal: 16,
	},
	menuItem: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
	},
	menuItemContent: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	menuItemText: {
		fontSize: 16,
		color: Colors.light.text,
		marginLeft: 12,
	},
});
