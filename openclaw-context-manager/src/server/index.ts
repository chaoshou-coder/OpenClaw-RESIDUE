import Fastify from "fastify";
import { getConfig } from "../config.js";
import { loadHardState } from "../state/hard-state.js";
import { getLatestAssertions, appendAssertion } from "../state/assertions.js";
import { SessionManager } from "../session/manager.js";
import { resolve } from "node:path";

export interface ServerOptions {
  port?: number;
  dataDir?: string;
}

export async function startServer(options: ServerOptions = {}): Promise<{ url: string; close: () => Promise<void> }> {
  const config = getConfig();
  const port = options.port ?? config.server.port;
  const dataDir = resolve(process.cwd(), options.dataDir ?? config.dataDir);
  const limit = config.assertions.defaultLimit;

  const fastify = Fastify({ logger: true });

  fastify.get("/health", async () => ({ ok: true }));

  fastify.get("/state", async (_req, reply) => {
    const state = loadHardState(dataDir);
    const assertions = getLatestAssertions(dataDir, limit);
    return reply.send({ state, assertions });
  });

  fastify.post<{ Body: { type?: string; content?: string } }>("/assertion", async (req, reply) => {
    const { type, content } = req.body ?? {};
    if (!type || !content) {
      return reply.status(400).send({ error: "type and content required" });
    }
    const valid = ["fact", "decision", "rejection", "todo"];
    if (!valid.includes(type)) {
      return reply.status(400).send({ error: "type must be one of: " + valid.join(", ") });
    }
    const a = appendAssertion(dataDir, { type: type as "fact" | "decision" | "rejection" | "todo", content, source: "manual" });
    return reply.send(a);
  });

  fastify.post("/review", async (_req, reply) => {
    const mgr = new SessionManager({ dataDir });
    mgr.review();
    return reply.send({ phase: "review" });
  });

  await fastify.listen({ port, host: "0.0.0.0" });
  const url = `http://127.0.0.1:${port}`;
  return {
    url,
    close: () => fastify.close(),
  };
}
