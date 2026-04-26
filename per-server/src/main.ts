import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const PORT = process.env.PORT || 3000;
  const app = await NestFactory.create(
    AppModule,
    //TODO for dev only
    { cors: Boolean(PORT === '4400') },
  );

  const config = new DocumentBuilder()
    .setTitle('Performers')
    .setDescription('Performers REST API')
    .setVersion('0.0.1')
    .addTag('PER-CAM')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/admin/endpoints', app, document);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  await app.listen(PORT, () => console.log(`RUN ON  ${PORT} PORT`));
}
bootstrap();
