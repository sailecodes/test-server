import "express-async-errors";
import * as dotenv from "dotenv";
import express from "express";
// import url from "url";
// import path, { dirname } from "path";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import resolvers from "./resolver.js";
import db from "./db/initDB.js";
import { readFile } from "fs/promises";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";

// ===============================================================================================
// Initialization
// ===============================================================================================

dotenv.config();

const app = express();
const port = process.env.PORT || 5199;
// const __dirname = dirname(url.fileURLToPath(import.meta.url));

const typeDefs = await readFile("./schema.graphql", "utf-8");
const apolloServer = new ApolloServer({ typeDefs, resolvers });

await apolloServer.start();

// ===============================================================================================
// Middleware
// ===============================================================================================

// app.use(express.static(path.resolve(__dirname, "./public")));
app.use(express.json());
app.use(cookieParser());
app.use(
  helmet({
    crossOriginEmbedderPolicy: process.env.NODE_ENV !== "development",
    contentSecurityPolicy: process.env.NODE_ENV !== "development",
  })
);
app.use(
  cors({
    origin: ["https://saile-test-client.netlify.app/", "http://localhost:5173"],
    credentials: true,
  })
);

// ===============================================================================================
// Routes
// ===============================================================================================

app.get("/", (req, res) => {
  return res.status(200).json({ data: "home" });
});

app.get("/api/v1/test", async (req, res) => {
  const result = await db.query(`SELECT * FROM dummy_table`);

  return res.status(200).json(result.rows[0]);
});

app.use(
  "/graphql",
  expressMiddleware(apolloServer, {
    context: ({ req, res }) => ({ req, res }),
  })
);

// ===============================================================================================
// Additional information
// ===============================================================================================

try {
  app.listen(port, () => {
    console.log(`(Server message) Server is listening on port ${port}`);
    console.log(`[Server message] GraphQL endpoint at http://localhost:${port}/graphql`);
  });
} catch (error) {
  console.error(`Error message: ${error}`);
  process.exit(1);
}
