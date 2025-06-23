// // App.tsx
// import { createDrawerNavigator } from '@react-navigation/drawer';
// import { NavigationContainer } from '@react-navigation/native';
// import React from 'react';
// import HomeScreen from './app/_drawer/(tabs)/index';
// import CustomDrawerContent from './components/CustomDrawerContent';
// import LoginScreen from './screens/LoginScreen';
// import { DrawerParamList } from './types';

// const Drawer = createDrawerNavigator<DrawerParamList>();

// export default function App() {
//   return (
//     <NavigationContainer>
//       <Drawer.Navigator
//         screenOptions={{ headerShown: false }}
//         drawerContent={(props) => <CustomDrawerContent {...props} />}
//       >
//         <Drawer.Screen name="Home" component={HomeScreen} />
//         <Drawer.Screen name="Login" component={LoginScreen} />
//       </Drawer.Navigator>
//     </NavigationContainer>
//   );
// }