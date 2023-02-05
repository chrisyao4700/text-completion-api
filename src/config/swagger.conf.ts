import express, { Response as ExResponse, Request as ExRequest } from 'express';
import swaggerUi from 'swagger-ui-express';

import { systemAdminBasicAuth } from '../auth/systemAdminBasicAuth';
export default class SwaggerConfig {
    static init(app: express.Application) {
        app.use(
            '/docs',
            swaggerUi.serve,
            systemAdminBasicAuth.check(
                async (_req: ExRequest, res: ExResponse) => {
                    return res.send(
                        swaggerUi.generateHTML(
                            await import('../../build/swagger.json')
                        )
                    );
                }
            )
        );
    }
}
