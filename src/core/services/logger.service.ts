import { LoggerService } from '@nestjs/common';
import * as winston from 'winston';

export class AppLogger implements LoggerService {
  private logger: winston.Logger;
  constructor(label?: string) {
    this.initializeLogger(label);
  }
  initializeLogger(label?: string) {
    this.logger = winston.createLogger({
       level: 'info',
      transports: [
        new winston.transports.File({
          filename: './logs/warn.log', level: 'warn', format: winston.format.combine(
            winston.format.timestamp(),
          ),
        }),
        new winston.transports.File({
          filename: './logs/error.log', level: 'error', format: winston.format.combine(
            winston.format.timestamp(),
          ),
        }),
        new winston.transports.File({
           filename: './logs/info.log', level: 'info', format: winston.format.combine(
            winston.format.timestamp(),
          ),
        })
      ]
    })
  
  }
  error(message: string, trace: string) {
    this.logger.error("error", `${new Date().toLocaleString()}` + message, trace);
  }

  warn(message: string) {
    this.logger.warn('warn', `${new Date().toLocaleString()}` + message);
  }

  log(message: string) {
     this.logger.log('info',`${new Date().toLocaleString()}` +  message);
  }
 
}