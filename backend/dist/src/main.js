"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const validation_pipe_1 = require("./common/pipes/validation.pipe");
const response_interceptor_1 = require("./common/interceptors/response.interceptor");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const logger_service_1 = require("./logger/logger.service");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const path_1 = require("path");
const swagger_custom_1 = require("./config/swagger/swagger.custom");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.set('etag', false);
    const logger = app.get(logger_service_1.LoggerService);
    const configService = app.get(config_1.ConfigService);
    app.enableCors({
        origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:8080', 'http://localhost:8081', 'http://127.0.0.1:8080', 'http://localhost:5173', 'http://localhost:8888'],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'X-Requested-With'],
        credentials: true,
        preflightContinue: false,
        optionsSuccessStatus: 200,
    });
    app.setGlobalPrefix('api', {
        exclude: ['/', '/uploads/(.*)', '/public/(.*)'],
    });
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'public'), {
        prefix: '/public/',
    });
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'uploads'), {
        prefix: '/uploads/',
    });
    app.useGlobalPipes(new validation_pipe_1.ValidationPipe());
    app.useGlobalInterceptors(new response_interceptor_1.ResponseInterceptor());
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter(logger, configService));
    const allowedEnvs = ['development', 'staging', 'local'];
    const currentEnv = process.env.NODE_ENV || 'development';
    if (allowedEnvs.includes(currentEnv)) {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('Nest React API')
            .setDescription(`
      <h3>🔐 Auto-Token Feature</h3>
      <p>Setelah login berhasil, token akan <strong>otomatis disimpan</strong> ke authorization.</p>
      <p>Anda bisa langsung mengakses endpoint yang memerlukan autentikasi tanpa perlu copy-paste token.</p>
      <hr/>
    `)
            .setVersion('1.0')
            .addBearerAuth({
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'JWT',
            description: 'Enter JWT token',
            in: 'header',
        }, 'JWT-auth')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api/docs', app, document, {
            swaggerOptions: {
                persistAuthorization: true,
                docExpansion: 'none',
                tagsSorter: 'alpha',
                filter: false,
                displayRequestDuration: true,
            },
            customCss: swagger_custom_1.swaggerCustomCss,
            customJsStr: swagger_custom_1.swaggerCustomJs,
            customSiteTitle: 'Nest React API Docs',
        });
    }
    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0');
    logger.log(`Application is running on: http://localhost:${port}`);
    logger.log(`Swagger docs available at: http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map