import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { Model } from 'mongoose';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor() {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async syncCurrencyRate() {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd`,
    );
    if (response.status === 200) {
      this.logger.debug(response.data);

      // Save to DB
    } else {
      this.logger.error(
        `syncCurrencyRate(): Can not get price. Error = ${response.statusText}`,
      );
    }
  }
}
