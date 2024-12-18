import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { useSegments, useRouter } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { OrderProvider } from '../context/OrderContext';
import { LoadingScreen } from '../components/LoadingScreen';

// Separate component for protected route logic
function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const segments = useSegments();
	const router = useRouter();
	const { user, loading } = useAuth();

	useEffect(() => {
		if (!loading) {
			const inAuthGroup = segments[0] === 'auth';

			if (!user && !inAuthGroup) {
				// Redirect to login if user is not authenticated and not in auth group
				router.replace('/auth/login');
			} else if (user && inAuthGroup) {
				// Redirect to home if user is authenticated and in auth group
				router.replace('/');
			}
		}
	}, [user, loading, segments]);

	return <>{children}</>;
}

// Navigation component that uses authentication
function RootLayoutNav() {
	const router = useRouter();
	const { user, loading } = useAuth();
	const [showSplash, setShowSplash] = useState(true);

	useEffect(() => {
		const timer = setTimeout(() => {
			setShowSplash(false);
		}, 2000);

		return () => clearTimeout(timer);
	}, []);

	useEffect(() => {
		if (!loading && !user) {
			router.replace('/auth/login');
		} else if (!loading && user) {
			router.replace('/(tabs)');
		}
	}, [loading, user]);

	return (
		<>
			{showSplash && <LoadingScreen />}
			<Stack>
				<Stack.Screen name='(tabs)' options={{ headerShown: false }} />
				<Stack.Screen name='auth' options={{ headerShown: false }} />
				<Stack.Screen
					name='product/[id]'
					options={{
						headerShown: true,
						title: 'Product Details',
						headerBackTitle: 'Back',
						animation: "ios",
					}}
				/>
				<Stack.Screen
					name='category/[id]'
					options={{
						headerShown: true,
						title: 'Category',
						headerBackTitle: 'Back',
						animation: "ios",
					}}
				/>
				<Stack.Screen
					name='checkout'
					options={{
						headerShown: true,
						title: 'Checkout',
						headerBackTitle: 'Cart',
						presentation: 'card',
						animation: 'slide_from_bottom',
					}}
				/>
				<Stack.Screen
					name='orders'
					options={{
						headerShown: true,
						title: 'My Orders',
						headerBackTitle: 'Back',
						animation: "ios",
					}}
				/>
			</Stack>
		</>
	);
}

// Root layout that provides context
export default function RootLayout() {
	return (
		<AuthProvider>
			<CartProvider>
				<OrderProvider>
					<ProtectedRoute>
						<RootLayoutNav />
					</ProtectedRoute>
				</OrderProvider>
			</CartProvider>
		</AuthProvider>
	);
}
