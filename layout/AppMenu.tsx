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
            ]
        },
        {
            label: 'User Management',
            items: [{ label: 'User List', icon: 'pi pi-fw pi-list', to: '/pages/user_list' }]
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
