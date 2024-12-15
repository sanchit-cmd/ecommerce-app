/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#c8fc8c';
const tintColorDark = '#c8fc8c';

export const Colors = {
  light: {
    primary: '#c8fc8c',
    secondary: '#c8fc8c',
    text: '#1F2937', 
    background: '#FFFFFF',
    tint: tintColorLight,
    tabIconDefault: '#9CA3AF', 
    tabIconSelected: tintColorLight,
    border: '#E5E5E5',
    error: '#EF4444', 
    success: '#c8fc8c', 
    placeholder: '#9CA3AF',
    card: '#F9FAFB', 
    inputBackground: '#F3F4F6',
  },
  dark: {
    primary: '#c8fc8c',
    secondary: '#c8fc8c',
    text: '#F9FAFB', 
    background: '#1F2937', 
    tint: tintColorDark,
    tabIconDefault: '#9CA3AF', 
    tabIconSelected: tintColorDark,
    border: '#374151', 
    error: '#EF4444', 
    success: '#c8fc8c', 
    placeholder: '#9CA3AF',
    card: '#374151', 
    inputBackground: '#374151',
  },
};
