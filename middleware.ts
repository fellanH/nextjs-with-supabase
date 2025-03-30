import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  // Check if accessing an admin route
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Create response to store cookies
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    // Create the supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // Get the user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If not authenticated, redirect to sign in
    if (!user) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // Check if the user is an admin
    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("id")
      .eq("user_id", user.id)
      .single();

    // If not an admin, redirect to homepage
    if (!adminUser) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return response;
  }

  // For non-admin routes, just update the session
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
