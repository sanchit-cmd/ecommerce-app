import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Alert } from 'react-native';
import { router } from 'expo-router';

// Create a base URL that you can easily change
const API_URL = 'https://savermart.in';
// const API_URL = 'http://10.0.2.2:5000'; // for Android emulator
// const API_URL = 'http://localhost:5000'; // for iOS simulator
// const API_URL = 'http://YOUR_LOCAL_IP:5000'; // for physical device (e.g., 192.168.1.5)

// Add this helper function to get the token
const getAuthHeader = async () => {
	const token = await AsyncStorage.getItem('token');
	return {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	};
};

interface AuthContextType {
	user: any;
	loading: boolean;
	register: (
		name: string,
		email: string,
		password: string
	) => Promise<boolean>;
	login: (email: string, password: string) => Promise<boolean>;
	loginWithGoogle: (idToken: string) => Promise<boolean>;
	logout: () => Promise<void>;
	updatePassword: (
		oldPassword: string,
		newPassword: string
	) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	const loadUser = async () => {
		try {
			const token = await AsyncStorage.getItem('token');
			if (!token) {
				setLoading(false);
				return;
			}

			const authHeader = await getAuthHeader();
			const response = await axios.get(
				`${API_URL}/api/auth/me`,
				authHeader
			);
			setUser(response.data.user);
		} catch (error: any) {
			if (error.response?.status === 401) {
				// Token is invalid or expired
				await AsyncStorage.removeItem('token');
				router.replace('/auth/login');
			}
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadUser();
	}, []);

	const register = async (name: string, email: string, password: string) => {
		setLoading(true);
		try {
			const response = await axios.post(`${API_URL}/api/auth/register`, {
				name,
				email,
				password,
			});
			Alert.alert(
				'Verification Email Sent',
				'Please check your email to verify your account before logging in.',
				[{ text: 'OK' }]
			);
			return true;
		} catch (error: any) {
			if (error.response) {
				Alert.alert(
					'Error',
					error.response.data.message ||
						'Registration failed. Please try again.'
				);
			} else {
				console.error('Network Error:', error);
				Alert.alert(
					'Error',
					'Network error. Please check your connection.'
				);
			}
			return false;
		} finally {
			setLoading(false);
		}
	};

	const login = async (email: string, password: string) => {
		setLoading(true);
		try {
			const response = await axios.post(`${API_URL}/api/auth/login`, {
				email,
				password,
			});
			await AsyncStorage.setItem('token', response.data.token);
			setUser(response.data.user);
			return true;
		} catch (error: any) {
			if (error.response) {
				Alert.alert(
					'Error',
					error.response.data.message ||
						'Login failed. Please try again.'
				);
			} else {
				console.error('Network Error:', error);
				Alert.alert(
					'Error',
					'Network error. Please check your connection.'
				);
			}
			return false;
		} finally {
			setLoading(false);
		}
	};

	const loginWithGoogle = async (idToken: string) => {
		setLoading(true);
		try {
			const response = await axios.post(
				`${API_URL}/api/auth/google/token`,
				{
					idToken,
				}
			);

			await AsyncStorage.setItem('token', response.data.token);
			setUser(response.data.user);
			return true;
		} catch (error: any) {
			console.error('Google Login Error:', error);
			Alert.alert(
				'Error',
				error.response?.data?.message || 'Failed to login with Google'
			);
			return false;
		} finally {
			setLoading(false);
		}
	};

	const logout = async () => {
		setLoading(true);
		try {
			await AsyncStorage.removeItem('token');
			setUser(null);
			router.replace('/auth/login');
		} catch (error) {
			console.error('Logout Error:', error);
			Alert.alert('Error', 'Failed to logout. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	const updatePassword = async (oldPassword: string, newPassword: string) => {
		setLoading(true);
		try {
			const authHeader = await getAuthHeader();
			const response = await axios.post(
				`${API_URL}/api/auth/reset-password`,
				{
					oldPassword,
					newPassword,
				},
				authHeader
			);
			Alert.alert('Success', 'Password updated successfully');
			return true;
		} catch (error: any) {
			if (error.response) {
				Alert.alert(
					'Error',
					error.response.data.message || 'Failed to update password'
				);
			} else {
				console.error('Network Error:', error);
				Alert.alert(
					'Error',
					'Network error. Please check your connection.'
				);
			}
			return false;
		} finally {
			setLoading(false);
		}
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				loading,
				register,
				login,
				loginWithGoogle,
				logout,
				updatePassword,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};
