import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UploadedFiles,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SearchDto } from 'src/common/search.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Role } from 'src/auth/role.enum';
import { Roles } from 'src/auth/roles.decorator';
import { AwsUtils } from 'src/common/aws.util';
import { FileInterceptor } from '@nestjs/platform-express';
import { IpfsUtils } from 'src/common/ipfs.utils';
import { ApiTags } from '@nestjs/swagger';
import { SearchUserDto } from './dto/search-user.dto';

@ApiTags('admin/users')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
export class UsersAdminController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(@Query() requestData: SearchUserDto) {
    return this.usersService.findAll(requestData);
  }
}
