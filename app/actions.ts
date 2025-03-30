"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required"
    );
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    return encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link."
    );
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/client-portal");
};

// This function is not needed for client-side OAuth, as it's handled directly by the GoogleButton component
// and the callback route, but it's included for completeness
export const handleGoogleAuthCallback = async (code: string) => {
  const supabase = await createClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/client-portal");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password"
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password."
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required"
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match"
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed"
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

// New server action for creating clients with associated users
export async function createClientWithUser(data: {
  name: string;
  email: string;
  phone?: string;
  company?: string;
}) {
  const supabase = await createClient();

  try {
    // First check if the user exists by email
    const { data: existingUsers, error: userError } = await supabase
      .from("auth.users")
      .select("id")
      .eq("email", data.email);

    if (userError) {
      console.error("Error checking for existing user:", userError);
      throw new Error(`User lookup failed: ${userError.message}`);
    }

    let userId;

    if (!existingUsers || existingUsers.length === 0) {
      // Create a new user via invite - this is safer than direct creation
      // The user will receive an email to set up their account
      const { data: newUser, error: createError } =
        await supabase.auth.admin.inviteUserByEmail(data.email);

      if (createError) {
        console.error("Error creating user:", createError);
        throw new Error(`User creation failed: ${createError.message}`);
      }

      userId = newUser.user.id;
    } else {
      userId = existingUsers[0].id;
    }

    // Create client record
    const { error: clientError } = await supabase.from("clients").insert({
      name: data.name,
      user_id: userId,
      phone: data.phone || null,
      company: data.company || null,
    });

    if (clientError) {
      console.error("Error creating client:", clientError);
      throw new Error(`Client creation failed: ${clientError.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error in createClientWithUser:", error);
    throw error;
  }
}
