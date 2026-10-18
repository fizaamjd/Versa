import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AspectRatioPicker from '../components/AspectRatioPicker';
import { RuledRow, SpecFrame } from '../components/spec';
import { useAuth } from '../context/AuthContext';
import { resizeImage } from '../api/engine';
import { extractErrorMessage } from '../api/client';
import { EngineType } from '../types/models';
import { getRemainingCredits, hasEngineActiveSubscription, isEngineAllocated } from '../utils/credits';
import { RootStackParamList } from '../navigation/types';
import { colors, radius } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function EngineScreen({ engineType }: { engineType: EngineType }) {
  const navigation = useNavigation<Nav>();
  const { user, refreshUser } = useAuth();
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [prompt, setPrompt] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isCreation = engineType === 'creation';

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to pick an image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const canSubmit = isCreation
    ? Boolean(prompt.trim()) || Boolean(imageUri)
    : Boolean(imageUri);

  const onSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      const result = await resizeImage({ engineType, aspectRatio, prompt, imageUri });
      await refreshUser();
      setImageUri(null);
      setPrompt('');
      navigation.navigate('Result', { result });
    } catch (err) {
      Alert.alert(isCreation ? 'Generation failed' : 'Recomposition failed', extractErrorMessage(err, 'Something went wrong.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  if (!isEngineAllocated(user, engineType)) {
    return (
      <View style={styles.centered}>
        <Text style={styles.blockedTitle}>Engine not available</Text>
        <Text style={styles.blockedSubtitle}>
          This engine isn't enabled for your account yet.
        </Text>
      </View>
    );
  }

  const isPostpaid = Boolean(user.is_postpaid);
  const hasSubscription = hasEngineActiveSubscription(user, engineType);
  const remaining = getRemainingCredits(user, engineType);

  if (!isPostpaid && !hasSubscription) {
    return (
      <View style={styles.centered}>
        <Text style={styles.blockedTitle}>Subscription required</Text>
        <Text style={styles.blockedSubtitle}>
          Choose a plan to activate credits for the {isCreation ? 'Creation' : 'Transformation'}{' '}
          engine.
        </Text>
      </View>
    );
  }

  if (!isPostpaid && remaining <= 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.blockedTitle}>No credits available</Text>
        <Text style={styles.blockedSubtitle}>
          Your {isCreation ? 'Creation' : 'Transformation'} engine has 0 remaining credits.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View style={styles.panel}>
        <RuledRow label="Credits remaining" value={isPostpaid ? 'Pay as you go' : remaining.toLocaleString()} />
        <RuledRow label="Output" value="Exact pixel size" last />
      </View>

      <Text style={styles.label}>{isCreation ? 'Reference image (optional)' : 'Approved artwork'}</Text>
      <TouchableOpacity style={styles.uploadBox} onPress={pickImage} accessibilityRole="button">
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
        ) : (
          <Text style={styles.uploadText}>
            {isCreation ? 'Tap to add a reference image' : 'Tap to choose the approved artwork'}
          </Text>
        )}
      </TouchableOpacity>
      {imageUri && (
        <TouchableOpacity onPress={() => setImageUri(null)}>
          <Text style={styles.removeLink}>Remove image</Text>
        </TouchableOpacity>
      )}

      {isCreation && (
        <>
          <Text style={styles.label}>Describe the creative</Text>
          <TextInput
            style={styles.promptInput}
            placeholder="e.g. Summer sale banner with the logo top-left"
            placeholderTextColor={colors.ink3}
            value={prompt}
            onChangeText={setPrompt}
            multiline
          />
        </>
      )}

      <Text style={styles.label}>Size</Text>
      <AspectRatioPicker value={aspectRatio} onChange={setAspectRatio} />

      {/* The output drawn before it exists: its frame and safe zone */}
      <View style={styles.stage}>
        <SpecFrame ratio={aspectRatio} />
        <Text style={styles.stageNote}>The dashed inner area is the safe zone.</Text>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
        onPress={onSubmit}
        disabled={!canSubmit || submitting}
        accessibilityRole="button"
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>{isCreation ? 'Generate' : 'Recompose'}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sheet },
  panel: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radius.card,
    paddingHorizontal: 14,
  },
  uploadBox: {
    height: 180,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderStyle: 'dashed',
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  uploadText: { color: colors.ink2, fontSize: 14, paddingHorizontal: 20, textAlign: 'center' },
  previewImage: { width: '100%', height: '100%' },
  removeLink: { color: colors.danger, fontSize: 13, marginTop: 8, textAlign: 'right' },
  label: { fontSize: 13, fontWeight: '600', color: colors.ink, marginTop: 20, marginBottom: 8 },
  promptInput: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radius.control,
    padding: 12,
    fontSize: 14,
    minHeight: 90,
    color: colors.ink,
    textAlignVertical: 'top',
  },
  stage: {
    marginTop: 16,
    paddingVertical: 20,
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radius.card,
  },
  stageNote: { fontSize: 12, color: colors.ink3 },
  submitButton: {
    backgroundColor: colors.spec,
    borderRadius: radius.control,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonDisabled: { opacity: 0.4 },
  submitButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: colors.sheet },
  blockedTitle: { fontSize: 18, fontWeight: '600', color: colors.ink, marginBottom: 8 },
  blockedSubtitle: { fontSize: 14, color: colors.ink2, textAlign: 'center', lineHeight: 20 },
});
