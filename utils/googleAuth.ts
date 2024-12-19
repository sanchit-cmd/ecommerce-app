import { useAuthRequest, makeRedirectUri } from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const [request, response, promptAsync] = useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
    expoClientId: process.env.EXPO_PUBLIC_EXPO_CLIENT_ID,
  });

  return { request, response, promptAsync };
};
const express = require('express');
const { sendOtp, verifyOtp } = require('../controllers/mobileOtpController');
const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

module.exports = router;