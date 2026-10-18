import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fetchHistory } from '../api/engine';
import { extractErrorMessage } from '../api/client';
import { HistoryItem } from '../types/models';
import { RootStackParamList } from '../navigation/types';
import { colors, radius } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HistoryScreen() {
  const navigation = useNavigation<Nav>();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const history = await fetchHistory();
      setItems(history);
      setError(null);
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not load history.'));
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.spec} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.stateTitle}>Couldn't load your outputs</Text>
        <Text style={styles.stateBody}>Check your connection and try again.</Text>
        <TouchableOpacity style={styles.retry} onPress={onRefresh} disabled={refreshing} accessibilityRole="button">
          <Text style={styles.retryText}>{refreshing ? 'Trying...' : 'Try again'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.stateTitle}>No outputs yet</Text>
        <Text style={styles.stateBody}>Every size you recompose or generate is kept here.</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{ padding: 12 }}
      data={items}
      keyExtractor={(item) => item.id}
      numColumns={2}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigation.navigate('Result', {
              result: { url: item.url, name: item.id, logId: item.id, reportId: '' },
            })
          }
        >
          <Image source={{ uri: item.url }} style={styles.thumb} resizeMode="cover" />
          <View style={styles.caption}>
            <Text style={styles.ratio}>{item.aspectRatio}</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sheet },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: colors.sheet },
  stateTitle: { fontSize: 17, fontWeight: '600', color: colors.ink, marginBottom: 6 },
  stateBody: { fontSize: 14, color: colors.ink2, textAlign: 'center', lineHeight: 20 },
  retry: { marginTop: 16, backgroundColor: colors.spec, borderRadius: radius.control, paddingVertical: 10, paddingHorizontal: 20 },
  retryText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  card: {
    flex: 1,
    margin: 6,
    borderRadius: radius.control,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.rule,
  },
  thumb: { width: '100%', aspectRatio: 1, backgroundColor: colors.sheet },
  caption: { borderTopWidth: 1, borderTopColor: colors.rule, paddingHorizontal: 10, paddingVertical: 8 },
  ratio: { fontSize: 13, fontWeight: '600', color: colors.ink, fontVariant: ['tabular-nums'] },
});
