import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { productService } from '../../services/api';

interface Variant {
  size: string;
  color: string;
  additionalPrice: number;
  stock: number;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice: number;
  stock: number;
  images: string[];
  brand: string;
  averageRating: number;
  numReviews: number;
  variants: Variant[];
  tags: string[];
  categoryDetails: {
    name: string;
  };
  isFeatured: boolean;
}

const { width } = Dimensions.get('window');

export default function ProductScreen() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart, loading: cartLoading } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    loadProductDetails();
  }, [id]);

  const loadProductDetails = async () => {
    try {
      setLoading(true);
      const response = await productService.getProduct(id as string);
      setProduct(response.product);
      if (response.product.variants.length > 0) {
        setSelectedVariant(response.product.variants[0]);
      }
    } catch (error) {
      console.error('Error loading product details:', error);
      Alert.alert('Error', 'Failed to load product details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  if (loading || !product) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  const finalPrice = selectedVariant 
    ? product.price + selectedVariant.additionalPrice - product.discountPrice
    : product.price - product.discountPrice;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;

  const handleAddToCart = async () => {
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

    if (currentStock < quantity) {
      Alert.alert('Error', 'Not enough stock available');
      return;
    }

    try {
      await addToCart({
        ...product,
        variant: selectedVariant,
        quantity,
      }, quantity);
      Alert.alert('Success', 'Item added to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart');
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <Ionicons
        key={index}
        name={index < Math.round(rating) ? 'star' : 'star-outline'}
        size={16}
        color={Colors.light.tint}
      />
    ));
  };

  return (
    <ScrollView style={styles.container}>
      {/* Image Carousel */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.imageCarousel}
      >
        {product.images.map((image, index) => (
          <Image
            key={index}
            source={{ uri: image }}
            style={[styles.image, { width }]}
            resizeMode="cover"
          />
        ))}
      </ScrollView>

      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.brand}>{product.brand}</Text>
          {product.isFeatured && (
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredText}>Featured</Text>
            </View>
          )}
        </View>

        {/* Price Section */}
        <View style={styles.priceContainer}>
          <Text style={styles.finalPrice}>₹{finalPrice.toFixed(2)}</Text>
          {product.discountPrice > 0 && (
            <Text style={styles.originalPrice}>₹{product.price.toFixed(2)}</Text>
          )}
        </View>

        {/* Rating Section */}
        <View style={styles.ratingContainer}>
          <View style={styles.stars}>
            {renderStars(product.averageRating)}
          </View>
          <Text style={styles.reviews}>({product.numReviews} reviews)</Text>
        </View>

        {/* Category */}
        <Text style={styles.category}>
          Category: {product.categoryDetails?.name}
        </Text>

        {/* Variants Section */}
        {product.variants.length > 0 && (
          <View style={styles.variantsContainer}>
            <Text style={styles.sectionTitle}>Available Options</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {product.variants.map((variant, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.variantButton,
                    selectedVariant === variant && styles.selectedVariant
                  ]}
                  onPress={() => setSelectedVariant(variant)}
                >
                  <Text style={styles.variantText}>
                    {variant.size} - {variant.color}
                  </Text>
                  <Text style={styles.variantPrice}>
                    +₹{variant.additionalPrice.toFixed(2)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Stock Status */}
        <Text style={[
          styles.stockStatus,
          { color: currentStock > 0 ? Colors.light.tint : '#ff3b30' }
        ]}>
          {currentStock > 0 ? `${currentStock} in stock` : 'Out of stock'}
        </Text>

        {/* Quantity Selector */}
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Ionicons name="remove" size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.quantity}>{quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => setQuantity(Math.min(currentStock, quantity + 1))}
          >
            <Ionicons name="add" size={24} color={Colors.light.text} />
          </TouchableOpacity>
        </View>

        {/* Description */}
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{product.description}</Text>

        {/* Tags */}
        {product.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {product.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Add to Cart Button */}
        <TouchableOpacity 
          style={[
            styles.addToCartButton,
            (cartLoading || currentStock === 0) && styles.buttonDisabled
          ]}
          onPress={handleAddToCart}
          disabled={cartLoading || currentStock === 0}
        >
          {cartLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {currentStock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageCarousel: {
    height: 300,
  },
  image: {
    height: 300,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  brand: {
    fontSize: 16,
    color: Colors.light.text,
    opacity: 0.7,
  },
  category: {
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 16,
  },
  featuredBadge: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  featuredText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  finalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.tint,
  },
  originalPrice: {
    fontSize: 18,
    color: Colors.light.text,
    opacity: 0.7,
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  reviews: {
    color: Colors.light.text,
    opacity: 0.7,
  },
  variantsContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  variantButton: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
  },
  selectedVariant: {
    borderColor: Colors.light.tint,
    backgroundColor: Colors.light.tint + '10',
  },
  variantText: {
    color: Colors.light.text,
    marginBottom: 4,
  },
  variantPrice: {
    color: Colors.light.tint,
    fontWeight: '600',
  },
  stockStatus: {
    fontSize: 16,
    marginBottom: 16,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantity: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
  },
  description: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 24,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  tag: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: Colors.light.text,
    fontSize: 14,
  },
  addToCartButton: {
    backgroundColor: Colors.light.tint,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
