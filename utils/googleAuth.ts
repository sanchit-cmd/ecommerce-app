import { useAuthRequest } from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const [request, response, promptAsync] = useAuthRequest({
    androidClientId:"903303983661-3eveeubne6c2vmqe8ip6mea8qu6ugbsr.apps.googleusercontent.com",
    iosClientId: "903303983661-3eveeubne6c2vmqe8ip6mea8qu6ugbsr.apps.googleusercontent.com",
    clientId: "903303983661-3eveeubne6c2vmqe8ip6mea8qu6ugbsr.apps.googleusercontent.com",
  });

  return { request, response, promptAsync };
};