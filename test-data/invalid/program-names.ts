/** Curated invalid Program Name values — not Faker. Keep this list reviewed. */
export const INVALID_PROGRAM_NAMES = {
  empty: "",
  whitespace: "   ",
  tabs: "\t\t",
  newline: "Name\nWithNewline",
  tooLong: "M".repeat(101),
} as const;
