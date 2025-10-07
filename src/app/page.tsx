import { redirect } from 'next/navigation';
import { loadCurrentUser } from '@/features/auth/server/load-current-user';
import Link from 'next/link';

export default async function HomePage() {
  const currentUserSnapshot = await loadCurrentUser();

  // 사용자가 로그인되어 있다면 대시보드로 리다이렉션
  if (currentUserSnapshot.status === 'authenticated' && currentUserSnapshot.user) {
    // 역할 정보는 userMetadata에 저장되어 있을 수 있음
    const userRole = currentUserSnapshot.user.userMetadata?.role as string | undefined;
    
    if (userRole === 'learner') {
      redirect('/dashboard');
    } else if (userRole === 'instructor') {
      redirect('/instructor/dashboard');
    }
  }

  // 익명 사용자일 경우 공개 홈 화면 표시
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary">LMS Platform</h1>
          <div className="flex gap-4">
            <Link 
              href="/login" 
              className="px-4 py-2 text-sm font-medium text-primary hover:underline"
            >
              Log in
            </Link>
            <Link 
              href="/signup" 
              className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="container mx-auto py-16 px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
            Learn and Teach Without Limits
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Connect with instructors and learners in our comprehensive learning management platform.
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              href="/courses" 
              className="px-6 py-3 bg-primary text-white rounded-md text-base font-medium hover:bg-primary/90"
            >
              Explore Courses
            </Link>
            <Link 
              href="/signup" 
              className="px-6 py-3 bg-white text-primary border border-primary rounded-md text-base font-medium hover:bg-gray-50"
            >
              Join as Instructor
            </Link>
          </div>
        </section>

        <section className="container mx-auto py-12 px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="text-primary text-3xl mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2">Explore Courses</h3>
              <p className="text-gray-600">
                Browse through hundreds of courses across various categories and difficulty levels.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="text-primary text-3xl mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2">Enroll & Learn</h3>
              <p className="text-gray-600">
                Sign up for courses that interest you and start learning at your own pace.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="text-primary text-3xl mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2">Submit & Achieve</h3>
              <p className="text-gray-600">
                Complete assignments, get feedback, and track your progress.
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto py-12 px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Mock course cards - 실제 데이터는 서버에서 가져와야 함 */}
            <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-48" />
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1">Introduction to Programming</h3>
                <p className="text-gray-600 text-sm mb-2">Learn the basics of programming</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Beginner</span>
                  <span className="text-sm text-muted-foreground">Instructor: John Doe</span>
                </div>
              </div>
            </div>
            <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-48" />
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1">Web Development Fundamentals</h3>
                <p className="text-gray-600 text-sm mb-2">Master HTML, CSS, and JavaScript</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Intermediate</span>
                  <span className="text-sm text-muted-foreground">Instructor: Jane Smith</span>
                </div>
              </div>
            </div>
            <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-48" />
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1">Data Science Essentials</h3>
                <p className="text-gray-600 text-sm mb-2">Data analysis and visualization</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Advanced</span>
                  <span className="text-sm text-muted-foreground">Instructor: Mike Johnson</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-100 py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold text-lg mb-4">LMS Platform</h4>
              <p className="text-gray-600 text-sm">
                Connecting learners and instructors in a comprehensive learning environment.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Learners</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/courses" className="hover:underline">Browse Courses</Link></li>
                <li><Link href="/dashboard" className="hover:underline">My Dashboard</Link></li>
                <li><Link href="/my/grades" className="hover:underline">My Grades</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Instructors</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/instructor/dashboard" className="hover:underline">Dashboard</Link></li>
                <li><Link href="/instructor/courses" className="hover:underline">My Courses</Link></li>
                <li><Link href="/instructor/assignments" className="hover:underline">Assignments</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Support</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:underline">Help Center</a></li>
                <li><a href="#" className="hover:underline">Contact Us</a></li>
                <li><a href="#" className="hover:underline">Community</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-6 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} LMS Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}