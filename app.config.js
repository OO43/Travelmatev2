// Native Maps SDK key only; never put the server Google Places key here.
module.exports = ({ config }) => {
  const key = process.env.GOOGLE_MAPS_ANDROID_API_KEY?.trim();
  return {
    ...config,
    plugins: [...(config.plugins ?? []), ...(key ? [['react-native-maps', { androidGoogleMapsApiKey: key }]] : [])],
  };
};
