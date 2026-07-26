import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

export const FILTER_CATEGORIES = [
  'All',
  'Running',
  'Audio',
  'Water Bottles',
  'Backpacks',
  'Dresses',
] as const;

interface FilterChipsProps {
  selected: string;
  onSelect: (category: string) => void;
}

export default function FilterChips({ selected, onSelect }: FilterChipsProps) {
  const [focused, setFocused] = useState<string | null>(null);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {FILTER_CATEGORIES.map((category) => {
        const isActive = selected === category;
        const isFocused = focused === category;
        return (
          <TouchableOpacity
            key={category}
            onPress={() => onSelect(category)}
            onFocus={() => setFocused(category)}
            onBlur={() => setFocused(null)}
            style={[
              styles.chip,
              isActive && styles.chipActive,
              isFocused && styles.chipFocused,
            ]}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {category}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    // avoid using `gap` for cross-platform compatibility
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    height: 48,
    minWidth: 96,
    alignItems: 'center',
    justifyContent: 'center',
    // remove default focus outline on web which can make the chip look larger
    outlineWidth: 0,
    outlineColor: 'transparent',
  },
  chipActive: {
    backgroundColor: '#4F46E5',
    // ensure focus outline disabled on active state too
    outlineWidth: 0,
    outlineColor: 'transparent',
  },
  chipFocused: {
    // subtle border color change when focused, no padding changes
    borderColor: '#F59E0B',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
});
