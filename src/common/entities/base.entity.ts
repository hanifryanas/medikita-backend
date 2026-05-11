import { Exclude, Expose } from 'class-transformer';
import { CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class BaseEntity {
  @Exclude({ toPlainOnly: true })
  @Expose({ groups: ['audit'], toPlainOnly: true })
  @CreateDateColumn()
  createdAt: Date;

  @Exclude({ toPlainOnly: true })
  @Expose({ groups: ['audit'], toPlainOnly: true })
  @UpdateDateColumn()
  updatedAt: Date;

  @Exclude({ toPlainOnly: true })
  @Expose({ groups: ['audit'], toPlainOnly: true })
  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}
