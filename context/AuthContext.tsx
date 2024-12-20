import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Alert } from 'react-native';
import { router } from 'expo-router';

// Create a base URL that you can easily change
const API_URL = 'https://savermart.in';

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
    }
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
    register: (name: string, email: string, password: string) => Promise<boolean>;
    login: (email: string, password: string) => Promise<boolean>;
    loginWithGoogle: (idToken: string) => Promise<boolean>;
    logout: () => Promise<void>;
    updatePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

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
            const response = await axios.get(`${API_URL}/api/auth/me`, authHeader);
            setUser(response.data.user);
            console.log('[INFO] User profile loaded successfully');
        } catch (error: any) {
            logger.error('Loading user profile', error);
            if (error.response?.status === 401) {
                console.log('[INFO] Token invalid or expired, redirecting to login');
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
            const response = await axios.post(`${API_URL}/api/auth/register`, {
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
                    error.response.data.message || 'Registration failed. Please try again.'
                );
            } else {
                console.error('[ERROR] Network error during registration');
                Alert.alert('Error', 'Network error. Please check your connection.');
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
            const response = await axios.post(`${API_URL}/api/auth/login`, {
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
                    error.response.data.message || 'Login failed. Please try again.'
                );
            } else {
                console.error('[ERROR] Network error during login');
                Alert.alert('Error', 'Network error. Please check your connection.');
            }
            return false;
        } finally {
            logger.end('User login', startTime);
            setLoading(false);
        }
    };

    const loginWithGoogle = async (idToken: string) => {
        const startTime = logger.start('Google login');
        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/api/auth/google/token`, {
                idToken,
            });

            await AsyncStorage.setItem('token', response.data.token);
            setUser(response.data.user);
            console.log('[INFO] Google login successful');
            return true;
        } catch (error: any) {
            logger.error('Google login', error);
            Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to login with Google'
            );
            return false;
        } finally {
            logger.end('Google login', startTime);
            setLoading(false);
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
            const response = await axios.post(
                `${API_URL}/api/auth/reset-password`,
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
                Alert.alert('Error', 'Network error. Please check your connection.');
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