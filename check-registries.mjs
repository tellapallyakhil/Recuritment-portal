import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('--- Student Registry Users ---');
    const { data: students, error: studentError } = await supabase.from('student_registry').select('email, application_number, name');
    if (studentError) console.error(studentError);
    else console.log(students);

    console.log('\n--- Faculty Registry Users ---');
    const { data: faculty, error: facultyError } = await supabase.from('faculty_registry').select('email, designation, name');
    if (facultyError) console.error(facultyError);
    else console.log(faculty);
}

run();
