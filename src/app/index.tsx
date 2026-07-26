import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import FilterChips from '../components/FilterChips';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import SummaryBanner from '../components/SummaryBanner';
import { PRODUCTS } from '../data/product';
import { searchProductsWithAI } from '../services/aiSearch';
import { Product, SearchResult } from '../types/product';

const DEBOUNCE_MS = 450;
const SUGGESTIONS = ['running shoes', 'wireless headphones', 'water bottle', 'backpack'] as const;

export default function HomeScreen() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SearchResult>({
    products: PRODUCTS,
    summary: `Showing all ${PRODUCTS.length} products`,
    aiExplanations: {},
  });

  const insets = useSafeAreaInsets();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback(async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const searchResult = await searchProductsWithAI(searchQuery, PRODUCTS);
      setResult(searchResult);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      runSearch(query);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleClear = useCallback(() => {
    setQuery('');
  }, []);

  const handleSuggestionPress = useCallback((suggestion: string) => {
    setCategory('All');
    setQuery(suggestion);
  }, []);

  const visibleProducts: Product[] = useMemo(() => {
    if (category === 'All') return result.products;
    return result.products.filter((p) => p.category === category);
  }, [result.products, category]);

  const isZeroResult = visibleProducts.length === 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header
        value={query}
        onChangeText={setQuery}
        onSubmit={() => runSearch(query)}
        onClear={handleClear}
        isLoading={isLoading}
      />

      <FilterChips selected={category} onSelect={setCategory} />

      <SummaryBanner summary={result.summary} isZeroResult={isZeroResult && query.length > 0} />

      {isZeroResult ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🛍️</Text>
          <Text style={styles.emptyTitle}>No products found</Text>
          <Text style={styles.emptySubtitle}>
            Try a broader search, remove your budget filter, or explore a different category below.
          </Text>

          <View style={styles.suggestionRow}>
            {SUGGESTIONS.map((suggestion) => (
              <Text
                key={suggestion}
                style={styles.suggestionChip}
                onPress={() => handleSuggestionPress(suggestion)}
              >
                {suggestion}
              </Text>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          data={visibleProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 24 },
          ]}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              aiExplanation={result.aiExplanations[item.id]}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 10,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
  },
  suggestionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  suggestionChip: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    overflow: 'hidden',
  },
});