const auth = require('http-auth');
export const systemAdminBasicAuth = auth.basic(
    { realm: 'System Admin' },
    function (username: string, pass: string, callback: Function) {
        callback(
            username === process.env.ADMIN_USERNAME &&
                pass === process.env.ADMIN_PASSWORD
        );
    }
);
