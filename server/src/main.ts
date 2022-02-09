import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
    const logger = new Logger('bootstrap');
    const port = process.env.PORT;

    const app = await NestFactory.create(AppModule);
    app.enableCors({
        origin: `${process.env.BASE_URL}:${port}`,
        credentials: true,
    });
    app.setGlobalPrefix('api');
    app.use(cookieParser());

    const config = new DocumentBuilder()
        .addBearerAuth()
        .setTitle('Near Hackathon')
        .setDescription('EAC API')
        .setVersion('1.0')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('swagger', app, document);

    await app.listen(port);

    logger.log(`Application listening on port ${port}`);
}
bootstrap();
