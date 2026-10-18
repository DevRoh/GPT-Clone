import { email, string, z } from "zod";

// name, age, email, password

export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Minimum length should be 3")
    .max(30, "Maximum length should be 3"),
  age: z
    .number()
    .min(10, "Minimum age should be 10")
    .max(100, "Max length of age should be 100")
    .optional(),
  email: z.preprocess(
    (value) => (typeof value == "string" ? value.trim().toLowerCase() : ""),
    z.email("Email must be valid"),
  ),

  password: z
    .string()
    .min(8)
    .max(30)
    .regex(/[A-Z]/, "Your password should have atleast 1 upper case")
    .regex(/[a-z]/, "Your password should have atlease 1 small case")
    .regex(/[0-9]/, "Your password should have 1 number")
    .regex(
      [/[]~!@#%&()_/],
      "Your password should have atleast 1 special character",
    ),
});

export const loginSchema = z.object({
  email: z.preprocess(
    (value) => (typeof value == "string" ? value.toLowerCase().trim() : ""),
    z.email("Email format is incorrect"),
  ),
  password: z
    .string()
    .min(8)
    .max(30)
    .regex(/[A-Z]/, "Your password should have atleast 1 upper case")
    .regex(/[a-z]/, "Your password should have atlease 1 small case")
    .regex(/[0-9]/, "Your password should have 1 number")
    .regex(
      [/[]~!@#%&()_/],
      "Your password should have atleast 1 special character",
    ),
});
