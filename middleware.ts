import { NextRequest, NextResponse } from "next/server";
import { serialize } from "cookie";
import { parseCookies, destroyCookie } from "nookies";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Bypass middleware untuk route logout
  if (pathname === '/api/logout') {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get('access_token')?.value;
  console.log(`Access token: ${accessToken}`); // Logging token
  console.log(`Pathname: ${pathname}`); // Logging pathname

  if (accessToken) {
    const token = 'Bearer ' + accessToken;
    try {
      const requestOption = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
      };

      const verifyTokenURL = 'http://localhost:3001/verify-token';
      const res = await fetch(verifyTokenURL, requestOption);
      const resData = await res.json();
      console.log('Verification response:', resData); // Logging response

      if (!resData.error) {
        const isAdmin = resData.data.isAdmin;
        console.log(`User isAdmin: ${isAdmin}`); // Logging isAdmin

        if (pathname === '/auth/login' || pathname === '/auth/register' || pathname === '/') {
          if (isAdmin) {
            console.log('Redirecting to /pages/dashboard'); // Logging redirection
            return NextResponse.redirect(new URL('/pages/dashboard', request.url));
          } else {
            console.log('Redirecting to /auth/access'); // Logging redirection
            return NextResponse.redirect(new URL('/auth/access', request.url));
          }
        }
        // Untuk rute lain selain login, register, atau root
        return NextResponse.next();
      }

      console.log('Token verification failed, redirecting to /auth/login'); // Logging failed verification
      const response = NextResponse.redirect(new URL('/auth/login', request.url));
      response.headers.append(
        'Set-Cookie',
        serialize('access_token', '', {
          path: '/',
          expires: new Date(0),
        })
      );
      return response;
    } catch (error) {
      console.error('Error during token verification:', error); // Logging error
      destroyCookie(null, 'access_token');
      const response = NextResponse.redirect(new URL('/auth/login', request.url));
      response.headers.append(
        'Set-Cookie',
        serialize('access_token', '', {
          path: '/',
          expires: new Date(0),
        })
      );
      return response;
    }
  }

  // Jika tidak ada access token dan mencoba mengakses halaman dashboard atau root ("/")
  if (!accessToken && (pathname.startsWith('/pages/dashboard') || pathname === '/')) {
    console.log('No access token, redirecting to /auth/login'); // Logging no token
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Untuk semua request lain, lanjutkan tanpa perubahan
  return NextResponse.next();
}
