import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import axios from 'axios';

async function subscribeToCtxChanges() {
    try {
        const response = await axios.get(
            `${process.env.BROKER_HOST}:${process.env.BROKER_PORT}/v2/subscriptions`,
        );
        console.log(response.status);
        const subs = response.data;
        if (Array.isArray(subs) && subs.length === 0) {
            const response = await axios.post(
                `${process.env.BROKER_HOST}:${process.env.BROKER_PORT}/v2/subscriptions`,
                {
                    description: 'Notify backend of all context changes',
                    subject: {
                        entities: [
                            {
                                idPattern: '.*',
                                type: 'Station',
                            },
                        ],
                    },
                    notification: {
                        http: {
                            url: `${process.env.SUBSC_URL}:${process.env.PORT}/api/measurements`,
                        },
                        attrsFormat: 'keyValues',
                    },
                    throttling: 1,
                },
            );
            console.log(response);
        }
    } catch (e) {
        console.log(e);
    }
}

async function bootstrap() {
    const logger = new Logger('bootstrap');
    const port = process.env.PORT;
    const app = await NestFactory.create(AppModule);
    app.enableCors({
        origin: process.env.BASE_URL,
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
    
    await subscribeToCtxChanges();
    await app.listen(port);
    logger.log(`Application listening on port ${port}`);
}

bootstrap();
