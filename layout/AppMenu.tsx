/* eslint-disable @next/next/no-img-element */

import React, { useContext } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import Link from 'next/link';
import { AppMenuItem } from '@/types';

const AppMenu = () => {
    const { layoutConfig } = useContext(LayoutContext);

    const model: AppMenuItem[] = [
        {
            label: 'Home',
            items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }]
        },
        {
            label: 'Recipe',
            items: [
                { label: 'Recipe List', icon: 'pi pi-fw pi-list', to: '/pages/recipe_list' },
                { label: 'Input', icon: 'pi pi-fw pi-check-square', to: '/uikit/input' },
                { label: 'Panel', icon: 'pi pi-fw pi-check-square', to: '/uikit/panel' },
            ]
        },
        {
            label: 'User Management',
            items: [{ label: 'User List', icon: 'pi pi-fw pi-list', to: '/pages/user_list' }]
        },
        // {
        //     label: 'Tool',
        //     items: [{ label: 'Form Layout', icon: 'pi pi-fw pi-id-card', to: '/uikit/formlayout' },
        //     { label: 'Input', icon: 'pi pi-fw pi-check-square', to: '/uikit/input' },
        //     { label: 'Float Label', icon: 'pi pi-fw pi-bookmark', to: '/uikit/floatlabel' },
        //     { label: 'Invalid State', icon: 'pi pi-fw pi-exclamation-circle', to: '/uikit/invalidstate' },
        //     { label: 'Button', icon: 'pi pi-fw pi-mobile', to: '/uikit/button', class: 'rotated-icon' },
        //     { label: 'Table', icon: 'pi pi-fw pi-table', to: '/uikit/table' },
        //     { label: 'List', icon: 'pi pi-fw pi-list', to: '/uikit/list' },
        //     { label: 'Tree', icon: 'pi pi-fw pi-share-alt', to: '/uikit/tree' },
        //     { label: 'Panel', icon: 'pi pi-fw pi-tablet', to: '/uikit/panel' },
        //     { label: 'Overlay', icon: 'pi pi-fw pi-clone', to: '/uikit/overlay' },
        //     { label: 'Media', icon: 'pi pi-fw pi-image', to: '/uikit/media' },
        //     { label: 'Menu', icon: 'pi pi-fw pi-bars', to: '/uikit/menu', preventExact: true },
        //     { label: 'Message', icon: 'pi pi-fw pi-comment', to: '/uikit/message' },
        //     { label: 'File', icon: 'pi pi-fw pi-file', to: '/uikit/file' },
        //     { label: 'Chart', icon: 'pi pi-fw pi-chart-bar', to: '/uikit/charts' },
        //     { label: 'Misc', icon: 'pi pi-fw pi-circle', to: '/uikit/misc' }
        // ]
        // },
        // {
        //     label: 'Pages',
        //     icon: 'pi pi-fw pi-briefcase',
        //     to: '/pages',
        //     items: [
        //         {
        //             label: 'Landing',
        //             icon: 'pi pi-fw pi-globe',
        //             to: '/landing'
        //         },
        //         {
        //             label: 'Auth',
        //             icon: 'pi pi-fw pi-user',
        //             items: [
        //                 {
        //                     label: 'Login',
        //                     icon: 'pi pi-fw pi-sign-in',
        //                     to: '/auth/login'
        //                 },
        //                 {
        //                     label: 'Error',
        //                     icon: 'pi pi-fw pi-times-circle',
        //                     to: '/auth/error'
        //                 },
        //                 {
        //                     label: 'Access Denied',
        //                     icon: 'pi pi-fw pi-lock',
        //                     to: '/auth/access'
        //                 }
        //             ]
        //         },
        //         {
        //             label: 'Crud',
        //             icon: 'pi pi-fw pi-pencil',
        //             to: '/pages/crud'
        //         },
        //         {
        //             label: 'Timeline',
        //             icon: 'pi pi-fw pi-calendar',
        //             to: '/pages/timeline'
        //         },
        //         {
        //             label: 'Not Found',
        //             icon: 'pi pi-fw pi-exclamation-circle',
        //             to: '/pages/notfound'
        //         },
        //         {
        //             label: 'Empty',
        //             icon: 'pi pi-fw pi-circle-off',
        //             to: '/pages/empty'
        //         }
        //     ]
        // },
        {
            label: 'Logout',
            icon: 'pi pi-fw pi-briefcase',
            to: '/pages',
            items: [
                {
                    label: 'Logout',
                    icon: 'pi pi-fw pi-sign-in',
                    to: '/auth/login'
                },
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
