import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';

export interface CategoryTabsProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function CategoryTabs({
  categories = ['All', 'Running', 'Audio', 'Water Bottles', 'Backpacks'],
  selectedCategory = 'All',
  onSelectCategory,
}: CategoryTabsProps) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {categories.map((category) => {
          const isSelected = selectedCategory === category;
          return (
            <TouchableOpacity
              key={category}
              style={[styles.pill, isSelected && styles.activePill]}
              onPress={() => onSelectCategory && onSelectCategory(category)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.pillText, isSelected && styles.activePillText]}
                numberOfLines={1}
              >
                {category}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
  },
  container: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activePill: {
    backgroundColor: '#4F46E5',
  },
  pillText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    textAlign: 'center',
  },
  activePillText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});