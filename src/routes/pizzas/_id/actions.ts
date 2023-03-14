import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { PizzaDtoSchema, PizzaIdSchema } from "../../../dtos/pizza";
import { IncludeIngredientsQuery, mapPizzaToDto } from "../../../utils/pizza";

const routes: FastifyPluginAsyncTypebox = async server => {
  server.delete(
    "",
    {
      schema: {
        tags: ["Pizzas"],
        params: Type.Object({
          id: PizzaIdSchema,
        }),
        response: {
          200: PizzaDtoSchema,
        },
      },
    },
    async (request, reply) => {
      const ingredient = await server.dbContext.pizza.findUnique({
        where: {
          id: request.params.id,
        },
        include: IncludeIngredientsQuery,
      });
      if (!ingredient) return reply.notFound();

      await server.dbContext.$transaction(async t => {
        await t.pizzaIngredient.deleteMany({
          where: {
            pizzaId: request.params.id,
          },
        });
        return await t.pizza.delete({
          where: {
            id: request.params.id,
          },
        });
      });

      return mapPizzaToDto(ingredient);
    }
  );

  server.get(
    "",
    {
      schema: {
        tags: ["Pizzas"],
        params: Type.Object({
          id: PizzaIdSchema,
        }),
        response: {
          200: PizzaDtoSchema,
        },
      },
    },
    async (request, reply) => {
      const ingredient = await server.dbContext.pizza.findUnique({
        where: {
          id: request.params.id,
        },
        include: IncludeIngredientsQuery,
      });
      if (!ingredient) return reply.notFound();
      return mapPizzaToDto(ingredient);
    }
  );
};

export default routes;
