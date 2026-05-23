module.exports = {
  apps: [
    {
      name: "prepnexo-web",
      cwd: process.env.PREPNEXO_RELEASE_DIR || process.cwd(),
      script: "node_modules/next/dist/bin/next",
      args: "start apps/web -p 3000",
      env: {
        NODE_ENV: "production",
        PORT: "3000"
      }
    },
    {
      name: "prepnexo-auth",
      cwd: process.env.PREPNEXO_RELEASE_DIR || process.cwd(),
      script: "services/auth-service/dist/server.js",
      env: {
        NODE_ENV: "production",
        PORT: "4001"
      }
    },
    {
      name: "prepnexo-interview",
      cwd: process.env.PREPNEXO_RELEASE_DIR || process.cwd(),
      script: "services/interview-service/dist/server.js",
      env: {
        NODE_ENV: "production",
        PORT: "4002"
      }
    },
    {
      name: "prepnexo-ai",
      cwd: process.env.PREPNEXO_RELEASE_DIR || process.cwd(),
      script: "services/ai-service/dist/server.js",
      env: {
        NODE_ENV: "production",
        PORT: "4003"
      }
    }
  ]
};
