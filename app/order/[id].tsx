import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/Colors';
import { API_URL } from '../../constants/Api';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

interface OrderItem {
    product: {
        _id: string;
        name: string;
        price: number;
        discountPrice?: number;
        image: string;
    };
    quantity: number;
}

interface Order {
    _id: string;
    products: OrderItem[];
    totalPrice: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    address: {
        fullName: string;
        address: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
        phoneNumber: string;
    };
}

export default function OrderDetailScreen() {
    const { id } = useLocalSearchParams();
    const { user } = useAuth();
    const [order, setOrder] = useState<Order | null>(null);
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

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const authHeader = await getAuthHeader();
            if (!authHeader) return;

            const response = await axios.get(`${API_URL}/orders/${id}`, authHeader);
            setOrder(response.data);
        } catch (error: any) {
            console.error('Error fetching order:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) {
            router.replace('/auth/login');
            return;
        }
        fetchOrder();
    }, [user, id]);

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return '#FFA500';
            case 'processing':
                return '#4169E1';
            case 'shipped':
                return '#9370DB';
            case 'delivered':
                return Colors.light.tint;
            default:
                return '#666';
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.tint} />
            </View>
        );
    }

    if (!order) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={64} color={Colors.light.tint} />
                <Text style={styles.errorText}>Order not found</Text>
            </View>
        );
    }

    return (
        <>
            <Stack.Screen 
                options={{
                    title: 'Order',
                    headerTitleStyle: {
                        color: Colors.light.text,
                    },
                }} 
            />
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.orderId}>Order #{order._id}</Text>
                    <View
                        style={[
                            styles.statusBadge,
                            { backgroundColor: getStatusColor(order.status) },
                        ]}
                    >
                        <Text style={styles.statusText}>{order.status}</Text>
                    </View>
                </View>

                <Text style={styles.date}>{formatDate(order.createdAt)}</Text>

                {order.address && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Delivery Address</Text>
                        <View style={styles.addressCard}>
                            <Text style={styles.name}>{order.address.fullName}</Text>
                            <Text style={styles.addressText}>{order.address.address}</Text>
                            <Text style={styles.addressText}>
                                {order.address.city}, {order.address.state}
                            </Text>
                            <Text style={styles.addressText}>{order.address.postalCode}</Text>
                            <Text style={styles.phone}>{order.address.phoneNumber}</Text>
                        </View>
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Items</Text>
                    {order.products.map(item => (
                        <View key={item.product._id} style={styles.orderItem}>
                            <Image
                                source={{ uri: item.product.image }}
                                style={styles.productImage}
                            />
                            <View style={styles.productInfo}>
                                <Text style={styles.productName}>
                                    {item.product.name}
                                </Text>
                                <Text style={styles.quantity}>
                                    Quantity: {item.quantity}
                                </Text>
                                <View style={styles.priceContainer}>
                                    <Text style={styles.price}>
                                        ₹{Math.floor(item.product.discountPrice || item.product.price)}
                                    </Text>
                                    {item.product.discountPrice && (
                                        <Text style={styles.originalPrice}>
                                            ₹{Math.floor(item.product.price)}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Price Details</Text>
                    <View style={styles.priceRow}>
                        <Text>Total Amount</Text>
                        <Text style={styles.totalAmount}>
                            ₹{Math.floor(order.totalPrice)}
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        color: Colors.light.text,
        marginTop: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    orderId: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.light.text,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    statusText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    date: {
        fontSize: 14,
        color: '#666',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    section: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        color: Colors.light.text,
    },
    addressCard: {
        padding: 12,
        backgroundColor: '#f8f8f8',
        borderRadius: 8,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
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
        marginTop: 8,
    },
    orderItem: {
        flexDirection: 'row',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 12,
    },
    productInfo: {
        flex: 1,
        justifyContent: 'space-between',
    },
    productName: {
        fontSize: 16,
        fontWeight: '500',
        color: Colors.light.text,
        marginBottom: 4,
    },
    quantity: {
        fontSize: 14,
        color: '#666',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    price: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.light.tint,
    },
    originalPrice: {
        fontSize: 14,
        color: '#666',
        textDecorationLine: 'line-through',
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.light.tint,
    },
}); 