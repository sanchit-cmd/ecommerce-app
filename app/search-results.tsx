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
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';

// Sample products data (replace with your actual data source)
const sampleProducts = [
  {
    id: '1',
    name: 'Wireless Earbuds',
    price: 79.99,
    image: 'https://via.placeholder.com/400',
    description: 'High-quality wireless earbuds with noise cancellation',
  },
  {
    id: '2',
    name: 'Smart Watch',
    price: 199.99,
    image: 'https://via.placeholder.com/400',
    description: 'Feature-rich smartwatch with health tracking',
  },
  {
    id: '3',
    name: 'Laptop Backpack',
    price: 49.99,
    image: 'https://via.placeholder.com/400',
    description: 'Water-resistant laptop backpack with multiple compartments',
  },
];

export default function SearchResults() {
  const { query } = useLocalSearchParams();
  const router = useRouter();
  const { addItem } = useCart();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);

  useEffect(() => {
    // Simulate API call for search
    setLoading(true);
    setTimeout(() => {
      const filteredProducts = sampleProducts.filter(
        product => 
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.description.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filteredProducts);
      setLoading(false);
    }, 1000);
  }, [query]);

  const handleAddToCart = (product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => router.push({
        pathname: "/product/[id]",
        params: { id: item.id }
      })}
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={(e) => {
            e.stopPropagation();
            handleAddToCart(item);
          }}
        >
          <Ionicons name="cart-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Search Results for "{query}"
        </Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : results.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="search-outline" size={48} color="#ccc" />
          <Text style={styles.noResults}>No products found</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResults: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 16,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  productImage: {
    width: 120,
    height: 120,
  },
  productInfo: {
    flex: 1,
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
});
