import type { UserRepository } from '@/backend/contexts/auth/domain/gateways/user.repository';
import { User } from '@/backend/contexts/auth/domain/models/user.model';
import type { Email } from '@/backend/contexts/shared/domain/models/email.model';
import type { UserId } from '@/backend/contexts/shared/domain/models/user-id.model';
import type { PrismaClient, User as PrismaUser } from '@prisma/client';

export class PrismaUserRepository implements UserRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async findById(id: UserId): Promise<User | null> {
		const record = await this.prisma.user.findUnique({
			where: { id: id as string },
		});

		if (!record) {
			return null;
		}

		return this.toDomain(record);
	}

	async findByEmail(email: Email): Promise<User | null> {
		const record = await this.prisma.user.findUnique({
			where: { email: email.value },
		});

		if (!record) {
			return null;
		}

		return this.toDomain(record);
	}

	async upsert(user: User): Promise<void> {
		const data = {
			email: user.email.value,
			name: user.name,
			avatarUrl: user.avatarUrl,
		};

		await this.prisma.user.upsert({
			where: { id: user.id as string },
			create: {
				id: user.id as string,
				...data,
			},
			update: data,
		});
	}

	private toDomain(record: PrismaUser): User {
		const result = User.create({
			id: record.id,
			email: record.email,
			name: record.name,
			avatarUrl: record.avatarUrl,
			createdAt: record.createdAt,
			updatedAt: record.updatedAt,
		});

		if (!result.success) {
			throw new Error(`Failed to convert Prisma user to domain model: ${result.error}`);
		}

		return result.value;
	}
}
