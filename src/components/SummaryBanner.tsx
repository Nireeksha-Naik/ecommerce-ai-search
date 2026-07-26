import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface SummaryBannerProps {
  summary: string;
  isZeroResult?: boolean;
}

export default function SummaryBanner({ summary, isZeroResult = false }: SummaryBannerProps) {
  if (!summary) return null;

  return (
    <View style={[styles.container, isZeroResult && styles.containerWarning]}>
      <Text style={styles.icon}>{isZeroResult ? '🤔' : '🤖'}</Text>
      <View style={styles.textWrap}>
        <Text style={styles.label}>{isZeroResult ? "AI couldn't find a match" : 'AI understood your search'}</Text>
        <Text style={styles.summary}>{summary}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
    padding: 12,
    gap: 10,
  },
  containerWarning: {
    backgroundColor: '#FEF3C7',
  },
  icon: {
    fontSize: 20,
    marginTop: 2,
  },
  textWrap: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4338CA',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  summary: {
    fontSize: 14,
    color: '#312E81',
    lineHeight: 19,
  },
});
