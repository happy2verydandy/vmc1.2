-- Add function to update course enrollment count
CREATE OR REPLACE FUNCTION update_course_enrollment_count(target_course_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE courses 
  SET current_enrollment = (
    SELECT COUNT(*) 
    FROM enrollments 
    WHERE course_id = target_course_id
  )
  WHERE id = target_course_id;
END;
$$ LANGUAGE plpgsql;