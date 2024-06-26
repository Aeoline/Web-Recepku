'use client';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

const getAuthConfig = () => {
    const token = Cookies.get('access_token');
    if (!token) {
        console.error('No token found');
        return null;
    }

    return {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    };
};

const Dashboard = () => {
    const router = useRouter();
    const [recipeSize, setRecipeSize] = useState(0);
    const [userSize, setUserSize] = useState(0);
    const [latestRecipes, setLatestRecipes] = useState([]);
    const [latestUsers, setLatestUsers] = useState([]);

    useEffect(() => {
        // Pengecekan token dan redirect jika tidak ada token
        const token = Cookies.get('access_token');
        if (!token) {
            router.push('/auth/login');
        }
    }, [router]);

    useEffect(() => {
        async function fetchTotalRecipes() {
            const config = getAuthConfig();
            if (!config) {
                return; // Jika tidak ada token, hentikan eksekusi
            }

            try {
                const response = await fetch('https://backend-recepku-oop-rnrqe2wc3a-et.a.run.app/getTotalRecipes', config);
                if (!response.ok) {
                    throw new Error(`HTTP error ${response.status}`);
                }
                const data = await response.json();
                setRecipeSize(data.data.size);
            } catch (error) {
                console.error('Error fetching total recipes:', error);
                // Tambahkan penanganan kesalahan lainnya, seperti menampilkan pesan error
            }
        }
        fetchTotalRecipes();
    }, []);

    useEffect(() => {
        async function fetchTotalUsers() {
            const config = getAuthConfig();
            if (!config) {
                return; // Jika tidak ada token, hentikan eksekusi
            }

            try {
                const response = await fetch('https://backend-recepku-oop-rnrqe2wc3a-et.a.run.app/getTotalUsers', config);
                if (!response.ok) {
                    throw new Error(`HTTP error ${response.status}`);
                }
                const data = await response.json();
                setUserSize(data.data.size);
            } catch (error) {
                console.error('Error fetching total users:', error);
                // Tambahkan penanganan kesalahan lainnya, seperti menampilkan pesan error
            }
        }
        fetchTotalUsers();
    }, []);

    useEffect(() => {
        const fetchLatestRecipes = async () => {
            const config = getAuthConfig();
            if (!config) {
                return; // Jika tidak ada token, hentikan eksekusi
            }

            try {
                const response = await axios.get('https://backend-recepku-oop-rnrqe2wc3a-et.a.run.app/getLatestRecipes', config);
                setLatestRecipes(response.data.data.recipe.data);
            } catch (error) {
                console.error('Error fetching latest recipes:', error);
            }
        };

        fetchLatestRecipes();
    }, []);

    useEffect(() => {
        const fetchLatestUsers = async () => {
            const config = getAuthConfig();
            if (!config) {
                return; // Jika tidak ada token, hentikan eksekusi
            }

            try {
                const response = await axios.get('https://backend-recepku-oop-rnrqe2wc3a-et.a.run.app/getLatestUsers', config);
                const users = response.data.data.user.data;
                console.log('Latest Users:', users); // Debugging: Log data pengguna terbaru
                setLatestUsers(users);
            } catch (error) {
                console.error('Error fetching latest users:', error);
            }
        };

        fetchLatestUsers();
    }, []);

    const roleBodyTemplate = (rowData : any) => {
        return (
            <>
                <span className="p-column-title">Role</span>
                <div>{rowData.role ? 'Admin' : 'User'}</div>
            </>
        );
    };

    return (
        <div className="grid">
            <div className="col-12 xl:col-6">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Recipes</span>
                            <div className="text-900 font-medium text-xl">{recipeSize}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-12 xl:col-6">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Users</span>
                            <div className="text-900 font-medium text-xl">{userSize}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-12 xl:col-6">
                <div className="card">
                    <h5>Recent Recipes</h5>
                    <DataTable value={latestRecipes} rows={5} paginator responsiveLayout="scroll">
                        <Column header="Image" body={(data) => <img className="shadow-2" src={data.photo} alt={data.title} width="70" />} />
                        <Column field="title" header="Name" sortable style={{ width: '35%' }} />
                        <Column field="calories" header="Calories" sortable style={{ width: '30%' }} />
                    </DataTable>
                </div>
            </div>

            <div className="col-12 xl:col-6">
                <div className="card">
                    <h5>Recent Users</h5>
                    <DataTable value={latestUsers} rows={5} paginator responsiveLayout="scroll">
                        <Column field="username" header="Username" sortable style={{ width: '40%' }} />
                        <Column field="email" header="Email" sortable style={{ width: '40%' }} />
                        <Column field="role" header="Role" body={roleBodyTemplate} style={{ width: '20%' }} />
                    </DataTable>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;