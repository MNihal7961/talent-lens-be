import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

const logger = new Logger('MongooseModule');

export const databaseConfig = (
  configService: ConfigService,
): MongooseModuleOptions => ({
  uri: configService.getOrThrow<string>('DB_URL'),
  connectionFactory: (connection: Connection) => {
    if (connection.readyState === 1) {
      logger.log('MongoDB connected');
    } else {
      connection.on('connected', () => {
        logger.log('MongoDB connected');
      });
    }
    return connection;
  },
});
