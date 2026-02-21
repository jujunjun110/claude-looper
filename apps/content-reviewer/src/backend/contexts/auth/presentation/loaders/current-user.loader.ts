import { User } from '@/backend/contexts/auth/domain/models/user.model';
import { createSupabaseServerClient } from '@/backend/contexts/shared/infrastructure/db/supabase-server-client';

export async function loadCurrentUser(): Promise<User | null> {
	const supabase = await createSupabaseServerClient();

	const {
		data: { user: supabaseUser },
	} = await supabase.auth.getUser();

	if (!supabaseUser) {
		return null;
	}

	const result = User.fromSupabaseUser({
		id: supabaseUser.id,
		email: supabaseUser.email,
		user_metadata: supabaseUser.user_metadata,
		created_at: supabaseUser.created_at,
		updated_at: supabaseUser.updated_at ?? supabaseUser.created_at,
	});

	if (!result.success) {
		return null;
	}

	return result.value;
}
