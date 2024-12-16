import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
    Platform,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { productService } from '../services/api';

export default function FeaturedProductsScreen() {
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const loadProducts = async (newLoad = false) => {
        if (loading || (!hasMore && !newLoad)) return;

        try {
            setLoading(true);
            const response = await productService.getFeaturedProducts();

            if (response.success) {
                setProducts(response.products);
                setHasMore(false); // Since featured products don't have pagination
            }
        } catch (error) {
            console.error('Error loading featured products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts(true);
    }, []);

    const renderProduct = ({ item }) => {
        const productImage = Array.isArray(item.images) ? item.images[0] : item.image;
        
        return (
            <TouchableOpacity
                style={styles.productCard}
                onPress={() => router.push(`/product/${item._id}`)}
            >
                <View style={styles.imageContainer}>
                    <Image 
                        source={{ uri: productImage }}
                        style={styles.productImage}
                        resizeMode="cover"
                    />
                </View>
                <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                    <View style={styles.priceContainer}>
                        {item.discountPrice ? (
                            <>
                                <Text style={styles.originalPrice}>₹{item.price.toFixed(2)}</Text>
                                <Text style={styles.productPrice}>₹{item.discountPrice.toFixed(2)}</Text>
                            </>
                        ) : (
                            <Text style={styles.productPrice}>₹{item.price.toFixed(2)}</Text>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen 
                options={{
                    headerShown: false
                }}
            />
            
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Featured Products</Text>
            </View>

            {loading && page === 1 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.light.tint} />
                </View>
            ) : (
                <FlatList
                    data={products}
                    renderItem={renderProduct}
                    keyExtractor={item => item._id}
                    numColumns={2}
                    contentContainerStyle={styles.productGrid}
                    onEndReached={() => loadProducts()}
                    onEndReachedThreshold={0.5}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="cube-outline" size={64} color={Colors.light.tint} />
                            <Text style={styles.emptyText}>No featured products available</Text>
                        </View>
                    }
                    ListFooterComponent={
                        loading && page > 1 ? (
                            <ActivityIndicator 
                                size="small" 
                                color={Colors.light.tint}
                                style={styles.footerLoader} 
                            />
                        ) : null
                    }
                />
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
    productGrid: {
        padding: 8,
    },
    productCard: {
        flex: 1,
        margin: 8,
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: Platform.OS === 'android' ? 1 : 0,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    imageContainer: {
        width: '100%',
        height: 160,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    productInfo: {
        padding: 12,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.text,
        marginBottom: 4,
    },
    priceContainer: {
        flexDirection: 'column',
        marginTop: 4,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.light.tint,
    },
    originalPrice: {
        fontSize: 14,
        color: '#999',
        textDecorationLine: 'line-through',
        marginBottom: 2,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyText: {
        fontSize: 16,
        color: Colors.light.text,
        marginTop: 16,
    },
    footerLoader: {
        padding: 16,
    },
}); 