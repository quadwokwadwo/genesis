import { Metadata } from 'next';
import Layout from '../../layout/layout';

interface MainLayoutProps {
    children: React.ReactNode;
}

export const metadata: Metadata = {
    title: 'Genesis',
    description: 'A fertility hospital app that helps patients track treatments, book appointments, and stay connected with their care team throughout their journey.',
    robots: { index: false, follow: false },
    viewport: { initialScale: 1, width: 'device-width' },
    icons: {
        icon: '/favicon.ico'
    }
};

export default function MainLayout({ children }: MainLayoutProps) {
    return <Layout>{children}</Layout>;
}
