import React, { useCallback, useRef, useState } from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useCart } from '../context/CartContext';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export interface HeaderProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  onClear: () => void;
  isLoading?: boolean;
  placeholder?: string;
}

export default function Header({
  value,
  onChangeText,
  onSubmit,
  onClear,
  isLoading = false,
  placeholder = 'Try "lightweight running shoes under ₹5,000"',
}: HeaderProps) {
  const [isListening, setIsListening] = useState(false);
  const webRecognitionRef = useRef<any | null>(null);
  const { width } = useWindowDimensions();
  const router = useRouter();

  // Voice search is now available on web and mobile platforms.
  // On mobile, it uses the platform's native speech recognition API.
  const voiceSupported = true;

  const startListening = useCallback(() => {
    if (!voiceSupported) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Web Speech API not available in this browser.');
      return;
    }

    try {
      if (!webRecognitionRef.current) {
        const recog = new SpeechRecognition();
        recog.lang = 'en-US';
        recog.interimResults = true;
        recog.maxAlternatives = 1;
        recog.continuous = false;
        recog.onresult = (event: any) => {
          const transcript = event.results?.[0]?.[0]?.transcript;
          if (typeof transcript === 'string') onChangeText(transcript);
        };
        recog.onend = () => setIsListening(false);
        recog.onerror = (e: any) => {
          console.warn('Speech recognition error (web):', e);
          setIsListening(false);
        };
        webRecognitionRef.current = recog;
      }
      webRecognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      console.warn('Failed to start web speech recognition:', err);
      setIsListening(false);
    }
  }, [voiceSupported, onChangeText]);

  const stopListening = useCallback(() => {
    if (!voiceSupported) return;
    webRecognitionRef.current?.stop?.();
    setIsListening(false);
  }, [voiceSupported]);

  const handleMicPress = useCallback(() => {
    if (isListening) stopListening();
    else startListening();
  }, [isListening, startListening, stopListening]);

  const effectivePlaceholder = isListening ? 'Listening...' : placeholder;
  let cartCount = 0;
  try {
    cartCount = useCart().totalItems;
  } catch {}

  const titleFontSize = width < 360 ? 18 : 20;

  return (
    <SafeAreaView edges={['top']} style={styles.safeContainer}>
      <View style={styles.container}>
        <Text style={[styles.title, { fontSize: titleFontSize }]} numberOfLines={1}>
          AI Shop
        </Text>

        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔎</Text>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            onSubmitEditing={onSubmit}
            placeholder={effectivePlaceholder}
            placeholderTextColor={isListening ? '#EF4444' : '#9AA0A6'}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />

          {isLoading ? (
            <ActivityIndicator size="small" color="#4F46E5" style={styles.rightIcon} />
          ) : (
            <>
              {value.length > 0 && (
                <TouchableOpacity onPress={onClear} style={styles.rightIcon} hitSlop={10}>
                  <Text style={styles.clearText}>✕</Text>
                </TouchableOpacity>
              )}

              {voiceSupported && (
                <TouchableOpacity onPress={handleMicPress} style={styles.rightIcon} hitSlop={10}>
                  <Text style={styles.micText}>{isListening ? '🎙️🔴' : '🎙️'}</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => router.push('/cart')}
                style={[styles.rightIcon, styles.cartButton]}
                hitSlop={8}
              >
                <Text style={styles.cartText}>🛒{cartCount > 0 ? ` ${cartCount}` : ''}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { backgroundColor: '#FFFFFF' },
  container: { paddingHorizontal: 16, paddingBottom: 6 },
  title: { fontWeight: '700', color: '#111827', marginBottom: 6 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 44,
    marginTop: 4,
  },
  searchIcon: { fontSize: 15, marginRight: 6 },
  input: { flex: 1, fontSize: 14, color: '#111827', paddingVertical: 0 },
  rightIcon: { marginLeft: 6, width: 22, alignItems: 'center', justifyContent: 'center' },
  clearText: { fontSize: 15, color: '#6B7280', fontWeight: '600' },
  micText: { fontSize: 14 },
  cartButton: { marginLeft: 6, width: 46 },
  cartText: { fontSize: 13 },
});