import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/schemas/User.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { SearchUserDto } from './dto/search-user.dto';
import { Utils } from 'src/common/utils';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  findAll(requestData: SearchUserDto) {
    const match = {};
    if (requestData.keyword) {
      match['$or'] = [
        { address: { $regex: requestData.keyword, $options: 'i' } },
      ];
    }
    return Utils.paginate(this.userModel, match, requestData);
  }

  findByAddress(address: string) {
    return this.userModel.findOne({ address });
  }
}
