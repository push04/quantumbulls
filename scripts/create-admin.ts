
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

console.log('Env path:', path.resolve(process.cwd(), '.env.local'));
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Service Key starts with:', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 5));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createAdminUser() {
    const email = 'admin@quantumbull.com';
    const password = 'quantumbulls';

    console.log(`Creating/Updating admin user: ${email}`);

    // 1. Check if user exists
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('Error listing users:', listError);
        return;
    }

    const existingUser = users.find(u => u.email === email);
    let userId = existingUser?.id;

    if (existingUser) {
        console.log('User already exists. Updating password...');
        const { error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            { password: password, email_confirm: true }
        );
        if (updateError) {
            console.error('Error updating user:', updateError);
            return;
        }
        console.log('Password updated.');
    } else {
        console.log('Creating new user...');
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: 'Quantum Admin' }
        });

        if (createError) {
            console.error('Error creating user:', createError);
            return;
        }
        userId = newUser.user.id;
        console.log('User created.');
    }

    // 2. Ensure Profile exists and has role 'admin'
    console.log('Ensuring admin role in profiles table...');

    // We can't use the admin client to write to public tables directly if RLS blocks it, 
    // but service_role key bypasses RLS.
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: userId,
            role: 'admin',
            full_name: 'Quantum Admin',
            email: email,
            subscription_tier: 'mentor' // give them full access
        }, { onConflict: 'id' });

    if (profileError) {
        console.error('Error updating profile:', profileError);
    } else {
        console.log('Profile updated with admin role.');
    }

    console.log('Done! Login with:', email, password);
}

createAdminUser();
