// Versa's spec-sheet kit for mobile: the lockup, tab icons drawn from frames
// and dimension lines, dimensioned ratio glyphs, and ruled label/value rows.
// Plain Views only, so it needs no SVG or icon dependency.
import React from 'react';
import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '../theme';

export function BrandLockup({ style }: { style?: ViewStyle }) {
  return (
    <Image
      source={require('../../assets/brand-lockup.png')}
      style={[{ width: 163, height: 43 }, style as object]}
      accessibilityLabel="Versa"
    />
  );
}

export function parseRatio(ratio: string): [number, number] {
  const sep = ratio.includes(':') ? ':' : 'x';
  const [w, h] = ratio.split(sep).map(Number);
  return Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0 ? [w, h] : [1, 1];
}

/* A width dimension: end ticks with a line between, the spec-sheet way. */
function WidthDimension({ width, color }: { width: number; color: string }) {
  return (
    <View style={{ width, height: 5, borderLeftWidth: 1, borderRightWidth: 1, borderColor: color, justifyContent: 'center' }}>
      <View style={{ height: 1, backgroundColor: color }} />
    </View>
  );
}

/* A preset drawn as a dimensioned frame. */
export function RatioGlyph({ ratio, selected }: { ratio: string; selected?: boolean }) {
  const [rw, rh] = parseRatio(ratio);
  const max = 26;
  const w = rw >= rh ? max : Math.max(10, Math.round(max * (rw / rh)));
  const h = rh >= rw ? max : Math.max(10, Math.round(max * (rh / rw)));
  return (
    <View style={{ height: 36, justifyContent: 'center', alignItems: 'center', gap: 3 }}>
      <WidthDimension width={w} color={colors.ink} />
      <View
        style={{
          width: w,
          height: h,
          borderWidth: 1,
          borderColor: colors.spec,
          backgroundColor: selected ? colors.specTint : '#fff',
          borderRadius: 1,
        }}
      />
    </View>
  );
}

/* The output, drawn before it exists: dimension line, frame, safe zone, label. */
export function SpecFrame({ ratio }: { ratio: string }) {
  const [rw, rh] = parseRatio(ratio);
  const k = Math.min(220 / rw, 160 / rh);
  const w = Math.round(rw * k);
  const h = Math.round(rh * k);
  return (
    <View style={{ alignItems: 'center', gap: 6 }}>
      <WidthDimension width={w} color={colors.ink} />
      <View style={{ width: w, height: h, borderWidth: 1, borderColor: colors.spec, padding: '9%', backgroundColor: '#fff' }}>
        {/* safe zone: inner area kept clear of the frame edge */}
        <View style={{ flex: 1, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.hatch, backgroundColor: colors.specTint }} />
      </View>
      <Text style={styles.figure}>{ratio}</Text>
    </View>
  );
}

export function RuledRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, last && { borderBottomWidth: 0 }]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

type TabName = 'Creation' | 'Transformation' | 'History' | 'Profile';

/* Tab icons in the brand's own grammar, 22pt, one stroke weight. */
export function TabIcon({ name, color }: { name: TabName; color: string }) {
  const stroke = 1.5;
  const box = { width: 22, height: 22, alignItems: 'center' as const, justifyContent: 'center' as const };
  if (name === 'Transformation') {
    return (
      <View style={[box, { gap: 3 }]}>
        <WidthDimension width={18} color={color} />
        <View style={{ width: 18, height: 10, borderWidth: stroke, borderColor: color, borderRadius: 1 }} />
      </View>
    );
  }
  if (name === 'Creation') {
    return (
      <View style={box}>
        <View style={{ width: 18, height: 15, borderWidth: stroke, borderColor: color, borderRadius: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ position: 'absolute', width: 8, height: stroke, backgroundColor: color }} />
          <View style={{ position: 'absolute', width: stroke, height: 8, backgroundColor: color }} />
        </View>
      </View>
    );
  }
  if (name === 'History') {
    return (
      <View style={box}>
        <View style={{ position: 'absolute', top: 3, left: 5, width: 14, height: 11, borderWidth: stroke, borderColor: color, borderRadius: 1 }} />
        <View style={{ position: 'absolute', top: 8, left: 2, width: 14, height: 11, borderWidth: stroke, borderColor: color, borderRadius: 1, backgroundColor: '#fff' }} />
      </View>
    );
  }
  return (
    <View style={[box, { gap: 2 }]}>
      <View style={{ width: 8, height: 8, borderWidth: stroke, borderColor: color, borderRadius: 4 }} />
      <View style={{ width: 16, height: 7, borderWidth: stroke, borderBottomWidth: 0, borderColor: color, borderTopLeftRadius: 8, borderTopRightRadius: 8 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  figure: { fontSize: 13, fontWeight: '600', color: colors.ink, fontVariant: ['tabular-nums'] },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  rowLabel: { fontSize: 14, color: colors.ink2 },
  rowValue: { fontSize: 15, fontWeight: '600', color: colors.ink, fontVariant: ['tabular-nums'] },
});
