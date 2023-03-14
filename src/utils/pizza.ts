import { Prisma } from "@prisma/client";
import { PizzaDto } from "../dtos/pizza";

export const IncludeIngredientsQuery = {
  pizzaIngredients: {
    include: {
      ingredient: true,
    },
  },
} satisfies Prisma.PizzaInclude;

export function mapPizzaToDto(
  pizza: Prisma.PizzaGetPayload<{
    include: typeof IncludeIngredientsQuery;
  }>
): PizzaDto {
  return {
    id: pizza.id,
    name: pizza.name,
    ingredients: pizza.pizzaIngredients.map(({ ingredient }) => ({
      id: ingredient.id,
      name: ingredient.name,
    })),
  };
}
