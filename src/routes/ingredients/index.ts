import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import {
  IngredientDtoSchema,
  IngredientInsertDtoSchema,
  IngredientSortingSchema,
  IngredientsDtoSchema,
  IngredientsQuerySorting,
} from "../../dtos/ingredients";
import {
  PaginationLimitSchema,
  PaginationOffsetSchema,
} from "../../dtos/pagination";
import { convertSortingQueryString } from "../../utils/pagination";

const routes: FastifyPluginAsyncTypebox = async server => {
  server.get(
    "",
    {
      schema: {
        tags: ["Ingredients"],
        querystring: Type.Object({
          query: Type.Optional(Type.String()),
          sort_by: IngredientsQuerySorting,
          limit: PaginationLimitSchema,
          offset: PaginationOffsetSchema,
        }),
        response: {
          200: IngredientsDtoSchema,
        },
      },
    },
    async (request, reply) => {
      const { query, sort_by, limit, offset } = request.query;
      const sortingConvertResult = convertSortingQueryString(
        sort_by,
        IngredientSortingSchema
      );
      if (sortingConvertResult.type === "error")
        return reply.badRequest(sortingConvertResult.error);

      const ingredients = await server.dbContext.ingredient.findMany({
        where: {
          name: query
            ? {
                contains: query,
                mode: "insensitive",
              }
            : undefined,
        },
        orderBy: sortingConvertResult.sorting?.map(([key, direction]) => ({
          [key]: direction,
        })) || {
          name: "asc",
        },
        take: limit,
        skip: offset,
      });
      return ingredients.map(({ id, name }) => ({ id, name }));
    }
  );

  server.post(
    "",
    {
      schema: {
        tags: ["Ingredients"],
        body: IngredientInsertDtoSchema,
        response: {
          201: IngredientDtoSchema,
        },
      },
    },
    async request => {
      const { name } = request.body;
      const ingredient = await server.dbContext.ingredient.create({
        data: {
          name,
        },
      });
      return { id: ingredient.id, name: ingredient.name };
    }
  );
};

export default routes;
