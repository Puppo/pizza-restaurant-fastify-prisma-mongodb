import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import {
  PaginationLimitSchema,
  PaginationOffsetSchema,
} from "../../dtos/pagination";
import {
  PizzaDtoSchema,
  PizzaInsertDtoSchema,
  PizzaSortingSchema,
  PizzasDtoSchema,
  PizzasQuerySorting,
} from "../../dtos/pizza";
import { convertSortingQueryString } from "../../utils/pagination";
import { IncludeIngredientsQuery, mapPizzaToDto } from "../../utils/pizza";

const routes: FastifyPluginAsyncTypebox = async server => {
  server.get(
    "",
    {
      schema: {
        tags: ["Pizzas"],
        querystring: Type.Object({
          query: Type.Optional(Type.String()),
          sort_by: PizzasQuerySorting,
          limit: PaginationLimitSchema,
          offset: PaginationOffsetSchema,
        }),
        response: {
          200: PizzasDtoSchema,
        },
      },
    },
    async (request, reply) => {
      const { query, sort_by, limit, offset } = request.query;
      const sortingConvertResult = convertSortingQueryString(
        sort_by,
        PizzaSortingSchema
      );
      if (sortingConvertResult.type === "error")
        return reply.badRequest(sortingConvertResult.error);

      const pizzas = await server.dbContext.pizza.findMany({
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
        include: IncludeIngredientsQuery,
      });

      return pizzas.map(mapPizzaToDto);
    }
  );

  server.post(
    "",
    {
      schema: {
        tags: ["Pizzas"],
        body: PizzaInsertDtoSchema,
        response: {
          201: PizzaDtoSchema,
        },
      },
    },
    async request => {
      const { name, ingredients } = request.body;
      const newPizza = await server.dbContext.pizza.create({
        data: {
          name,
          pizzaIngredients: {
            create: ingredients.map(ingredientId => ({
              ingredientId,
            })),
          },
        },
        include: IncludeIngredientsQuery,
      });
      return mapPizzaToDto(newPizza);
    }
  );
};

export default routes;
