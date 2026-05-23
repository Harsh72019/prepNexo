const releaseDir = process.env.PREPNEXO_RELEASE_DIR || process.cwd();

module.exports = {
  apps: [
    {
      name: "prepnexo-web",
      cwd: `${releaseDir}/apps/web`,
      script: "node_modules/.bin/next",
      args: "start -p 3000",
      env: {
        NODE_ENV: "production",
        PORT: "3000"
      }
    },
    {
      name: "prepnexo-auth",
      cwd: releaseDir,
      script: "services/auth-service/dist/services/auth-service/src/server.js",
      env: {
        NODE_ENV: "production",
        PORT: "4001"
      }
    },
    {
      name: "prepnexo-interview",
      cwd: releaseDir,
      script: "services/interview-service/dist/services/interview-service/src/server.js",
      env: {
        NODE_ENV: "production",
        PORT: "4002"
      }
    },
    {
      name: "prepnexo-ai",
      cwd: releaseDir,
      script: "services/ai-service/dist/server.js",
      env: {
        NODE_ENV: "production",
        PORT: "4003"
      }
    }
  ]
};
