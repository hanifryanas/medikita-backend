import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { compareSync } from 'bcryptjs';
import { FindOptionsRelations, Repository } from 'typeorm';
import { SigninDataDto } from '../../auth/dtos/signin-data.dto';
import { SigninDto } from '../../auth/dtos/signin.dto';
import { CreateUserDto } from '../dtos/create-user-dto';
import { UpdateUserDto } from '../dtos/update-user-dto';
import { User } from '../entities/user.entity';
import { UserRole } from '../enums/user-role.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findBy(partialUser: Partial<User>): Promise<User[]> {
    return await this.userRepository.findBy(partialUser);
  }

  async findOneBy(
    partialUser: Partial<User>,
    selection?: (keyof User)[],
    relations?: FindOptionsRelations<User>,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: partialUser,
      select: selection,
      relations,
    });

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    return user;
  }

  async findOneByIdentifier(
    identifier: string,
    selection?: (keyof User)[],
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: [
        { email: identifier },
        { userName: identifier },
        { phoneNumber: identifier },
      ],
      select: selection,
    });

    if (!user) {
      throw new NotFoundException(
        `User with email, username, or phone number '${identifier}' not found`,
      );
    }

    return user;
  }

  async validateUserCredential(signinDto: SigninDto): Promise<SigninDataDto> {
    const user = await this.findOneByIdentifier(signinDto.identifier, [
      'userId',
      'userName',
      'password',
      'role',
    ]);

    const isPasswordValid = compareSync(signinDto.password, user?.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        `Invalid password for user '${signinDto.identifier}'`,
      );
    }

    const signinData: SigninDataDto = {
      userId: user.userId,
      username: user.userName,
      role: user.role,
    };

    return signinData;
  }

  async create(createUserDto: CreateUserDto): Promise<string> {
    const user = this.userRepository.create(createUserDto);

    const createdUser = await this.userRepository.save(user);

    if (!createdUser) {
      throw new BadRequestException('User creation failed');
    }

    return createdUser.userId;
  }

  async update(userId: string, updateUserDto: UpdateUserDto): Promise<void> {
    const result = await this.userRepository.update(userId, updateUserDto);

    if (!result.affected) {
      throw new BadRequestException(`Failed to update user with ID ${userId}`);
    }
  }

  async updateUserRole(userId: string, role: UserRole): Promise<void> {
    const result = await this.userRepository.update(userId, { role });

    if (!result.affected) {
      throw new BadRequestException(
        `Failed to update user role for ID ${userId}`,
      );
    }
  }

  async delete(userId: string): Promise<void> {
    const result = await this.userRepository.delete(userId);

    if (!result.affected) {
      throw new BadRequestException(`Failed to delete user with ID ${userId}`);
    }
  }
}
