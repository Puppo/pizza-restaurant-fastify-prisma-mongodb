import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import {
  IngredientDtoSchema,
  IngredientIdSchema,
} from "../../../dtos/ingredients";

const routes: FastifyPluginAsyncTypebox = async server => {
  server.get(
    "",
    {
      schema: {
        tags: ["Ingredients"],
        params: Type.Object({
          id: IngredientIdSchema,
        }),
        response: {
          200: IngredientDtoSchema,
        },
      },
    },
    async (request, reply) => {
      const ingredient = await server.dbContext.ingredient.findUnique({
        where: {
          id: request.params.id,
        },
      });
      if (!ingredient) return reply.notFound();

      return ingredient;
    }
  );
};

export default routes;
