import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import axiosInstance from '@/constants/axiosInstance';
import { useGoogleAuth } from '../utils/googleAuth'; // Correct import for googleAuth
import { getRandomBytesAsync } from 'expo-random';
import * as Crypto from 'expo-crypto';

// Logging utility
const logger = {
	start: (action: string) => {
		console.log(`[START] ${action} at ${new Date().toISOString()}`);
		return Date.now();
	},
	end: (action: string, startTime: number) => {
		const endTime = Date.now();
		const duration = endTime - startTime;
		console.log(`[COMPLETE] ${action} at ${new Date().toISOString()}`);
		console.log(`[DURATION] ${duration}ms`);
	},
	error: (action: string, error: any) => {
		console.error(`[ERROR] ${action}:`, error);
		if (error.response) {
			console.error('[ERROR] Response data:', error.response.data);
			console.error('[ERROR] Response status:', error.response.status);
		}
	},
};

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
	loginWithGoogle: () => Promise<boolean>;
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

	const { promptAsync, response, request } = useGoogleAuth(); // Use destructured promptAsync

	const loadUser = async () => {
		const startTime = logger.start('Loading user profile');
		try {
			const token = await AsyncStorage.getItem('token');
			if (!token) {
				console.log('[INFO] No token found, skipping profile load');
				setLoading(false);
				return;
			}

			const authHeader = await getAuthHeader();
			const response = await axiosInstance.get(`/auth/me`, authHeader);
			setUser(response.data.user);
			console.log('[INFO] User profile loaded successfully');
		} catch (error: any) {
			logger.error('Loading user profile', error);
			if (error.response?.status === 401) {
				console.log(
					'[INFO] Token invalid or expired, redirecting to login'
				);
				await AsyncStorage.removeItem('token');
				router.replace('/auth/login');
			}
		} finally {
			logger.end('Loading user profile', startTime);
			setLoading(false);
		}
	};

	useEffect(() => {
		loadUser();
	}, []);

	const register = async (name: string, email: string, password: string) => {
		const startTime = logger.start('User registration');
		setLoading(true);
		try {
			const response = await axiosInstance.post(`/auth/register`, {
				name,
				email,
				password,
			});
			console.log('[INFO] Verification email sent successfully');
			Alert.alert(
				'Verification Email Sent',
				'Please check your email to verify your account before logging in.',
				[{ text: 'OK' }]
			);
			return true;
		} catch (error: any) {
			logger.error('User registration', error);
			if (error.response) {
				Alert.alert(
					'Error',
					error.response.data.message ||
						'Registration failed. Please try again.'
				);
			} else {
				console.error('[ERROR] Network error during registration');
				Alert.alert(
					'Error',
					'Network error. Please check your connection.'
				);
			}
			return false;
		} finally {
			logger.end('User registration', startTime);
			setLoading(false);
		}
	};

	const login = async (email: string, password: string) => {
		const startTime = logger.start('User login');
		setLoading(true);
		try {
			const response = await axiosInstance.post(`/auth/login`, {
				email,
				password,
			});
			await AsyncStorage.setItem('token', response.data.token);
			setUser(response.data.user);
			console.log('[INFO] Login successful');
			return true;
		} catch (error: any) {
			logger.error('User login', error);
			if (error.response) {
				Alert.alert(
					'Error',
					error.response.data.message ||
						'Login failed. Please try again.'
				);
			} else {
				console.error('[ERROR] Network error during login');
				Alert.alert(
					'Error',
					'Network error. Please check your connection.'
				);
			}
			return false;
		} finally {
			logger.end('User login', startTime);
			setLoading(false);
		}
	};

	const getUserInfo = async (token: any) => {
		//absent token
		if (!token) return;
		//present token
		try {
			const response = await fetch(
				'https://www.googleapis.com/userinfo/v2/me',
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			const user = await response.json();
			console.log(user);
			//store user information  in Asyncstorage
			// await AsyncStorage.setItem("user", JSON.stringify(user));
			// setUserInfo(user);
		} catch (error) {
			console.error(
				'Failed to fetch user data:'
				// response.status,
				// response.statusText
			);
		}
	};

	const loginWithGoogle = async () => {
		const startTime = logger.start('Google login');
		setLoading(true);
		try {
			const result = await promptAsync();
			console.log(result);
			console.log('OAuth Result:', JSON.stringify(result, null, 2));

			if (result?.type === 'success' && result?.params?.code) {
				const response = await axiosInstance.post(
					'/auth/mobile/google',
					{
						code: result.params.code,
						code_verifier: request?.codeVerifier, // Add code verifier from request object
						redirect_uri:
							'http://localhost:8081/auth/google/callback',
					}
				);

				console.log(response);

				if (response.status === 200) {
					await AsyncStorage.setItem('token', response.data.token);
					setUser(response.data.user);
					router.replace('/');
					return true;
				}
			}
			return false;
		} catch (error) {
			logger.error('Google login', error);
			return false;
		} finally {
			setLoading(false);
			logger.end('Google login', startTime);
		}
	};

	const logout = async () => {
		const startTime = logger.start('User logout');
		setLoading(true);
		try {
			await AsyncStorage.removeItem('token');
			setUser(null);
			console.log('[INFO] Logout successful');
			router.replace('/auth/login');
		} catch (error) {
			logger.error('User logout', error);
			Alert.alert('Error', 'Failed to logout. Please try again.');
		} finally {
			logger.end('User logout', startTime);
			setLoading(false);
		}
	};

	const updatePassword = async (oldPassword: string, newPassword: string) => {
		const startTime = logger.start('Password update');
		setLoading(true);
		try {
			const authHeader = await getAuthHeader();
			const response = await axiosInstance.post(
				`/auth/reset-password`,
				{
					oldPassword,
					newPassword,
				},
				authHeader
			);
			console.log('[INFO] Password updated successfully');
			Alert.alert('Success', 'Password updated successfully');
			return true;
		} catch (error: any) {
			logger.error('Password update', error);
			if (error.response) {
				Alert.alert(
					'Error',
					error.response.data.message || 'Failed to update password'
				);
			} else {
				console.error('[ERROR] Network error during password update');
				Alert.alert(
					'Error',
					'Network error. Please check your connection.'
				);
			}
			return false;
		} finally {
			logger.end('Password update', startTime);
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
