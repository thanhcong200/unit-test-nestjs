import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Web3Gateway } from 'src/blockchain/web3.gateway';
// import Web3 from 'web3';
const Web3 = require('web3');
import { LoginDto } from './dto/login.dto';
import { Role } from './role.enum';

@Injectable()
/**
 * AuthService
 */
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private jwtService: JwtService) {}

  /**
   * Login
   * @param {LoginDto} requestData
   * @return {any} user information
   */
  async login(requestData: LoginDto) {
    let address = '';
    try {
      const web3Gateway = new Web3Gateway(Number(process.env.CHAIN_ID));
      address = await web3Gateway.recover(
        [requestData.address],
        requestData.signature,
      );
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
    if (requestData.address.toLowerCase() !== address.toLowerCase()) {
      this.logger.log(`Signature invalid. recover address = ${address}`);
      throw new UnauthorizedException();
    }
    // TODO
    const role = Role.Admin;
    const payload = { address: requestData.address };
    return {
      address: requestData.address,
      token: this.jwtService.sign(payload),
      role,
    };
  }
}
