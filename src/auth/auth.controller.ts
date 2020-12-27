import { Controller, Get, Post, Body, Put, ValidationPipe, Param, UseGuards, Delete } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthCredentialsDto, AuthEmailDto, CreateUserDto, UpdateUserDto } from './dto/auth-credentials.dto';
import { JwtAuthGuard } from '../core/guard/jwt-auth.guard';
import { Role } from '../core/enums/role.enum';
import { Roles } from '../core/decorators/role.decorator';
import { RolesGuard } from '../core/guard/roles.guard';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private authService: AuthService) { }

  @ApiOperation({ summary: 'Create User' })
  @Post('/create')
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.authService.createUser(createUserDto);
  }

  @ApiOperation({ summary: 'Verify Token by Email' })
  @Get('/verify/:token')
  async verifyTokenByEmail(@Param('token') token: string) {
    return await this.authService.verifyTokenByEmail(token);
  }

  @ApiOperation({ summary: 'LogIn User' })
  @Post('/login')
  async login(@Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto) {
    return await this.authService.validateUserByPassword(authCredentialsDto);
  }

  @ApiOperation({ summary: 'Update User' })
  @Put('/update')
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(@Body() updateUserDto: UpdateUserDto) {
    return await this.authService.updateUser(updateUserDto);
  }

  @ApiOperation({ summary: 'Get User Login' })
  @Get('/user')
  @Roles(Role.Admin, Role.User)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getUser() {
    return await this.authService.getUserFromAuth();
  }

  @ApiOperation({ summary: 'Get All Users' })
  @Get('/users')
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllUsers() {
    return await this.authService.getAllUsers();
  }

  @ApiOperation({ summary: 'Delete User' })
  @ApiBearerAuth()
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('/delete')
  async delete(@Body(ValidationPipe) auth: AuthEmailDto) {
    return await this.authService.deleteUser(auth);
  }
}
