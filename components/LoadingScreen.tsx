import { View, StyleSheet, Dimensions, Image, Text } from 'react-native';
import { useEffect, useState } from 'react';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  withSequence,
  useSharedValue,
  withRepeat,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const LoadingDots = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <Text style={styles.loadingText}>Loading{dots}</Text>
  );
};

export function LoadingScreen() {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(1);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Initial animation
    scale.value = withSpring(1, {
      damping: 8,
      stiffness: 100,
    });

    // Exit animation after 2 seconds
    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { 
        duration: 800,
        easing: Easing.out(Easing.ease) 
      });
      scale.value = withSequence(
        withSpring(1.2, { damping: 10 }),
        withSpring(0, { damping: 12 })
      );
      setTimeout(() => setIsVisible(false), 800);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <Image 
          source={require('../assets/images/logo.jpg')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
      <View style={styles.loadingContainer}>
        <LoadingDots />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: width,
    height: height,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  logoContainer: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: height * 0.2,
  },
  loadingText: {
    fontSize: 18,
    color: '#22C55E',
    fontWeight: '600',
    minWidth: 80,
    textAlign: 'center',
  },
});
