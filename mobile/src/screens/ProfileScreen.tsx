import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getRemainingCredits } from '../utils/credits';
import { RuledRow } from '../components/spec';
import { colors, radius } from '../theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const confirmLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.identity}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(user.fullName || user.email).charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{user.fullName || user.email}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>
        </View>
        <RuledRow label="Plan" value={user.is_postpaid ? 'Pay as you go' : user.plan || 'None'} last={Boolean(user.is_postpaid)} />
        {!user.is_postpaid && (
          <>
            <RuledRow label="Transformation credits" value={getRemainingCredits(user, 'transformation').toLocaleString()} />
            <RuledRow label="Creation credits" value={getRemainingCredits(user, 'creation').toLocaleString()} last />
          </>
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
        <Text style={styles.logoutText}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sheet, padding: 16 },
  card: {
    backgroundColor: colors.paper,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.rule,
    paddingHorizontal: 16,
  },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.rule },
  avatar: { width: 44, height: 44, borderRadius: radius.card, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  name: { fontSize: 17, fontWeight: '600', color: colors.ink },
  email: { fontSize: 13, color: colors.ink2, marginTop: 2 },
  logoutButton: {
    marginTop: 24,
    backgroundColor: colors.paper,
    borderRadius: radius.control,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.danger,
  },
  logoutText: { color: colors.danger, fontWeight: '600', fontSize: 15 },
});
