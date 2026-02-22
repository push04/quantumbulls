
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCourse() {
    console.log("Checking for course with slug: stock-market-basics");
    const { data: course, error } = await supabase
        .from('courses')
        .select('id, title, slug, is_active')
        .eq('slug', 'stock-market-basics')
        .maybeSingle();

    if (error) {
        console.error('Error fetching course:', error);
    } else {
        console.log('Course found:', course);
    }

    console.log("\nListing all courses:");
    const { data: allCourses } = await supabase.from('courses').select('title, slug');
    console.table(allCourses);
}

checkCourse();
