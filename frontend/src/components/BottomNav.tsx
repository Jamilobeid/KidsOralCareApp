import React from 'react';
import { Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { RootScreen } from '../types/app';
import { buttonFont } from '../utils/kidStyle';

const navItems: { screen: RootScreen; key: string; label: string; image: ImageSourcePropType; iconStyle?: object }[] = [
  { screen: 'childHome', key: 'home', label: 'Home', image: require('../../assets/images/nav-home-3d.png'), iconStyle: { width: 35, height: 35 } },
  { screen: 'brushing', key: 'brushing', label: 'Brush', image: require('../../assets/images/nav-brush-3d.png'), iconStyle: { width: 34, height: 38 } },
  { screen: 'games', key: 'games', label: 'Games', image: require('../../assets/images/nav-games-3d.png'), iconStyle: { width: 39, height: 35 } },
  { screen: 'rewards', key: 'rewards', label: 'Rewards', image: require('../../assets/images/nav-rewards-3d.png'), iconStyle: { width: 36, height: 36 } },
  { screen: 'settings', key: 'settings', label: 'Settings', image: require('../../assets/images/nav-settings-3d.png'), iconStyle: { width: 35, height: 35 } }
];

export const BottomNav = () => {
  const { screen, setScreen, t, theme } = useApp();

  return (
    <View pointerEvents="box-none" style={styles.shell}>
      <View style={styles.nav}>
        {navItems.map((item) => {
          const active = screen === item.screen;
          return (
            <Pressable
              key={item.screen}
              accessibilityRole="button"
              accessibilityLabel={t(item.key)}
              onPress={() => setScreen(item.screen)}
              style={[styles.item, active ? styles.activeItem : undefined]}
            >
              <Image source={item.image} style={[styles.icon, item.iconStyle]} resizeMode="contain" />
              <Text numberOfLines={1} style={[buttonFont, styles.label, { color: active ? theme.primary : '#7B8CA0' }]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  shell: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: 'transparent'
  },
  nav: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 34,
    paddingHorizontal: 9,
    paddingVertical: 9,
    shadowColor: '#17324D',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 9 },
    elevation: 9,
    gap: 10
  },
  item: {
    flex: 1,
    minHeight: 64,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5
  },
  activeItem: {
    backgroundColor: '#EAFBFA'
  },
  icon: {
    width: 35,
    height: 35
  },
  label: {
    fontSize: 12,
    lineHeight: 15,
    fontFamily: 'Fredoka_700Bold',
    textAlign: 'center'
  }
});

