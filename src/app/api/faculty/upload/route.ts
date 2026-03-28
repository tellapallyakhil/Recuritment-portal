import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
// Helper: Verify faculty authorization
async function verifyFaculty() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const email = user.email?.toLowerCase() || '';

    const envEmails = (process.env.FACULTY_EMAILS || '')
        .split(',')
        .map(e => e.trim().toLowerCase())
        .filter(e => e);

    if (envEmails.includes(email)) return user;

    // Also check faculty_registry DB
    const admin = getAdminClient();
    const { data: faculty } = await admin
        .from('faculty_registry')
        .select('id')
        .eq('email', email)
        .single();

    if (faculty) return user;

    return null;
}

// Admin Supabase client (bypasses RLS)
function getAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
}

// Upload PDF bypassing compression to preserve digital signatures
async function processPdfBuffer(inputBuffer: Buffer): Promise<{ finalBuffer: Buffer; size: number }> {
    return { finalBuffer: inputBuffer, size: inputBuffer.byteLength };
}

// POST: Upload one or more PDF files with compression
export async function POST(request: Request) {
    const user = await verifyFaculty();
    if (!user) {
        console.error('Faculty upload rejected: user not in FACULTY_EMAILS list');
        return NextResponse.json(
            { error: 'Unauthorized. Your email is not in the authorized faculty list. Contact admin to add your email to FACULTY_EMAILS.' },
            { status: 403 }
        );
    }

    try {
        const formData = await request.formData();
        const files = formData.getAll('files') as File[];
        const singleFile = formData.get('file') as File | null;
        const registerNumber = formData.get('registerNumber') as string | null;

        const admin = getAdminClient();

        // Support legacy single-file upload with registerNumber
        if (singleFile && registerNumber) {
            if (singleFile.type !== 'application/pdf') {
                return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
            }

            // Use the register number as the filename directly
            const fileName = `${registerNumber.trim()}.pdf`;
            const arrayBuffer = await singleFile.arrayBuffer();
            const originalBuffer = Buffer.from(arrayBuffer);

            // Preserve exact binary array to maintain signatures
            const { finalBuffer, size } = await processPdfBuffer(originalBuffer);

            const { error } = await admin.storage
                .from('recruitment-pdfs')
                .upload(fileName, finalBuffer, {
                    contentType: 'application/pdf',
                    cacheControl: '3600',
                    upsert: true,
                });

            if (error) {
                console.error('Supabase storage upload error:', error);
                throw error;
            }

            return NextResponse.json({
                success: true,
                uploaded: [fileName],
                failed: [],
                compression: {
                    originalSize: size,
                    compressedSize: size,
                    savings: `0.0%`,
                }
            });
        }

        // Bulk upload: multiple pre-named PDFs
        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'No files provided' }, { status: 400 });
        }

        const uploaded: { name: string; originalSize: number; compressedSize: number; savings: string }[] = [];
        const failed: { name: string; error: string }[] = [];
        let totalOriginal = 0;
        let totalCompressed = 0;

        // Process files in parallel batches of 5 for speed
        const BATCH_SIZE = 5;
        const pdfFiles = files.filter(f =>
            f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
        );
        const nonPdfFiles = files.filter(f =>
            f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')
        );
        nonPdfFiles.forEach(f => failed.push({ name: f.name, error: 'Not a PDF file' }));

        for (let i = 0; i < pdfFiles.length; i += BATCH_SIZE) {
            const batch = pdfFiles.slice(i, i + BATCH_SIZE);

            const results = await Promise.allSettled(
                batch.map(async (file) => {
                    const fileName = file.name.trim();
                    const arrayBuffer = await file.arrayBuffer();
                    const originalBuffer = Buffer.from(arrayBuffer);

                    // Process each PDF
                    const { finalBuffer, size } = await processPdfBuffer(originalBuffer);

                    const { error } = await admin.storage
                        .from('recruitment-pdfs')
                        .upload(fileName, finalBuffer, {
                            contentType: 'application/pdf',
                            cacheControl: '86400', // 24hr cache for PDFs
                            upsert: true,
                        });

                    if (error) throw { fileName, error: error.message };

                    return { name: fileName, originalSize: size, compressedSize: size, savings: `0.0%` };
                })
            );

            for (const result of results) {
                if (result.status === 'fulfilled') {
                    uploaded.push(result.value);
                    totalOriginal += result.value.originalSize;
                    totalCompressed += result.value.compressedSize;
                } else {
                    const reason = result.reason as any;
                    console.error(`Upload failed for ${reason?.fileName}:`, reason?.error);
                    failed.push({ name: reason?.fileName || 'unknown', error: reason?.error || 'Upload failed' });
                }
            }
        }

        const totalSavings = totalOriginal > 0
            ? ((1 - totalCompressed / totalOriginal) * 100).toFixed(1)
            : '0';

        return NextResponse.json({
            success: true,
            uploaded: uploaded.map(u => u.name),
            failed,
            summary: `${uploaded.length} uploaded, ${failed.length} failed`,
            compression: {
                totalOriginalSize: totalOriginal,
                totalCompressedSize: totalCompressed,
                totalSavings: `${totalSavings}%`,
                details: uploaded,
            }
        });
    } catch (error: any) {
        console.error('Upload failed:', error);
        return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
    }
}
