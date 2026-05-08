"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function loginAction(formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirectTo: "/dashboard",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      switch (err.type) {
        case "CredentialsSignin":
          return { error: "Email ou senha inválidos." };
        default:
          return { error: "Algo deu errado. Tente novamente." };
      }
    }
    // NEXT-AUTH throws a NEXT_REDIRECT "error" on success — must rethrow it
    throw err;
  }
}
