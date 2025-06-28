import TabIcon from '@/components/TabIcon';
import { IMAGES } from '@/constants/images';
import { COLORS } from '@/constants/theme';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarStyle: { backgroundColor: COLORS.background}, tabBarShowLabel: true, 
    tabBarLabelStyle: { fontSize: 12, color: 'white' }, headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} activeIcon={IMAGES.homeActive} inactiveIcon={IMAGES.homeInactive} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} activeIcon={IMAGES.searchActive} inactiveIcon={IMAGES.searchInactive} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Library',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} activeIcon={IMAGES.libraryActive} tint={true}  />
          ),
        }}
      />
    </Tabs>
  );
}
