import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import React from 'react';
import { Colors } from '../../constants/Colors';

export default function TabsLayout() {
	const { items } = useCart();

	const getTotalItems = () => {
		return items.reduce((total, item) => total + item.quantity, 0);
	};

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarActiveTintColor: Colors.light.tint,
				tabBarInactiveTintColor: Colors.light.tabIconDefault,
				tabBarBadgeStyle: { 
					backgroundColor: Colors.light.tint,
					fontSize: 12,
					minWidth: 16,
					minHeight: 16,
					lineHeight: 16,
				},
			}}
		>
			<Tabs.Screen
				name='index'
				options={{
					title: 'Home',
					tabBarIcon: ({ color, size }) => (
						<Ionicons
							name='home-outline'
							size={size}
							color={color}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name='cart'
				options={{
					title: 'Cart',
					tabBarIcon: ({ color, size }) => (
						<Ionicons
							name='cart-outline'
							size={size}
							color={color}
						/>
					),
					tabBarBadge: getTotalItems() || undefined,
				}}
			/>
			<Tabs.Screen
				name='account'
				options={{
					title: 'Account',
					tabBarIcon: ({ color, size }) => (
						<Ionicons
							name='person-outline'
							size={size}
							color={color}
						/>
					),
				}}
			/>
		</Tabs>
	);
}
