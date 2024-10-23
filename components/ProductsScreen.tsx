// //ProductsScreen.tsx:




import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { Product } from '../types';

type ProductsScreenProps = StackScreenProps<RootStackParamList, 'Products'>;

const ProductsScreen: React.FC<ProductsScreenProps> = ({ navigation }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false); // For pull-to-refresh
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const PRODUCTS_PER_PAGE = 4;

  // Fetch products from API
  const fetchProducts = async (reset = false) => {
    if (loading || (!hasMore && !reset)) return;
    setLoading(true);
    try {
      const response = await axios.get('https://fakestoreapi.com/products');
      const allProducts = response.data;

      const startIndex = reset ? 0 : (page - 1) * PRODUCTS_PER_PAGE;
      const paginatedProducts = allProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

      if (paginatedProducts.length > 0) {
        setProducts((prevProducts) => (reset ? paginatedProducts : [...prevProducts, ...paginatedProducts]));
        setPage((prevPage) => (reset ? 2 : prevPage + 1));
        setHasMore(true);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      if (refreshing) setRefreshing(false); // Stop the refreshing animation
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchProducts();
  }, []);

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchProducts();
    }
  };

  // Pull-to-refresh handler
  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1); // Reset the page
    fetchProducts(true); // Fetch new data and reset the products list
  };

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productContainer}
      onPress={() => navigation.navigate('ProductDetails', { product: item })}
    >
      <View style={styles.productInner}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
        <Text style={styles.productTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Item List</Text>
      </View>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading && !refreshing ? <ActivityIndicator size="large" color="#0000ff" /> : null}
        refreshing={refreshing} // Pull-to-refresh
        onRefresh={handleRefresh} // Trigger refresh
      />
    </View>
  );
};

export default ProductsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    padding: 20,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  row: {
    justifyContent: 'space-between',
  },
  productContainer: {
    flex: 1,
    margin: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  productInner: {
    alignItems: 'center',
    padding: 10,
  },
  productImage: {
    width: Dimensions.get('window').width / 2.5,
    height: 150,
    resizeMode: 'contain',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 16,
    color: '#888',
    marginTop: 5,
  },
});
