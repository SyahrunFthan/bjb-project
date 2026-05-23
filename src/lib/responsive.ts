import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base design size (375 = iPhone 11)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

export const wp = (percent: number) => (SCREEN_WIDTH * percent) / 100;
export const hp = (percent: number) => (SCREEN_HEIGHT * percent) / 100;

export const scale = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size;
export const verticalScale = (size: number) => (SCREEN_HEIGHT / BASE_HEIGHT) * size;
export const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;
