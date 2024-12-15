import React, { useState, useEffect, useRef } from 'react';
import {
	View,
	Text,
	FlatList,
	StyleSheet,
	Image,
	Dimensions,
	ScrollView,
	TextInput,
	TouchableOpacity,
	ActivityIndicator,
	Alert,
	SafeAreaView,
	Platform,
	StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { productService, categoryService } from '../../services/api';

const { width } = Dimensions.get('window');

interface CarouselItem {
	id: string;
	image: string;
	title: string;
}

interface CategoryItem {
	_id: string;
	name: string;
	description?: string;
	image?: string;
	slug: string;
	isActive: boolean;
}

interface ProductItem {
	_id: string;
	name: string;
	price: number;
	discountPrice?: number;
	image: string;
	description?: string;
	stock?: number;
	images?: string[];
}

// Sample data for the carousel
const carouselData: CarouselItem[] = [
	{ 
		id: '1', 
		image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8',
		title: 'Summer Collection'
	},
	{ 
		id: '2', 
		image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc',
		title: 'New Arrivals'
	},
	{ 
		id: '3', 
		image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04',
		title: 'Special Offers'
	},
];

export default function HomeScreen() {
	const [searchQuery, setSearchQuery] = useState('');
	const { addToCart } = useCart();
	const router = useRouter();
	const [featuredProducts, setFeaturedProducts] = useState<ProductItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [categories, setCategories] = useState<CategoryItem[]>([]);
	const [categoriesLoading, setCategoriesLoading] = useState(true);
	const flatListRef = useRef<FlatList>(null);
	const [currentIndex, setCurrentIndex] = useState(0);

	useEffect(() => {
		loadFeaturedProducts();
		loadCategories();
	}, []);


// new color #c8fc8c -------------------------------------------------

	// Auto-scroll effect
	useEffect(() => {
		const scrollInterval = setInterval(() => {
			if (currentIndex < carouselData.length - 1) {
				setCurrentIndex(currentIndex + 1);
				flatListRef.current?.scrollToIndex({
					index: currentIndex + 1,
					animated: true
				});
			} else {
				setCurrentIndex(0);
				flatListRef.current?.scrollToIndex({
					index: 0,
					animated: true
				});
			}
		}, 3000); // Change slide every 3 seconds

		return () => clearInterval(scrollInterval);
	}, [currentIndex]);

	// Handle scroll end to update current index
	const handleScrollEnd = (event: any) => {
		const contentOffset = event.nativeEvent.contentOffset.x;
		const index = Math.round(contentOffset / width);
		setCurrentIndex(index);
	};

	const loadFeaturedProducts = async () => {
		try {
			setLoading(true);
			const response = await productService.getFeaturedProducts();
			console.log('Featured Products:', response.products);
			setFeaturedProducts(response.products);
		} catch (error) {
			console.error('Error loading featured products:', error);
			Alert.alert('Error', 'Failed to load products');
		} finally {
			setLoading(false);
		}
	};

	const loadCategories = async () => {
		try {
			setCategoriesLoading(true);
			const response = await categoryService.getAllCategories();
			setCategories(response.data);
		} catch (error) {
			console.error('Error loading categories:', error);
			Alert.alert('Error', 'Failed to load categories');
		} finally {
			setCategoriesLoading(false);
		}
	};

	const handleSearch = () => {
		if (searchQuery.trim()) {
			router.push({
				pathname: '/search',
				params: { query: searchQuery.trim() }
			});
		}
	};

	const renderCarouselItem = ({ item }: { item: CarouselItem }) => (
		<View style={styles.carouselItem}>
			<Image source={{ uri: item.image }} style={styles.carouselImage} />
			<View style={styles.carouselOverlay}>
				<Text style={styles.carouselTitle}>{item.title}</Text>
			</View>
		</View>
	);

	const renderCategory = ({ item }: { item: CategoryItem }) => (
		<TouchableOpacity
			style={styles.categoryItem}
			onPress={() => router.push(`/category/${item.slug}`)}
		>
			<View style={styles.categoryIcon}>
				{item.image ? (
					<Image 
						source={{ uri: item.image }} 
						style={styles.categoryImage}
						resizeMode="cover"
					/>
				) : (
					<Ionicons name="grid-outline" size={24} color={Colors.light.tint} />
				)}
			</View>
			<Text style={styles.categoryName} numberOfLines={1}>{item.name}</Text>
		</TouchableOpacity>
	);

	const renderProduct = ({ item }: { item: ProductItem }) => {
		// Get the first image from images array or use the image field
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
					<Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
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
			<StatusBar barStyle="dark-content" />
			
			{/* Header */}
			<View style={styles.header}>
				<Image 
					source={require('../../assets/images/logo.jpg')} 
					style={styles.headerLogo}
					resizeMode="contain"
				/>
			</View>

			<ScrollView showsVerticalScrollIndicator={false}>
				{/* Search Bar */}
				<View style={styles.searchContainer}>
					<Ionicons name="search" size={20} color="#666" />
					<TextInput
						style={styles.searchInput}
						placeholder="Search products..."
						value={searchQuery}
						onChangeText={setSearchQuery}
						onSubmitEditing={handleSearch}
						returnKeyType="search"
					/>
				</View>

				{/* Carousel */}
				<View style={styles.carouselContainer}>
					<FlatList
						ref={flatListRef}
						data={carouselData}
						renderItem={renderCarouselItem}
						horizontal
						pagingEnabled
						showsHorizontalScrollIndicator={false}
						keyExtractor={item => item.id}
						onMomentumScrollEnd={handleScrollEnd}
						getItemLayout={(_, index) => ({
							length: width,
							offset: width * index,
							index,
						})}
					/>
					{/* Pagination Dots */}
					<View style={styles.paginationDots}>
						{carouselData.map((_, index) => (
							<View
								key={index}
								style={[
									styles.dot,
									{ backgroundColor: index === currentIndex ? Colors.light.tint : '#ccc' }
								]}
							/>
						))}
					</View>
				</View>

				{/* Categories */}
				<View style={styles.categoriesSection}>
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>Categories</Text>
					</View>
					{categoriesLoading ? (
						<ActivityIndicator size="small" color={Colors.light.tint} style={styles.loader} />
					) : (
						<FlatList
							data={categories}
							renderItem={renderCategory}
							horizontal
							showsHorizontalScrollIndicator={false}
							keyExtractor={item => item._id}
							contentContainerStyle={styles.categoriesList}
						/>
					)}
				</View>

				{/* Featured Products */}
				<View style={styles.productsSection}>
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>Featured Products</Text>
						<TouchableOpacity onPress={() => router.push('/featured')}>
							<Text style={styles.seeAll}>See All</Text>
						</TouchableOpacity>
					</View>
					{loading ? (
						<ActivityIndicator size="large" color={Colors.light.tint} style={styles.loader} />
					) : (
						<FlatList
							data={featuredProducts}
							renderItem={renderProduct}
							horizontal
							showsHorizontalScrollIndicator={false}
							keyExtractor={item => item._id}
							contentContainerStyle={styles.productsList}
						/>
					)}
				</View>
			</ScrollView>
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
		paddingHorizontal: 16,
		paddingVertical: 12,
		backgroundColor: Colors.light.background,
		marginTop: 8,
	},
	headerLogo: {
		height: 40,
		width: 150,
		marginTop: 4,
	},
	searchContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#f5f5f5',
		margin: 16,
		padding: 12,
		borderRadius: 12,
	},
	searchInput: {
		flex: 1,
		marginLeft: 8,
		fontSize: 16,
		color: Colors.light.text,
	},
	carouselContainer: {
		height: 200,
		marginBottom: 24,
	},
	carouselItem: {
		width: width,
		height: 200,
	},
	carouselImage: {
		width: '100%',
		height: '100%',
	},
	carouselOverlay: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		padding: 16,
		backgroundColor: 'rgba(0,0,0,0.3)',
	},
	carouselTitle: {
		color: '#fff',
		fontSize: 24,
		fontWeight: 'bold',
	},
	categoriesSection: {
		marginBottom: 24,
	},
	sectionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 16,
		marginBottom: 12,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		color: Colors.light.text,
	},
	seeAll: {
		color: Colors.light.tint,
		fontSize: 14,
		fontWeight: '600',
	},
	categoriesList: {
		paddingHorizontal: 12,
	},
	categoryItem: {
		alignItems: 'center',
		marginHorizontal: 4,
		width: 80,
	},
	categoryIcon: {
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: '#f5f5f5',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 8,
		overflow: 'hidden',
	},
	categoryName: {
		fontSize: 12,
		color: Colors.light.text,
		textAlign: 'center',
	},
	productsSection: {
		marginBottom: 24,
	},
	productsList: {
		paddingHorizontal: 12,
	},
	productCard: {
		width: 160,
		marginHorizontal: 4,
		backgroundColor: '#fff',
		borderRadius: 12,
		shadowColor: '#000',
		shadowOffset: { 
			width: 0, 
			height: 2 
		},
		shadowOpacity: 0.2,
		shadowRadius: 6,
		elevation: 8,
		marginBottom: 8,
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
	loader: {
		marginVertical: 20,
	},
	categoryImage: {
		width: '100%',
		height: '100%',
		borderRadius: 30,
	},
	paginationDots: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		position: 'absolute',
		bottom: 16,
		width: '100%',
	},
	dot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		marginHorizontal: 4,
	},
});
