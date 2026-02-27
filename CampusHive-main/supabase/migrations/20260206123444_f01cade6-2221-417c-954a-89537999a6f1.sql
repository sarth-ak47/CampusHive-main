
-- Courses table
CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  name text NOT NULL,
  instructor_name text NOT NULL DEFAULT '',
  instructor_email text,
  instructor_office text,
  instructor_office_hours text,
  credits integer NOT NULL DEFAULT 3,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view courses" ON public.courses FOR SELECT USING (true);

-- Student attendance
CREATE TABLE public.student_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  total_classes integer NOT NULL DEFAULT 0,
  attended_classes integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.student_attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own attendance" ON public.student_attendance FOR SELECT USING (auth.uid() = user_id);

-- Student grades/scores for performance graphs
CREATE TABLE public.student_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  exam_type text NOT NULL DEFAULT 'midterm',
  score numeric NOT NULL DEFAULT 0,
  max_score numeric NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.student_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own scores" ON public.student_scores FOR SELECT USING (auth.uid() = user_id);

-- Campus events (unified calendar)
CREATE TABLE public.campus_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  event_type text NOT NULL DEFAULT 'general',
  venue text DEFAULT '',
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.campus_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view events" ON public.campus_events FOR SELECT USING (true);
CREATE POLICY "Admins can manage events" ON public.campus_events FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Buddy/friend preferences
CREATE TABLE public.buddy_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  available_times text[] DEFAULT '{}',
  interests text[] DEFAULT '{}',
  preferred_locations text[] DEFAULT '{}',
  bio text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.buddy_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view buddy prefs" ON public.buddy_preferences FOR SELECT USING (true);
CREATE POLICY "Users can insert own prefs" ON public.buddy_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own prefs" ON public.buddy_preferences FOR UPDATE USING (auth.uid() = user_id);

-- Hostel info
CREATE TABLE public.hostel_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  hostel_name text NOT NULL DEFAULT '',
  room_number text DEFAULT '',
  room_type text DEFAULT 'single',
  roommates text[] DEFAULT '{}',
  mess_plan text DEFAULT 'standard',
  gym_active boolean DEFAULT false,
  gym_valid_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.hostel_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own hostel info" ON public.hostel_info FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own hostel info" ON public.hostel_info FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own hostel info" ON public.hostel_info FOR UPDATE USING (auth.uid() = user_id);

-- Hostel complaints
CREATE TABLE public.hostel_complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  category text NOT NULL DEFAULT 'maintenance',
  description text NOT NULL,
  hostel_name text DEFAULT '',
  room_number text DEFAULT '',
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);
ALTER TABLE public.hostel_complaints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own complaints" ON public.hostel_complaints FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create complaints" ON public.hostel_complaints FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own complaints" ON public.hostel_complaints FOR UPDATE USING (auth.uid() = user_id);

-- Laundry requests
CREATE TABLE public.laundry_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  clothes_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  pickup_time timestamptz,
  delivery_time timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.laundry_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own laundry" ON public.laundry_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create laundry req" ON public.laundry_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert mock courses
INSERT INTO public.courses (code, name, instructor_name, instructor_email, instructor_office, instructor_office_hours, credits) VALUES
('CS201', 'Data Structures & Algorithms', 'Dr. Sharma', 'sharma@campus.edu', 'Block A, Room 204', 'Mon/Wed 2-4 PM', 4),
('CS301', 'Operating Systems', 'Prof. Gupta', 'gupta@campus.edu', 'Block B, Room 110', 'Tue/Thu 3-5 PM', 4),
('MA201', 'Linear Algebra', 'Dr. Verma', 'verma@campus.edu', 'Block C, Room 305', 'Mon/Fri 10-12 PM', 3),
('CS202', 'Database Management', 'Prof. Singh', 'singh@campus.edu', 'Block A, Room 312', 'Wed/Fri 1-3 PM', 3);

-- Insert mock campus events
INSERT INTO public.campus_events (title, description, event_type, venue, start_date, end_date) VALUES
('Mid-Semester Exams', 'Mid-semester examinations for all departments', 'exam', 'Exam Halls', '2026-03-15T09:00:00Z', '2026-03-22T17:00:00Z'),
('Resonance 2026', 'Annual cultural fest with performances and competitions', 'fest', 'Main Auditorium & Grounds', '2026-04-05T10:00:00Z', '2026-04-07T22:00:00Z'),
('Holi Holiday', 'Festival of Colors - Campus Holiday', 'holiday', '', '2026-03-10T00:00:00Z', '2026-03-10T23:59:00Z'),
('Tech Talk: AI in Healthcare', 'Guest lecture by Dr. Patel from IIT Delhi', 'talk', 'Seminar Hall B', '2026-02-20T15:00:00Z', '2026-02-20T17:00:00Z'),
('Republic Day', 'National Holiday', 'holiday', '', '2026-01-26T00:00:00Z', '2026-01-26T23:59:00Z'),
('Hackathon 2026', '24-hour coding hackathon open to all years', 'event', 'CS Block Lab 1-4', '2026-02-28T09:00:00Z', '2026-03-01T09:00:00Z');
