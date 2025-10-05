import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    const isAuthenticated = request.cookies.get("token");

    if (!isAuthenticated && !request.nextUrl.pathname.startsWith("/auth")) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    if (isAuthenticated && request.nextUrl.pathname.startsWith("/auth")) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/auth/:path*', '/user/:path*']
}
