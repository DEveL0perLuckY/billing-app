import React, { useEffect, useRef } from "react";
import {
  Image,
  Text,
  Animated,
  StyleSheet,
  View,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/fonts";
import { size } from "../../theme/size";

const { width } = Dimensions.get("window");

const MySplashScreen = ({ onAnimationComplete }: any) => {
  const scaleValue = useRef(new Animated.Value(0)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 3, // faster
        tension: 80, // stronger, snappier
        useNativeDriver: true,
      }),
      Animated.timing(fadeValue, {
        toValue: 1,
        duration: 350, // faster
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 350, // faster
        useNativeDriver: true,
      }),
    ]).start(() => {
      onAnimationComplete?.(); // call immediately
    });
  }, []);

  return (
    <View style={styles.flex1}>
      <LinearGradient
        colors={[colors.white, colors.neutralBackground]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <Animated.View
          style={[styles.iconContainer, { transform: [{ scale: scaleValue }] }]}
        >
          <Image
            source={require("../../assets/icons/app-icon.png")}
            style={styles.icon}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.textContainer,
            { opacity: fadeValue, transform: [{ translateY }] },
          ]}
        >
          <Text style={styles.appName}>Box Manager</Text>
          <Text style={styles.tagline}>Smart Stock & Billing System</Text>
        </Animated.View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 30,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  icon: {
    width: width * 0.45,
    height: width * 0.45,
  },
  textContainer: {
    alignItems: "center",
  },
  appName: {
    fontSize: size(32),
    color: colors.neutralText,
    letterSpacing: 0.5,
    marginBottom: 8,
    fontFamily: fonts.poppinsBold,
  },
  tagline: {
    fontSize: size(16),
    color: colors.textSecondary,
    letterSpacing: 1,
    fontFamily: fonts.poppinsRegular,
  },
});

export default MySplashScreen;
