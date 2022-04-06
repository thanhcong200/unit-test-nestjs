import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';

export type UserDocument = User & Document;

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BANNED = 'BANNED',
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  USER = 'USER',
}

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ unique: true })
  address: string;

  @Prop({ default: UserRole.USER })
  role: UserRole;

  @Prop({ default: UserStatus.ACTIVE })
  status: UserStatus;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.plugin(paginate);
