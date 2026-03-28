import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// POST: Validate student credentials against student_registry
export async function POST(request: Request) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                },
            },
        }
    );

    try {
        const { email, application_number } = await request.json();

        if (!email || !application_number) {
            return NextResponse.json(
                { error: 'Email and application number are required' },
                { status: 400 }
            );
        }

        const admin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data: student, error: lookupError } = await admin
            .from('student_registry')
            .select('*')
            .eq('email', email.trim().toLowerCase())
            .eq('application_number', application_number.trim())
            .single();

        if (lookupError || !student) {
            return NextResponse.json(
                { error: 'Invalid credentials. Your email or application number is not registered.' },
                { status: 401 }
            );
        }

        // 2. Auth the user
        const password = application_number.trim();
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
        });

        if (signInError) {
            // Auto-create user if not in Auth but in Registry
            if (signInError.message.includes('Invalid login credentials')) {
                const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                    email: email.trim().toLowerCase(),
                    password,
                });

                if (signUpError) throw signUpError;
                if (!signUpData.session) {
                    return NextResponse.json({ error: 'Administrative registration failed.' }, { status: 500 });
                }
            } else {
                throw signInError;
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Student login error:', error);
        return NextResponse.json({ error: error.message || 'Login failed' }, { status: 500 });
    }
}
