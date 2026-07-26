import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.title}>Me</Text>

      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.name}>Guest User</Text>
          <Text style={styles.sub}>Sign in to view orders, addresses and saved items.</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.push('/login' as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Sign in</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          <TouchableOpacity style={styles.row} onPress={() => {}}>
            <Text style={styles.rowText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  title: { fontSize: 20, fontWeight: '700', padding: 16, color: '#111827' },
  container: { paddingHorizontal: 16 },
  card: { backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12 },
  name: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  sub: { fontSize: 13, color: '#6B7280', marginBottom: 12 },
  button: { backgroundColor: '#4F46E5', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontWeight: '700' },
  section: { marginTop: 18 },
  sectionTitle: { fontSize: 13, color: '#6B7280', marginBottom: 8 },
  row: { paddingVertical: 12 },
  rowText: { fontSize: 15, color: '#111827' },
});