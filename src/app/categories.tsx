import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { PRODUCTS } from '../data/product';

const CATEGORIES = Array.from(new Set(PRODUCTS.map((p) => p.category))).sort();

export default function CategoriesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.title}>Categories</Text>

      <FlatList
        data={CATEGORIES}
        keyExtractor={(i) => i}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push(`/?category=${encodeURIComponent(item)}`)}
          >
            <Text style={styles.cat}>{item}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  title: { fontSize: 20, fontWeight: '700', padding: 16, color: '#111827' },
  list: { paddingHorizontal: 12 },
  row: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    marginBottom: 10,
  },
  cat: { fontSize: 16, color: '#111827', fontWeight: '600' },
});
