import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Toast from "react-native-toast-message";

import { RootStackParamList } from "./types";
import AppNavigator from "./AppNavigator";
import { useAuth } from "../context/AuthProvider";
import LoginScreen from "../screens/AuthScreen/LoginScreen";
import ConfirmationScreen from "../screens/InvoiceScreen/ConfirmationScreen";
import CreateInvoiceScreen from "../screens/InvoiceScreen/CreateInvoiceScreen";
import InvoiceDetailScreen from "../screens/InvoiceScreen/InvoiceDetailScreen";
import SelectCustomerModule from "../screens/InvoiceScreen/SelectCustomerModule";
import SelectProductModule from "../screens/InvoiceScreen/SelectProductModule";
import CustomerFormScreen from "../screens/CustomerScreen/CustomerFormScreen";
import InventoryStatsScreen from "../screens/ProductScreen/InventoryStatsScreen";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";
import { size } from "../theme/size";

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: true,
          orientation: "portrait_up",
          headerTitleAlign: "left",
          headerTitleStyle: {
        fontFamily: fonts.poppinsSemiBold,
            fontSize: size(15),
            color: colors.text.Primary,
          },
          headerStyle: {
            backgroundColor: colors.white,
          },
        }}
      >
        {user ? (
          <>
            <Stack.Screen
              name="Tabs"
              options={{ headerShown: false }}
              component={AppNavigator}
            />
            <Stack.Screen
              name="InvoiceDetail"
              component={InvoiceDetailScreen}
              options={{ title: "Invoice Detail" }}
            />
            <Stack.Screen
              name="CreateInvoice"
              component={CreateInvoiceScreen}
              options={{ title: "Create Invoice" }}
            />
            <Stack.Screen
              name="CustomerForm"
              component={CustomerFormScreen}
              options={({ route }) => ({
                title: route.params?.customer
                  ? "Edit Customer"
                  : "New Customer",
              })}
            />
            <Stack.Screen
              name="SelectCustomerModule"
              component={SelectCustomerModule}
              options={{ title: "Select Customer" }}
            />
            <Stack.Screen
              name="SelectProductModule"
              component={SelectProductModule}
              options={{ title: "Select Product" }}
            />
            <Stack.Screen
              name="ConfirmationScreen"
              component={ConfirmationScreen}
              options={{ title: "Confirm Details" }}
            />
            <Stack.Screen
              name="InventoryStats"
              component={InventoryStatsScreen}
              options={{ title: "Inventory Stats" }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" options={{ headerShown: false }} component={LoginScreen} />
          </>
        )}
      </Stack.Navigator>
      <Toast autoHide={true} visibilityTime={3000} position="bottom" />
    </NavigationContainer>
  );
};

export default RootNavigator;
