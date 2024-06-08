/* eslint-disable @next/next/no-img-element */

import React, { useContext } from 'react';
import { LayoutContext } from './context/layoutcontext';

const AppFooter = () => {
    const { layoutConfig } = useContext(LayoutContext);

    return (
        <div className="layout-footer">
            <img src={`/layout/images/logo-recepku.png`} alt="Logo" height="30" className="mr-2" />
            
            <span className="font-medium ml-2">Recepku</span>
        </div>
    );
};

export default AppFooter;
