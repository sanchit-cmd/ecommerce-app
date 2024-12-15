import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import React from 'react';
import { Colors } from '../../constants/Colors';

export default function _layout() {
	const { totalItems } = useCart();

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarActiveTintColor: Colors.light.tint,
				tabBarInactiveTintColor: Colors.light.tabIconDefault,
				tabBarBadgeStyle: { backgroundColor: Colors.light.tint },
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
					tabBarBadge: totalItems > 0 ? totalItems : undefined,
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
