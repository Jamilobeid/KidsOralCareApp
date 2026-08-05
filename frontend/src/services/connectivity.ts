import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export const hasInternetConnection = (state: NetInfoState) =>
  state.isConnected === true && state.isInternetReachable !== false;

export const getCurrentInternetConnection = async () => hasInternetConnection(await NetInfo.fetch());

export const subscribeToInternetConnection = (listener: (isOnline: boolean) => void) =>
  NetInfo.addEventListener((state) => listener(hasInternetConnection(state)));
