import { faker } from "@faker-js/faker";

export type ProgramInput = {
  name: string;
  description: string;
};

/**
 * Happy-path program payload. Name includes a unique suffix so parallel
 * tests do not collide. Pass `overrides` for ticket-specific seeds.
 */
export function buildProgram(
  overrides: Partial<ProgramInput> = {},
): ProgramInput {
  return {
    name: `${faker.commerce.department()} ${Date.now()}`,
    description: faker.lorem.sentence(),
    ...overrides,
  };
}
