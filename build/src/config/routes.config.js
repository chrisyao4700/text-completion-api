"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tsoa_1 = require("tsoa");
const routes_1 = require("../../build/routes");
class RoutesConfig {
    static init(app) {
        (0, routes_1.RegisterRoutes)(app);
        /**
         * Handle missing routes
         */
        app.use(function notFoundHandler(_req, res) {
            res.status(404).send({
                message: 'Not Found',
            });
        });
        /**
         * Global request parameters validation config to
         * intercept request before hitting the controller
         */
        app.use(function errorHandler(err, req, res, next) {
            if (err instanceof tsoa_1.ValidateError) {
                console.warn(`Caught Validation Error for ${req.path}:`, err.fields);
                return res.status(422).json({
                    message: 'Validation Failed',
                    details: err === null || err === void 0 ? void 0 : err.fields,
                });
            }
            if (err instanceof Error) {
                return res.status(500).json({
                    message: 'Internal Server Error',
                });
            }
            next();
        });
    }
}
exports.default = RoutesConfig;
