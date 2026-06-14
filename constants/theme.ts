/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

const tintColorLight = "#2F7D55";
const tintColorDark = "#86D7A5";

export const Colors = {
  light: {
    text: "#18332B",
    background: "#F6F8F4",
    tint: tintColorLight,
    icon: "#6E7C75",
    tabIconDefault: "#8A9690",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#EDF4EF",
    background: "#101411",
    tint: tintColorDark,
    icon: "#A8B5AD",
    tabIconDefault: "#7E8A82",
    tabIconSelected: tintColorDark,
  },
};

export const BloomPalette = {
  light: {
    background: "#F6F8F4",
    surface: "#FFFFFF",
    surfaceMuted: "#EFF5F0",
    primary: "#2F7D55",
    primarySoft: "#DCEFE3",
    accent: "#D48C45",
    accentSoft: "#FFF0D9",
    danger: "#C84646",
    dangerSoft: "#FBE7E5",
    text: "#18332B",
    muted: "#66746D",
    border: "#DCE7DF",
    shadow: "#18332B",
  },
  dark: {
    background: "#101511",
    surface: "#18201B",
    surfaceMuted: "#202B24",
    primary: "#86D7A5",
    primarySoft: "#1D3A29",
    accent: "#F1B86A",
    accentSoft: "#3A2D1D",
    danger: "#FF8D85",
    dangerSoft: "#3A2220",
    text: "#EDF4EF",
    muted: "#A8B5AD",
    border: "#2B382F",
    shadow: "#000000",
  },
} as const;

export const BloomSpacing = {
  screenX: 20,
  screenTop: 28,
  radius: 16,
  radiusSmall: 12,
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
