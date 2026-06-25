import React from 'react';
import { Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { RootScreen } from '../types/app';
import { buttonFont } from '../utils/kidStyle';

const navItems: { screen: RootScreen; key: string; label: string; image: ImageSourcePropType; iconStyle?: object }[] = [
  { screen: 'childHome', key: 'home', label: 'Home', image: require('../../assets/images/nav-home.png') },
  { screen: 'brushing', key: 'brushing', label: 'Brush', image: require('../../assets/images/home-toothbrush.png'), iconStyle: { transform: [{ rotate: '-24deg' }] } },
  { screen: 'games', key: 'games', label: 'Games', image: require('../../assets/images/home-console.png') },
  { screen: 'rewards', key: 'rewards', label: 'Rewards', image: require('../../assets/images/home-trophy.png') },
  { screen: 'settings', key: 'settings', label: 'Settings', image: require('../../assets/images/nav-settings.png') }
];

export const BottomNav = () => {
  const { screen, setScreen, t, theme } = useApp();

  return (
    <View style={[styles.shell, { backgroundColor: theme.background }]}>
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
              <Text numberOfLines={1} style={[buttonFont, styles.label, { color: active ? theme.primary : '#8C9AAA' }]}>
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
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 10
  },
  nav: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    paddingHorizontal: 10,
    paddingVertical: 8,
    shadowColor: '#17324D',
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7
  },
  item: {
    flex: 1,
    minHeight: 60,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2
  },
  activeItem: {
    backgroundColor: '#E7F8F2'
  },
  icon: {
    width: 29,
    height: 29
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '900',
    textAlign: 'center'
  }
});

