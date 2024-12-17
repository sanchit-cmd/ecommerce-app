/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#1B5E20';
const tintColorDark = '#2E7D32';

export const Colors = {
  light: {
    primary: '#1B5E20',
    secondary: '#2E7D32',
    text: '#1F2937', 
    background: '#FFFFFF',
    tint: tintColorLight,
    tabIconDefault: '#9CA3AF', 
    tabIconSelected: tintColorLight,
    border: '#E5E5E5',
    error: '#EF4444', 
    success: '#1B5E20', 
    placeholder: '#9CA3AF',
    card: '#F9FAFB', 
    inputBackground: '#F3F4F6',
  },
  dark: {
    primary: '#2E7D32',
    secondary: '#43A047',
    text: '#F9FAFB', 
    background: '#1F2937', 
    tint: tintColorDark,
    tabIconDefault: '#9CA3AF', 
    tabIconSelected: tintColorDark,
    border: '#374151', 
    error: '#EF4444', 
    success: '#2E7D32', 
    placeholder: '#9CA3AF',
    card: '#374151', 
    inputBackground: '#374151',
  },
};
