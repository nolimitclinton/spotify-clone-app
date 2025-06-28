import { COLORS } from '@/constants/theme';
import { Image, StyleSheet } from 'react-native';

export default function TabIcon({
  focused,
  activeIcon,
  inactiveIcon,
  tint = false,
}: {
  focused: boolean;
  activeIcon: any;
  inactiveIcon?: any;
  tint?: boolean;
}) {
  const iconSource = tint ? activeIcon : (focused ? activeIcon : inactiveIcon);

  return (
    <Image
      source={iconSource}
      style={[
        styles.icon,
        tint && { tintColor: focused ? COLORS.white : COLORS.gray },
      ]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 26,
    height: 26,
  },
});