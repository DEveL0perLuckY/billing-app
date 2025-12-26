// src/navigation/AppNavigator/AppNavigator.tsx
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import Ionicons from "@react-native-vector-icons/ionicons";
import CustomerScreen from "../../screens/CustomerScreen/CustomerScreen";
import HomeScreen from "../../screens/HomePageScreen/HomeScreen";
import ProductScreen from "../../screens/ProductScreen/ProductScreen";
import { fonts } from "../../theme/fonts";
import { colors } from "../../theme/colors";
import { size } from "../../theme/size";
import InvoiceScreen from "../../screens/InvoiceScreen/InvoiceScreen";

const Tab = createBottomTabNavigator();

const getTabIconName = (routeName: string, focused: boolean) => {
  switch (routeName) {
    case "Home":
      return focused ? "home" : "home-outline";
    case "Invoice":
      return focused ? "document-text" : "document-text-outline";
    case "Product":
      return focused ? "cube" : "cube-outline";
    case "Customer":
      return focused ? "people" : "people-outline";
    default:
      return "ellipse-outline";
  }
};

const renderTabIcon =
  (routeName: string) =>
  ({
    focused,
    color,
    size,
  }: {
    focused: boolean;
    color: string;
    size: number;
  }) => {
    const iconName = getTabIconName(routeName, focused);
    return <Ionicons name={iconName} size={size} color={color} />;
  };

const AppNavigator = () => (
  <Tab.Navigator
    id="AppTabs"
    screenOptions={({ route }) => ({
      headerShown: true,
      headerTitleAlign: "left",
      headerTitleStyle: {
        fontFamily: fonts.poppinsSemiBold,
        fontSize: size(15),
        color: colors.text.Primary,
      },
      headerStyle: {
        shadowOpacity: 0,
        elevation: 0,
        backgroundColor: colors.white,
      },
      tabBarIcon: renderTabIcon(route.name),
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textSecondary,
      tabBarStyle: {
        backgroundColor: colors.white,
        height: 60,
        paddingBottom: 8,
        borderTopWidth: 0,
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      tabBarLabelStyle: {
        fontSize: size(12),
        fontFamily: fonts.poppinsRegular,
      },
    })}
    initialRouteName="Home"
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen
      name="Invoice"
      options={{ headerTitle: "Invoices" }}
      component={InvoiceScreen}
    />
    <Tab.Screen
      name="Product"
      options={{ headerTitle: "Products" }}
      component={ProductScreen}
    />
    <Tab.Screen
      name="Customer"
      options={{ headerTitle: "Customers" }}
      component={CustomerScreen}
    />
  </Tab.Navigator>
);

export default AppNavigator;
