import autoLoad from "@fastify/autoload";
import fastify from "fastify";
import path from "path";

const app = fastify();

app.register(import("@fastify/sensible"));
app.register(import("@fastify/cors"));
app.register(import("@fastify/swagger"));
app.register(import("@fastify/swagger-ui"), {
  routePrefix: "/docs",
});

app.register(autoLoad, {
  dir: path.join(__dirname, "plugins"),
});

app.register(autoLoad, {
  dir: path.join(__dirname, "routes"),
  options: { prefix: "/api" },
  routeParams: true,
});

export default app;
