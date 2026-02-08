import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import CoursePreview from "@/components/CoursePreview";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const [coursesResult, usersResult, successResult, plansResult] = await Promise.all([
    supabase.from('courses').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('success_stories').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('subscription_plans').select('*').order('price', { ascending: true })
  ]);

  const stats = {
    courses: coursesResult.count || 0,
    traders: usersResult.count || 0,
    success_rate: 95
  };

  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero stats={stats} />
      <Features />
      <CoursePreview plans={plansResult.data || []} user={user} />
      <Footer />
    </main>
  );
}
