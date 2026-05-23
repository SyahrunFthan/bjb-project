import { createNavigationContainerRef, ParamListBase, CommonActions } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef<ParamListBase>();

export function navigate(name: string, params?: object) {
  if (!navigationRef.isReady()) return;
  navigationRef.navigate(name, params);
}

export function reset(name: string, params?: object) {
  if (!navigationRef.isReady()) return;
  navigationRef.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name, params }],
    })
  );
}
