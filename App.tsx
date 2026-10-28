// ShopSphere entry: providers + all navigation (bottom tabs inside a native stack).
// Every screen in the app is registered here, so this file is the full map.
import React from 'react';
import { Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, NavigatorScreenParams } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ShopProvider, useShop } from './store';
import { COLORS } from './ui';
import Home from './screens/Home';
import Search from './screens/Search';
import Cart from './screens/Cart';
import Wishlist from './screens/Wishlist';
import Account from './screens/Account';
import ProductDetails from './screens/Product';
import { Checkout, Confirmation } from './screens/Checkout';
import Orders, { Tracking } from './screens/Orders';
import Admin from './screens/Admin';
import About, { Contact } from './screens/About';

export type TabParamList = {
  Home: undefined;
  Search: undefined;
  Cart: undefined;
  Wishlist: undefined;
  Account: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  Product: { productId: string };
  Checkout: undefined;
  Confirmation: { orderId: string };
  Orders: undefined;
  Tracking: { orderId: string };
  Admin: undefined;
  About: undefined;
  Contact: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const TAB_ICONS: Record<keyof TabParamList, string> = {
  Home: '🏠', Search: '🔍', Cart: '🛒', Wishlist: '♥', Account: '👤',
};

function Tabs() {
  const { cartCount, wishlist } = useShop();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarIcon: ({ color }) => <Text style={{ fontSize: 21, color }}>{TAB_ICONS[route.name]}</Text>,
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Search" component={Search} />
      <Tab.Screen
        name="Cart" component={Cart}
        options={cartCount > 0 ? { tabBarBadge: cartCount, tabBarBadgeStyle: { backgroundColor: COLORS.accent } } : {}}
      />
      <Tab.Screen
        name="Wishlist" component={Wishlist}
        options={wishlist.length > 0 ? { tabBarBadge: wishlist.length, tabBarBadgeStyle: { backgroundColor: COLORS.accent } } : {}}
      />
      <Tab.Screen name="Account" component={Account} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ShopProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: COLORS.primary },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: '800' },
            }}
          >
            <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
            <Stack.Screen name="Product" component={ProductDetails} options={{ title: 'Product' }} />
            <Stack.Screen name="Checkout" component={Checkout} options={{ title: 'Checkout' }} />
            <Stack.Screen name="Confirmation" component={Confirmation} options={{ title: 'Order Placed', headerBackVisible: false }} />
            <Stack.Screen name="Orders" component={Orders} options={{ title: 'My Orders' }} />
            <Stack.Screen name="Tracking" component={Tracking} options={{ title: 'Track Order' }} />
            <Stack.Screen name="Admin" component={Admin} options={{ title: 'Admin Dashboard' }} />
            <Stack.Screen name="About" component={About} options={{ title: 'About ShopSphere' }} />
            <Stack.Screen name="Contact" component={Contact} options={{ title: 'Help & Support' }} />
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="light" />
      </ShopProvider>
    </SafeAreaProvider>
  );
}
