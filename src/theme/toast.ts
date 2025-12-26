import Toast from 'react-native-toast-message';

export const toast = (
  type: 'success' | 'error' | 'info' = 'success',
  title: string = '',
  message: string = '',
  duration: number = 3000,
) => {
  Toast.show({
    type,
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: duration,
    autoHide: true,
  });
};
