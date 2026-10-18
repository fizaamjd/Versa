import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ASPECT_RATIO_PRESETS } from '../types/models';
import { RatioGlyph } from './spec';
import { colors, radius } from '../theme';

interface Props {
  value: string;
  onChange: (ratio: string) => void;
}

/* Each preset is a tile with its frame drawn and dimensioned. */
export default function AspectRatioPicker({ value, onChange }: Props) {
  return (
    <View style={styles.grid}>
      {ASPECT_RATIO_PRESETS.map((preset) => {
        const selected = preset.ratio === value;
        return (
          <TouchableOpacity
            key={preset.key}
            style={[styles.tile, selected && styles.tileSelected]}
            onPress={() => onChange(preset.ratio)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={`${preset.label} ${preset.ratio}`}
          >
            <RatioGlyph ratio={preset.ratio} selected={selected} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, selected && styles.labelSelected]}>{preset.label}</Text>
              <Text style={styles.ratio}>{preset.ratio}</Text>
            </View>
            {/* selection is a mark in a fixed cell, never colour alone */}
            <View style={[styles.mark, selected && styles.markOn]} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: {
    flexBasis: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.paper,
  },
  tileSelected: { borderColor: colors.spec, backgroundColor: '#F4F6FE' },
  label: { fontSize: 14, fontWeight: '500', color: colors.ink },
  labelSelected: { color: colors.spec, fontWeight: '600' },
  ratio: { fontSize: 12, color: colors.ink3, marginTop: 1, fontVariant: ['tabular-nums'] },
  mark: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: colors.ruleStrong },
  markOn: { borderColor: colors.spec, backgroundColor: colors.spec },
});
