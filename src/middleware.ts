import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    const isAuthenticated = request.cookies.get("token");
    const userRole = request.cookies.get("role");
    const currentPath = request.nextUrl.pathname;

    // Direct Access for 'Live' Mode deployments (Environment-Based Routing)
    if (process.env.NEXT_PUBLIC_APP_MODE === 'live' && currentPath === '/') {
        return NextResponse.rewrite(new URL('/live', request.url));
    }


    if (!isAuthenticated && (request.nextUrl.pathname.startsWith("/admin") || request.nextUrl.pathname.startsWith("/user"))) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // Prevent authenticated users from accessing /auth pages (Login/Register)
    if (isAuthenticated && request.nextUrl.pathname.startsWith("/auth")) {
        const redirectPath = userRole?.value === 'ADMIN' ? '/admin/dashboard' : '/user/home';
        return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    // Prevent authenticated users from accessing /live page
    if (isAuthenticated && currentPath.startsWith('/live')) {
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
    matcher: ['/admin/:path*', '/auth/:path*', '/user/:path*', '/live', '/']
}
