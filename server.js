import "express-async-errors";
import * as dotenv from "dotenv";
import express from "express";
import http from "http";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import resolvers from "./graphql/resolver.js";
import { readFile } from "fs/promises";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { ApolloServerPluginLandingPageDisabled } from "@apollo/server/plugin/disabled";

// ===============================================================================================
// Initialization
// ===============================================================================================

dotenv.config();

const app = express();
const httpServer = http.createServer(app);
const port = process.env.PORT || 5199;

const typeDefs = await readFile("./graphql/schema.graphql", "utf-8");
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await apolloServer.start();

// ===============================================================================================
// Middleware
// ===============================================================================================

app.use(express.json());
app.use(cookieParser());

// ===============================================================================================
// Routes
// ===============================================================================================

// app.get("/api/v1/test", async (req, res) => {
//   const result = await db.query(`SELECT * FROM dummy_table`);

//   return res.status(200).json(result.rows[0]);
// });

app.use(
  "/",
  cors({
    origin: ["https://saile-test-client.netlify.app", "http://localhost:5173"],
    credentials: true,
  }),
  helmet({
    crossOriginEmbedderPolicy: process.env.NODE_ENV !== "development",
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "img-src": ["'self'", "https: data:"],
      },
    },
    crossOriginResourcePolicy: false,
  }),
  expressMiddleware(apolloServer, {
    context: ({ req, res }) => ({ req, res }),
  })
);

// ===============================================================================================
// Additional information
// ===============================================================================================

try {
  await new Promise((resolve) => httpServer.listen({ port }, resolve));
  console.log(`[Server message] Server is listening on port ${port}`);
} catch (error) {
  console.error(`[Server message] Error: ${error}`);
  process.exit(1);
}
