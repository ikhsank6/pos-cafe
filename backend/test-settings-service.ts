import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { SettingsService } from './src/modules/settings/settings.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const settingsService = app.get(SettingsService);
  
  try {
    console.log('Fetching tax settings...');
    const settings = await settingsService.getTaxSettings();
    console.log('Settings:', settings);
  } catch (error) {
    console.error('FAILED to fetch tax settings:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
