import React, { useContext } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import Link from 'next/link';
import { AppMenuItem } from '@/types';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const AppMenu = () => {
    const router = useRouter();
    const { layoutConfig } = useContext(LayoutContext);

    const handleLogout = async () => {
        
        try {
          // Panggil endpoint logout di server
      
          // Hapus token dari cookie
          Cookies.remove('access_token');
      
          // Arahkan pengguna ke halaman login
          router.push('/auth/login');
        } catch (error) {
          console.error('Error during logout:', error);
          alert('An error occurred during logout. Please try again later.');
        }
      };

    const model: AppMenuItem[] = [
        {
            label: 'Home',
            items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/pages/dashboard' }]
        },
        {
            label: 'Recipe',
            items: [{ label: 'Recipe List', icon: 'pi pi-fw pi-list', to: '/pages/recipe_list' }]
        },
        {
            label: 'User Management',
            items: [{ label: 'User List', icon: 'pi pi-fw pi-list', to: '/pages/user_list' }]
        },
        {
            label: 'Logout',
            icon: 'pi pi-fw pi-briefcase',
            to: '/pages',
            items: [
                {
                    label: 'Logout',
                    icon: 'pi pi-fw pi-sign-in',
                    command: handleLogout
                }
            ]
        }
    ];

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) => {
                    return !item?.seperator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
                })}

                {/* <Link href="https://blocks.primereact.org" target="_blank" style={{ cursor: 'pointer' }}>
                    <img alt="Prime Blocks" className="w-full mt-3" src={`/layout/images/banner-primeblocks${layoutConfig.colorScheme === 'light' ? '' : '-dark'}.png`} />
            </Link> ini ilangin*/}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;