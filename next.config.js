/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async redirects() {
        return [
            {
                source: '/apps/mail',
                destination: '/apps/mail/inbox',
                permanent: true
            }
        ];
    },
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '5000',
                pathname: '/**',
            },
        ],
    },
};

module.exports = nextConfig;
