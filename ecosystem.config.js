module.exports = {
    apps: [
        {
            name: 'next-app',
            cwd: './',
            script: 'node_modules/next/dist/bin/next',
            args: 'start',
            env: {
                NODE_ENV: 'production',
                PORT: 3000
            }
        },
        {
            name: 'express-app',
            script: 'index.js',
            env: {
                NODE_ENV: 'production',
                PORT: 5000
            }
        }
    ]
};
