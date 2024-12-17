import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	StyleSheet,
	Image,
	ScrollView,
	TouchableOpacity,
	ActivityIndicator,
	Alert,
	FlatList,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { productService, categoryService } from '../../services/api';

interface Category {
	_id: string;
	name: string;
	description?: string;
	image?: string;
	slug: string;
	isActive: boolean;
}

interface Subcategory {
	_id: string;
	name: string;
	description?: string;
	image?: string;
	slug: string;
}

interface Product {
	_id: string;
	name: string;
	price: number;
	discountPrice?: number;
	image: string;
	description?: string;
	stock?: number;
}

export default function CategoryScreen() {
	const { id } = useLocalSearchParams();
	const [category, setCategory] = useState<Category | null>(null);
	const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [categoryLoading, setCategoryLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		loadCategory();
	}, [id]);

	const loadCategory = async () => {
		try {
			setCategoryLoading(true);
			const response = await categoryService.getCategoryBySlug(id as string);
			setCategory(response.data);

			// Load subcategories
			const subResponse = await categoryService.getSubcategories(id as string);
			setSubcategories(subResponse.data.subcategories || []);

			// If there are no subcategories, load products directly
			if (!subResponse.data.subcategories?.length) {
				await loadProducts();
			}
		} catch (error) {
			console.error('Error loading category:', error);
			Alert.alert('Error', 'Failed to load category');
			router.back();
		} finally {
			setCategoryLoading(false);
		}
	};

	const loadProducts = async () => {
		try {
			setLoading(true);
			const response = await productService.getProductsByCategory(id as string);
			setProducts(response.products);
		} catch (error) {
			console.error('Error loading products:', error);
			Alert.alert('Error', 'Failed to load products');
		} finally {
			setLoading(false);
		}
	};

	const renderSubcategory = ({ item }: { item: Subcategory }) => (
		<TouchableOpacity
			style={styles.subcategoryCard}
			onPress={() => router.push(`/category/${item.slug}`)}
		>
			{item.image && (
				<Image
					source={{ uri: item.image }}
					style={styles.subcategoryImage}
					resizeMode="cover"
				/>
			)}
			<View style={styles.subcategoryInfo}>
				<Text style={styles.subcategoryName}>{item.name}</Text>
				{item.description && (
					<Text style={styles.subcategoryDescription} numberOfLines={2}>
						{item.description}
					</Text>
				)}
			</View>
			<Ionicons name="chevron-forward" size={24} color={Colors.light.text} />
		</TouchableOpacity>
	);

	const renderProduct = ({ item }: { item: Product }) => (
		<TouchableOpacity
			style={styles.productCard}
			onPress={() => router.push(`/product/${item._id}`)}
		>
			<View style={styles.imageContainer}>
				<Image
					source={{ uri: item.image }}
					style={styles.productImage}
					resizeMode="cover"
				/>
			</View>
			<View style={styles.productInfo}>
				<Text style={styles.productName} numberOfLines={1}>
					{item.name}
				</Text>
				<View style={styles.priceContainer}>
					{item.discountPrice ? (
						<>
							<Text style={styles.originalPrice}>
								₹{item.price.toFixed(2)}
							</Text>
							<Text style={styles.productPrice}>
								₹{item.discountPrice.toFixed(2)}
							</Text>
						</>
					) : (
						<Text style={styles.productPrice}>
							₹{item.price.toFixed(2)}
						</Text>
					)}
				</View>
			</View>
		</TouchableOpacity>
	);

	if (categoryLoading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color={Colors.light.tint} />
			</View>
		);
	}

	if (!category) {
		return (
			<View style={styles.errorContainer}>
				<Text style={styles.errorText}>Category not found</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			{/* Category Header */}
			<View style={styles.header}>
				{category.image && (
					<Image
						source={{ uri: category.image }}
						style={styles.categoryImage}
						resizeMode="cover"
					/>
				)}
				<View style={styles.headerContent}>
					<Text style={styles.categoryName}>{category.name}</Text>
					{category.description && (
						<Text style={styles.categoryDescription}>
							{category.description}
						</Text>
					)}
				</View>
			</View>

			{/* Subcategories or Products List */}
			{subcategories.length > 0 ? (
				<FlatList
					data={subcategories}
					renderItem={renderSubcategory}
					keyExtractor={item => item._id}
					contentContainerStyle={styles.listContent}
					ListEmptyComponent={
						<Text style={styles.emptyText}>
							No subcategories found
						</Text>
					}
				/>
			) : loading ? (
				<ActivityIndicator
					size="large"
					color={Colors.light.tint}
					style={styles.loader}
				/>
			) : (
				<FlatList
					data={products}
					renderItem={renderProduct}
					keyExtractor={item => item._id}
					numColumns={2}
					contentContainerStyle={styles.productsGrid}
					ListEmptyComponent={
						<Text style={styles.emptyText}>
							No products found in this category
						</Text>
					}
				/>
			)}
		</View>
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
	errorContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	errorText: {
		fontSize: 16,
		color: Colors.light.text,
		textAlign: 'center',
	},
	header: {
		backgroundColor: Colors.light.background,
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
	},
	categoryImage: {
		width: '100%',
		height: 150,
		borderRadius: 12,
		marginBottom: 12,
	},
	headerContent: {
		paddingHorizontal: 4,
	},
	categoryName: {
		fontSize: 24,
		fontWeight: 'bold',
		color: Colors.light.text,
		marginBottom: 8,
	},
	categoryDescription: {
		fontSize: 14,
		color: Colors.light.text,
		opacity: 0.7,
	},
	listContent: {
		padding: 16,
	},
	subcategoryCard: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#fff',
		borderRadius: 12,
		padding: 12,
		marginBottom: 12,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	subcategoryImage: {
		width: 60,
		height: 60,
		borderRadius: 8,
		marginRight: 12,
	},
	subcategoryInfo: {
		flex: 1,
	},
	subcategoryName: {
		fontSize: 16,
		fontWeight: '600',
		color: Colors.light.text,
		marginBottom: 4,
	},
	subcategoryDescription: {
		fontSize: 14,
		color: Colors.light.text,
		opacity: 0.7,
	},
	productsGrid: {
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
	},
	imageContainer: {
		width: '100%',
		height: 150,
		borderTopLeftRadius: 12,
		borderTopRightRadius: 12,
		overflow: 'hidden',
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
		marginTop: 20,
	},
	emptyText: {
		textAlign: 'center',
		fontSize: 16,
		color: Colors.light.text,
		marginTop: 20,
	},
});
