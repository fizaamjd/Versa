import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { requestPasswordReset } from '../../api/auth';
import { extractErrorMessage } from '../../api/client';
import { AuthStackParamList } from '../../navigation/types';
import { BrandLockup } from '../../components/spec';
import { colors, radius } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const onSubmit = async () => {
    setError(null);
    if (!email.trim()) {
      setError('Enter your email.');
      return;
    }
    setSubmitting(true);
    try {
      await requestPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not send reset email.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <BrandLockup style={styles.logo} />
      <Text style={styles.title}>Reset password</Text>
      <Text style={styles.subtitle}>
        Enter the email on your account and we'll send a reset link.
      </Text>

      {sent ? (
        <Text style={styles.success}>
          If an account exists for that email, a reset link has been sent.
        </Text>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholderTextColor={colors.ink3}
        placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          {error && <Text style={styles.error}>{error}</Text>}
          <TouchableOpacity style={styles.button} onPress={onSubmit} disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Send reset link</Text>
            )}
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 24 }}>
        <Text style={styles.link}>Back to sign in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.sheet },
  logo: { alignSelf: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '600', color: colors.ink, textAlign: 'center' },
  subtitle: {
    fontSize: 14,
    color: colors.ink3,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
    lineHeight: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radius.control,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 12,
  },
  button: {
    backgroundColor: colors.spec,
    borderRadius: radius.control,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  error: { color: colors.danger, fontSize: 13, marginBottom: 8 },
  success: { color: colors.success, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  link: { color: colors.spec, fontWeight: '600', fontSize: 13, textAlign: 'center' },
});
