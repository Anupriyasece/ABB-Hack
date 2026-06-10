export const ENV = {
  appId: process.env.VITE_APP_ID ?? "mock-app-id",
  cookieSecret: process.env.JWT_SECRET ?? "mock-cookie-secret-123456789012345678901234567890",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "http://localhost:3000",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "mock-user-openid",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "https://api.groq.com/openai",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};
