import { IsEthereumAddress } from 'class-validator';

export class LoginDto {
  signature: string;

  @IsEthereumAddress()
  address: string;
}
