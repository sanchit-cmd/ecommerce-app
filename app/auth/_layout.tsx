import { Stack } from 'expo-router';
import { Colors } from '../../constants/Colors';

export default function AuthLayout() {
	return (
		<Stack
			screenOptions={{
				headerStyle: {
					backgroundColor: Colors.light.tint,
				},
				headerTintColor: '#fff',
				headerTitleStyle: {
					fontWeight: 'bold',
				},
				animation: 'ios',
			}}
		>
			<Stack.Screen
				name='login'
				options={{
					title: 'Login',
					headerShown: false,
					animation: 'ios',
				}}
			/>
			<Stack.Screen
				name='register'
				options={{
					title: 'Register',
					headerShown: false,
					animation: 'ios',
				}}
			/>
		</Stack>
	);
}
