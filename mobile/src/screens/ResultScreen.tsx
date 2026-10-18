import React from 'react';
import { Image, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors, radius } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

export default function ResultScreen({ route }: Props) {
  const { result } = route.params;

  const onShare = async () => {
    try {
      await Share.share({ message: result.url, url: result.url });
    } catch {
      // user cancelled or share failed silently
    }
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: result.url }} style={styles.image} resizeMode="contain" />
      <TouchableOpacity style={styles.button} onPress={onShare}>
        <Text style={styles.buttonText}>Share output</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ink, padding: 16, justifyContent: 'center' },
  image: { width: '100%', aspectRatio: 1, borderRadius: 2 },
  button: {
    backgroundColor: colors.spec,
    borderRadius: radius.control,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
