import { Logger } from '@nestjs/common';
import { Utils } from 'src/common/utils';
import Web3Type from 'web3';
import { IWeb3API } from './web3.gateway';
const Web3 = require('web3');
export class Web3ETH implements IWeb3API {
  private readonly logger = new Logger(Web3ETH.name);

  private web3Instance: Web3Type;

  constructor() {
    if (!this.web3Instance) {
      this.web3Instance = new Web3();
    }
    this.setProvider();
    return this;
  }

  private setProvider() {
    const rpcUrl = Utils.getRandom(process.env.CHAIN_RPC_URL.split(','));
    this.web3Instance.setProvider(rpcUrl);
  }

  private convertDataSign(data: any[]) {
    const dataSign: any = [];
    for (let index = 0; index < data.length; index++) {
      const value = data[index];
      if (typeof value === 'number') {
        dataSign.push({
          type: 'uint256',
          value: value,
        });
      } else if (
        typeof value === 'string' &&
        this.web3Instance.utils.isAddress(value)
      ) {
        dataSign.push({
          type: 'address',
          value: value,
        });
      } else {
        dataSign.push({
          type: 'string',
          value: value,
        });
      }
    }
    this.logger.debug('convertDataSign(): dataSign', JSON.stringify(dataSign));
    return dataSign;
  }

  public sign(data: any[]) {
    try {
      const dataSign = this.convertDataSign(data);
      const hash = this.web3Instance.utils.soliditySha3(...dataSign);
      const sign = this.web3Instance.eth.accounts.sign(
        hash,
        process.env.WALLET_PRIVATE_KEY,
      );
      this.logger.debug('sign(): sign', sign);
      return sign.signature;
    } catch (error) {
      this.setProvider();
      throw error;
    }
  }

  public recover(data: any[], signature: string) {
    try {
      const dataSign = this.convertDataSign(data);
      const hash = this.web3Instance.utils.soliditySha3(...dataSign);
      return this.web3Instance.eth.accounts.recover(hash, signature);
    } catch (error) {
      this.setProvider();
      throw error;
    }
  }
}
