import Constants from "expo-constants";

function devMachineHost() {
  const constants = Constants as typeof Constants & {
    manifest2?: { extra?: { expoClient?: { hostUri?: string } } };
  };
  const hostUri = Constants.expoConfig?.hostUri ?? constants.manifest2?.extra?.expoClient?.hostUri;
  return hostUri?.split(":")[0];
}

function serviceUrl(envValue: string | undefined, port: number) {
  if (envValue) return envValue;
  const host = devMachineHost();
  return `http://${host ?? "localhost"}:${port}`;
}

export const config = {
  authServiceUrl: serviceUrl(process.env.EXPO_PUBLIC_AUTH_SERVICE_URL, 4001),
  interviewServiceUrl: serviceUrl(process.env.EXPO_PUBLIC_INTERVIEW_SERVICE_URL, 4002),
  aiServiceUrl: serviceUrl(process.env.EXPO_PUBLIC_AI_SERVICE_URL, 4003)
};
