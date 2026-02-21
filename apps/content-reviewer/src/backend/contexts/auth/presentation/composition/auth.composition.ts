import { GetCurrentUserUseCase } from '@/backend/contexts/auth/application/usecases/get-current-user.usecase';
import { SignInUseCase } from '@/backend/contexts/auth/application/usecases/sign-in.usecase';
import { SignOutUseCase } from '@/backend/contexts/auth/application/usecases/sign-out.usecase';
import { SyncUserUseCase } from '@/backend/contexts/auth/application/usecases/sync-user.usecase';
import { PrismaUserRepository } from '@/backend/contexts/auth/infrastructure/repositories/prisma-user.repository';
import { SupabaseAuthGateway } from '@/backend/contexts/auth/infrastructure/supabase-auth.gateway';
import { prisma } from '@/backend/contexts/shared/infrastructure/db/prisma-client';
import { createSupabaseServerClient } from '@/backend/contexts/shared/infrastructure/db/supabase-server-client';

export async function createGetCurrentUserUseCase(): Promise<GetCurrentUserUseCase> {
	const supabase = await createSupabaseServerClient();
	const authGateway = new SupabaseAuthGateway(supabase);
	return new GetCurrentUserUseCase(authGateway);
}

export async function createSignInUseCase(): Promise<SignInUseCase> {
	const supabase = await createSupabaseServerClient();
	const authGateway = new SupabaseAuthGateway(supabase);
	return new SignInUseCase(authGateway);
}

export async function createSignOutUseCase(): Promise<SignOutUseCase> {
	const supabase = await createSupabaseServerClient();
	const authGateway = new SupabaseAuthGateway(supabase);
	return new SignOutUseCase(authGateway);
}

export async function createSyncUserUseCase(): Promise<SyncUserUseCase> {
	const supabase = await createSupabaseServerClient();
	const authGateway = new SupabaseAuthGateway(supabase);
	const userRepository = new PrismaUserRepository(prisma);
	return new SyncUserUseCase(authGateway, userRepository);
}
