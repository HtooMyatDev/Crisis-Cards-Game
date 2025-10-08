import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    const isAuthenticated = request.cookies.get("token");
    const userRole = request.cookies.get("role");
    const currentPath = request.nextUrl.pathname;


if (!isAuthenticated && !request.nextUrl.pathname.startsWith("/auth")) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    if (isAuthenticated && request.nextUrl.pathname.startsWith("/auth")) {
        const redirectPath = userRole?.value === 'ADMIN' ? '/admin/dashboard' : '/user/home';
        return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    // Role-based guard: prevent users from accessing admin paths and vice versa
    if (isAuthenticated) {
        if (currentPath.startsWith('/admin') && userRole?.value !== 'ADMIN') {
            return NextResponse.redirect(new URL('/user/home', request.url));
        }
        if (currentPath.startsWith('/user') && userRole?.value === 'ADMIN') {
            return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/auth/:path*', '/user/:path*']
}
