'use client';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Button } from 'primereact/button';

const AccessDeniedPage = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Hapus token dari cookie
      Cookies.remove('access_token');

      // Arahkan pengguna ke halaman login
      router.push('/auth/login');
    } catch (error) {
      console.error('Error during logout:', error);
      alert('An error occurred during logout. Please try again later.');
    }
  };

  return (
    <div className="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
      <div className="flex flex-column align-items-center justify-content-center">
        <div
          style={{
            borderRadius: '56px',
            padding: '0.3rem',
            background: 'linear-gradient(180deg, rgba(247, 149, 48, 0.4) 10%, rgba(247, 149, 48, 0) 30%)',
          }}
        >
          <div className="w-full surface-card py-8 px-5 sm:px-8 flex flex-column align-items-center" style={{ borderRadius: '53px' }}>
            <div className="flex justify-content-center align-items-center bg-pink-500 border-circle" style={{ height: '3.2rem', width: '3.2rem' }}>
              <i className="pi pi-fw pi-exclamation-circle text-2xl text-white"></i>
            </div>
            <h1 className="text-900 font-bold text-5xl mb-2">Access Denied</h1>
            <div className="text-600 mb-5">You do not have the necessary permissions.</div>
            <img src="/demo/images/access/asset-access.svg" alt="Error" className="mb-5" width="80%" />
            <Button icon="pi pi-arrow-left" label="Go to Login Page" text onClick={handleLogout} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessDeniedPage;
