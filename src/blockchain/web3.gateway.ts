import { Logger } from '@nestjs/common';
import { BlockChain } from 'src/common/constants';
import { Utils } from 'src/common/utils';
import { Web3ETH } from './web3.eth';

export interface IWeb3API {
  sign(data: any[]): string;

  recover(data: any[], signature: string): string;
}

export class Web3Gateway {
  private readonly logger = new Logger(Web3Gateway.name);

  private instance: IWeb3API;
  private instances = new Map<number, IWeb3API>();

  constructor(chainId: number) {
    if (!this.instances.has(chainId)) {
      if (BlockChain.Network.BSC.includes(chainId)) {
        this.instances.set(chainId, new Web3ETH());
      } else if (BlockChain.Network.ETH.includes(chainId)) {
        this.instances.set(chainId, new Web3ETH());
      } else {
        throw new Error('Not support this chain');
      }
    }

    this.instance = this.instances.get(chainId);
  }

  public async sign(data: any[]) {
    let retry = 1;
    while (true) {
      try {
        return this.instance.sign(data);
      } catch (error) {
        this.logger.warn(`sign(): Retrying ${retry} time. ${error.message}`);
        retry++;
        if (retry > 3) {
          throw error;
        }
        await Utils.wait(300);
      }
    }
  }

  public async recover(data: any[], signature: string) {
    let retry = 1;
    while (true) {
      try {
        return this.instance.recover(data, signature);
      } catch (error) {
        this.logger.warn(`recover(): Retrying ${retry} time. ${error.message}`);
        retry++;
        if (retry > 3) {
          throw error;
        }
        await Utils.wait(300);
      }
    }
  }
}
