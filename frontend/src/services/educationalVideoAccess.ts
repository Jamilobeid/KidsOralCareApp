import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export const hasInternetConnection = (state: NetInfoState) =>
  state.isConnected === true && state.isInternetReachable !== false;

export const checkInternetConnection = async () => hasInternetConnection(await NetInfo.fetch());

export const subscribeToInternetConnection = (listener: (isConnected: boolean) => void) =>
  NetInfo.addEventListener((state) => listener(hasInternetConnection(state)));
