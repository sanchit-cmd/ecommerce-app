import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const redirectUri = Linking.createURL('api/auth/google/callback'); // Ensures redirect works on both Expo Go and standalone builds.

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "903303983661-336fqs06stuj9enua5nsfe0r9a5qe8nk.apps.googleusercontent.com",
    iosClientId: "903303983661-3eveeubne6c2vmqe8ip6mea8qu6ugbsr.apps.googleusercontent.com",
    webClientId: "903303983661-3eveeubne6c2vmqe8ip6mea8qu6ugbsr.apps.googleusercontent.com",
    responseType: "code",
    redirectUri,
    usePKCE: true,
  });

  return { request, response, promptAsync };
};``