import React from 'react';
import { StyleSheet, View } from 'react-native';

export const PasswordVisibilityIcon = ({ hidden }: { hidden: boolean }) => (
  <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.icon}>
    <View style={styles.eye}>
      <View style={styles.pupil} />
    </View>
    {hidden ? <View style={styles.slash} /> : null}
  </View>
);

const styles = StyleSheet.create({
  icon: { alignItems: 'center', height: 24, justifyContent: 'center', width: 28 },
  eye: { alignItems: 'center', borderColor: '#2D2D33', borderRadius: 14, borderWidth: 2.4, height: 15, justifyContent: 'center', transform: [{ rotate: '-8deg' }], width: 24 },
  pupil: { backgroundColor: '#2D2D33', borderRadius: 4, height: 7, width: 7 },
  slash: { backgroundColor: '#2D2D33', borderRadius: 2, height: 3, position: 'absolute', transform: [{ rotate: '45deg' }], width: 30 }
});
