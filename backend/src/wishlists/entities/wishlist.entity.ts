import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToMany,
    ManyToOne,
    JoinTable,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { Wish } from "../../wishes/entities/wish.entity";
import { User } from "../../users/entities/user.entity";

@Entity()
export class Wishlist {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ length: 250 })
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column()
    image: string;

    @ManyToMany(() => Wish, (wish) => wish.wishlists)
    @JoinTable()
    items: Wish[];

    @ManyToOne(() => User, (user) => user.wishlists)
    owner: User;
}
