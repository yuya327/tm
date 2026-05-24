import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

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
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // セッション取得 (トークン更新トリガ)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthRequired =
    path.startsWith("/albums") || path.startsWith("/orders");
  const isAuthPath = path === "/" || path.startsWith("/auth");

  // 未ログインで保護ページにアクセス → ログインページへ
  if (!user && isAuthRequired) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // ログイン済みでログインページに来た → アルバム一覧へ
  if (user && path === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/albums";
    return NextResponse.redirect(url);
  }

  return response;
}
