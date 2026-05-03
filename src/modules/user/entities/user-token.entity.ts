import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UserTokenType } from '../enums/user-token.enum';
import { User } from './user.entity';

@Entity('UserToken')
export class UserToken extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  userTokenId: string;

  @Column()
  token: string;

  @Column({ type: 'enum', enum: UserTokenType })
  type: UserTokenType;

  @ManyToOne(() => User, (user) => user.tokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'timestamp' })
  expiredAt: Date;
}
