'use client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import axios from 'axios';

interface LoginData {
    username: string;
    password: string;
}

const LoginPage = () => {
    const [loginData, setLoginData] = useState<LoginData>({
        username: '',
        password: ''
    });

    const [checked, setChecked] = useState(false);
    const router = useRouter();

    const containerClassName = classNames('surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden', { 'p-input-filled': true });

    const handleLogin = async () => {

        try {
            const response = await axios.post('http://localhost:3001/login', loginData);

            if (!response.data.error) {
                // Simpan token di cookie atau local storage
                document.cookie = `access_token=${response.data.token}; path=/;`;

                // Periksa status isAdmin
                const isAdmin = response.data.data.isAdmin; // Sesuaikan dengan struktur respons API Anda

                if (isAdmin) {
                    // Redirect ke halaman dashboard jika admin
                    router.push('/pages/dashboard');
                } else {
                    // Redirect ke halaman access jika bukan admin
                    router.push('/auth/access');
                }
            } else {
                console.error(`Login failed: ${response.data.message}`);
                // Display an error message to the user
                alert(`Login failed: ${response.data.message}`);
            }
        } catch (error) {
            console.error('Error during login:', error);
            // Display a generic error message to the user
            alert('An error occurred during login. Please try again later.');
        }
    };

    return (
        <div className={containerClassName}>
            <div className="flex flex-column align-items-center justify-content-center">
                <div
                    style={{
                        borderRadius: '56px',
                        padding: '0.3rem',
                        background: 'linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)'
                    }}
                >
                    <div className="w-full surface-card py-8 px-5 sm:px-8" style={{ borderRadius: '53px' }}>
                        <div className="text-center mb-5">
                            <div className="text-900 text-3xl font-medium mb-3">Welcome!</div>
                            <span className="text-600 font-medium">Sign in to continue</span>
                        </div>

                        <div>
                            <label htmlFor="email1" className="block text-900 text-xl font-medium mb-2">
                                Username
                            </label>
                            <InputText
                                id="email1"
                                type="text"
                                value={loginData.username}
                                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                                placeholder="Username"
                                className="w-full md:w-30rem mb-5"
                                style={{ padding: '1rem' }}
                            />

                            <label htmlFor="password1" className="block text-900 font-medium text-xl mb-2">
                                Password
                            </label>
                            <Password
                                inputId="password1"
                                value={loginData.password}
                                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                placeholder="Password"
                                toggleMask
                                className="w-full mb-5"
                                inputClassName="w-full p-3 md:w-30rem"
                            />
                            <div className="flex align-items-center justify-content-between mb-5 gap-5">
                                <div className="flex align-items-center">
                                    <Checkbox inputId="rememberme1" checked={checked} onChange={(e) => setChecked(e.checked ?? false)} className="mr-2"></Checkbox>
                                    <label htmlFor="rememberme1">Remember me</label>
                                </div>
                                <a className="font-medium no-underline ml-2 text-right cursor-pointer" style={{ color: 'var(--primary-color)' }}>
                                    Forgot password?
                                </a>
                            </div>
                            <Button label="Sign In" className="w-full p-3 text-xl" onClick={handleLogin}></Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
