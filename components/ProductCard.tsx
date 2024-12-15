import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../constants/Colors';

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  description: string;
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart, loading } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const handleAddToCart = async (event: any) => {
    event.stopPropagation(); // Prevent card navigation when clicking add to cart
    if (!user) {
      Alert.alert(
        'Login Required',
        'Please login to add items to cart',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => router.push('/auth/login') }
        ]
      );
      return;
    }

    try {
      await addToCart(product, 1);
      Alert.alert('Success', 'Item added to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart');
    }
  };

  const handleCardPress = () => {
    router.push(`/product/${product._id}`);
  };

  return (
    <TouchableOpacity onPress={handleCardPress} style={styles.card}>
      <Image source={{ uri: product.image }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
        <TouchableOpacity 
          style={[styles.addButton, loading && styles.buttonDisabled]}
          onPress={handleAddToCart}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Add to Cart</Text>
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    color: Colors.light.tint,
    fontWeight: '600',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: Colors.light.tint,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
}); 