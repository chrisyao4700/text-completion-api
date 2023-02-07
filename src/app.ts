import express from 'express';

import ApplicationConfig from './config/app.conf';
import SwaggerConfig from './config/swagger.conf';
import RoutesConfig from './config/routes.config';
import StatusConfig from './config/status.config';
// import AmqpSubscriberConfig from './config/amqpSubscriber.config';
import DatabaseConfig from './config/database.config';
import AuthenticationConfig from './config/auth.conf';

export const app = express();
StatusConfig.init(app);
ApplicationConfig.init(app);
SwaggerConfig.init(app);
AuthenticationConfig.init(app);
RoutesConfig.init(app);
DatabaseConfig.config();
