import { CourseError, CourseErrorCode } from './error';
import { CourseSchema } from './schema';

type SupabaseClient = any;

interface GetCoursesParams {
  search?: string;
  category?: string;
  difficulty_level?: string;
  sort?: 'latest' | 'popular';
  page?: number;
  limit?: number;
  status?: 'published';
}

export async function getCourses(
  supabase: SupabaseClient,
  params: GetCoursesParams = {}
) {
  const {
    search = '',
    category,
    difficulty_level,
    sort = 'latest',
    page = 1,
    limit = 10,
    status = 'published'
  } = params;

  let query = supabase
    .from('courses')
    .select(`
      id,
      instructor_id,
      title,
      description,
      category,
      difficulty_level,
      status,
      max_enrollment,
      current_enrollment,
      created_at,
      updated_at,
      profiles (full_name)
    `)
    .eq('status', status); // Only show published courses

  // Apply filters
  if (search) {
    query = query.ilike('title', `%${search}%`);
  }
  
  if (category) {
    query = query.eq('category', category);
  }
  
  if (difficulty_level) {
    query = query.eq('difficulty_level', difficulty_level);
  }

  // Apply sorting
  if (sort === 'popular') {
    // Sort by current_enrollment descending if popular
    query = query.order('current_enrollment', { ascending: false });
  } else {
    // Default to latest (created_at descending)
    query = query.order('created_at', { ascending: false });
  }

  // Apply pagination
  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const result = await query;
  const { data, error, count } = result;

  if (error) {
    throw new Error(`Failed to fetch courses: ${error.message}`);
  }

  // Process data to extract instructor name from profiles
  const processedData = (data || []).map((course: any) => ({
    ...course,
    instructor_name: course.profiles?.full_name || 'Unknown Instructor',
  }));

  return {
    data: processedData,
    count: count || 0,
    page,
    limit,
  };
}

export async function getCourseById(
  supabase: SupabaseClient,
  courseId: string,
  status: 'published' | 'all' = 'published'
) {
  let query = supabase
    .from('courses')
    .select(`
      id,
      instructor_id,
      title,
      description,
      category,
      difficulty_level,
      status,
      max_enrollment,
      current_enrollment,
      created_at,
      updated_at,
      profiles (full_name)
    `)
    .eq('id', courseId);

  if (status === 'published') {
    query = query.eq('status', 'published');
  }

  const { data, error } = await query.single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new CourseError(
        CourseErrorCode.COURSE_NOT_FOUND,
        'Course not found',
        404
      );
    }
    throw new Error(`Failed to fetch course: ${error.message}`);
  }

  if (!data) {
    throw new CourseError(
      CourseErrorCode.COURSE_NOT_FOUND,
      'Course not found',
      404
    );
  }

  return {
    ...(data as any),
    instructor_name: (data as any).profiles?.full_name || 'Unknown Instructor',
  };
}

export async function createEnrollment(
  supabase: SupabaseClient,
  courseId: string,
  learnerId: string
) {
  // First, check if the course exists and is published
  const course = await getCourseById(supabase, courseId, 'published');
  
  if (course.status !== 'published') {
    throw new CourseError(
      CourseErrorCode.COURSE_NOT_PUBLISHED,
      'Course is not available for enrollment',
      400
    );
  }

  // Check if user is already enrolled
  const { data: existingEnrollment } = await supabase
    .from('enrollments')
    .select('id')
    .eq('course_id', courseId)
    .eq('learner_id', learnerId)
    .single();

  if (existingEnrollment) {
    throw new CourseError(
      CourseErrorCode.ALREADY_ENROLLED,
      'Already enrolled in this course',
      400
    );
  }

  // Check enrollment limit
  if (
    course.max_enrollment &&
    course.current_enrollment >= course.max_enrollment
  ) {
    throw new CourseError(
      CourseErrorCode.ENROLLMENT_LIMIT_EXCEEDED,
      'Course enrollment limit exceeded',
      400
    );
  }

  // Create the enrollment
  const { data, error } = await supabase
    .from('enrollments')
    .insert({
      course_id: courseId,
      learner_id: learnerId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create enrollment: ${error.message}`);
  }

  // Update current_enrollment count in the course
  const { count } = await supabase
    .from('enrollments')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', courseId);

  if (count !== undefined) {
    await supabase
      .from('courses')
      .update({ current_enrollment: count })
      .eq('id', courseId);
  }

  return data;
}

export async function isUserEnrolledInCourse(
  supabase: SupabaseClient,
  courseId: string,
  learnerId: string
) {
  const { data, error } = await supabase
    .from('enrollments')
    .select('id')
    .eq('course_id', courseId)
    .eq('learner_id', learnerId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to check enrollment: ${error.message}`);
  }

  return !!data;
}