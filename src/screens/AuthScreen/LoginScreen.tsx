import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { useAuth } from "../../context/AuthProvider";
import Ionicons from "@react-native-vector-icons/ionicons";

import { LinearGradient } from "expo-linear-gradient";
import { size } from "../../theme/size";
import { fonts } from "../../theme/fonts";
import { toast } from "../../theme/toast";
import { colors } from "../../theme/colors";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { emailSignIn, emailSignUp, googleSignIn } = useAuth();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleAuth = async () => {
    setIsAuthenticating(true);
    try {
      if (isSignUp) {
        if (password.length < 6) {
          toast(
            "error",
            "Weak Password",
            "Password must be at least 6 characters long"
          );
          setIsAuthenticating(false);
          return;
        }
        await emailSignUp(email, password);
      } else {
        await emailSignIn(email, password);
      }
    } catch (error) {
      console.error(error);
      toast("error", "Authentication Error", "Something went wrong");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    try {
      await googleSignIn();
    } catch (error) {
      console.error(error);

      toast("error", "Google Sign-In Error", "Something went wrong");
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryLight, colors.white]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.headerContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.appName}>Box Manager</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.card,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.title}>
              {isSignUp ? "Create Account" : "Welcome Back"}
            </Text>
            <Text style={styles.subtitle}>
              {isSignUp
                ? "Sign up to get started"
                : "Sign in to continue managing your stock"}
            </Text>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="name@example.com"
                  placeholderTextColor={colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Enter your password"
                  placeholderTextColor={colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  style={styles.input}
                  secureTextEntry={!isPasswordVisible}
                />
                <TouchableOpacity
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {isAuthenticating ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator />
                <Text style={styles.loadingText}>
                  {isSignUp ? "Creating account..." : "Signing in..."}
                </Text>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={[
                    styles.button,
                    !(email && password) && styles.disabledButton,
                  ]}
                  onPress={handleAuth}
                  disabled={!email || !password || isAuthenticating}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={
                      email && password
                        ? [colors.primary, colors.azureblue]
                        : [colors.lightgray, colors.lightgray]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientButton}
                  >
                    <Text style={styles.buttonText}>
                      {isSignUp ? "Create Account" : "Sign In"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.orText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity
                  style={styles.googleButton}
                  onPress={handleGoogleSignIn}
                  disabled={isAuthenticating}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{
                      uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjzC2JyZDZ_RaWf0qp11K0lcvB6b6kYNMoqtZAQ9hiPZ4cTIOB",
                    }}
                    style={styles.googleIcon}
                  />

                  <Text style={styles.googleButtonText}>
                    Continue with Google
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <View style={styles.footer}>
              <Text style={styles.switchAuthText}>
                {isSignUp
                  ? "Already have an account? "
                  : "Don't have an account? "}
              </Text>
              <TouchableOpacity
                onPress={() => setIsSignUp(!isSignUp)}
                disabled={isAuthenticating}
              >
                <Text style={styles.switchAuthHighlight}>
                  {isSignUp ? "Sign In" : "Sign Up"}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  googleIcon: { width: 25, height: 25 },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoContainer: {
    width: size(100),
    height: size(100),
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: size(25),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  appName: {
    fontSize: size(32),
    fontFamily: fonts.poppinsBold,
    color: colors.white,
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  appTagline: {
    fontSize: size(14),
    fontFamily: fonts.poppinsMedium,
    color: colors.primaryLight,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: size(24),
    padding: 24,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: size(24),
    fontFamily: fonts.poppinsBold,
    color: colors.text.Primary,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: size(14),
    fontFamily: fonts.poppinsRegular,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 32,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: size(14),
    fontFamily: fonts.poppinsMedium,
    color: colors.text.Primary,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutralBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    height: size(56),
  },
  inputIcon: {
    marginRight: 12,
  },
  eyeIcon: {
    padding: 4,
  },
  input: {
    flex: 1,
    fontSize: size(16),
    color: colors.text.Primary,
    fontFamily: fonts.poppinsRegular,
    height: "100%",
  },
  button: {
    marginTop: 12,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    shadowOpacity: 0,
    elevation: 0,
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: colors.white,
    fontFamily: fonts.poppinsBold,
    fontSize: size(16),
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  orText: {
    marginHorizontal: 16,
    color: colors.textSecondary,
    fontFamily: fonts.poppinsMedium,
    fontSize: size(12),
  },
  googleButton: {
    flexDirection: "row",
    backgroundColor: colors.white,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  googleButtonText: {
    color: colors.text.Primary,
    marginLeft: 12,
    marginTop: 5,
    fontFamily: fonts.poppinsSemiBold,
    fontSize: size(16),
  },
  loadingContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 12,
    color: colors.textSecondary,
    fontFamily: fonts.poppinsMedium,
    fontSize: size(14),
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  switchAuthText: {
    color: colors.textSecondary,
    fontSize: size(14),
    fontFamily: fonts.poppinsRegular,
  },
  switchAuthHighlight: {
    color: colors.primary,
    fontFamily: fonts.poppinsBold,
    fontSize: size(14),
  },
});

export default LoginScreen;
