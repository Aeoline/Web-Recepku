import { Metadata } from 'next';
import AppConfig from '../../layout/AppConfig';
import React from 'react';

interface SimpleLayoutProps {
    children: React.ReactNode;
}

export const metadata: Metadata = {
    title: 'Recepku Admin Panel',
    description: 'The ultimate collection of design-agnostic, flexible and accessible React UI Components.'
};

// New viewport export
export const viewport = 'width=device-width, initial-scale=1';

export default function SimpleLayout({ children }: SimpleLayoutProps) {
    return (
        <React.Fragment>
            {children}
            <AppConfig simple />
        </React.Fragment>
    );
}
