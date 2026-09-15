CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'parent', 'student');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  avatar_url text,
  school_name text NOT NULL DEFAULT 'My School',
  phone text,
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  onboarding_complete boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin') OR public.has_role(_user_id, 'teacher')
$$;

CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Staff create profiles" ON public.profiles FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()) OR id = auth.uid());
CREATE POLICY "Admins delete profiles" ON public.profiles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_staff(auth.uid()));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE assigned_role public.app_role;
BEGIN
  assigned_role := CASE WHEN NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN 'admin'::public.app_role ELSE 'student'::public.app_role END;
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', split_part(COALESCE(new.email, ''), '@', 1)), COALESCE(new.email, ''))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (new.id, assigned_role) ON CONFLICT DO NOTHING;
  RETURN new;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.school_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  level text NOT NULL,
  arm text,
  room text,
  capacity integer NOT NULL DEFAULT 30,
  teacher_id uuid,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.school_classes TO authenticated;
GRANT ALL ON public.school_classes TO service_role;
ALTER TABLE public.school_classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed in users read classes" ON public.school_classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff manage classes" ON public.school_classes FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.student_enrolments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL UNIQUE,
  class_id uuid REFERENCES public.school_classes(id) ON DELETE SET NULL,
  admission_no text NOT NULL UNIQUE,
  parent_name text,
  parent_email text,
  parent_user_id uuid,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_enrolments TO authenticated;
GRANT ALL ON public.student_enrolments TO service_role;
ALTER TABLE public.student_enrolments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read enrolments" ON public.student_enrolments FOR SELECT TO authenticated USING (public.is_staff(auth.uid()) OR student_id = auth.uid() OR parent_user_id = auth.uid());
CREATE POLICY "Staff manage enrolments" ON public.student_enrolments FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.school_classes(id) ON DELETE CASCADE,
  subject text NOT NULL,
  title text NOT NULL,
  instructions text NOT NULL DEFAULT '',
  due_at timestamptz,
  status text NOT NULL DEFAULT 'published',
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assignments TO authenticated;
GRANT ALL ON public.assignments TO service_role;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Connected users read assignments" ON public.assignments FOR SELECT TO authenticated USING (public.is_staff(auth.uid()) OR EXISTS (SELECT 1 FROM public.student_enrolments e WHERE e.class_id = assignments.class_id AND (e.student_id = auth.uid() OR e.parent_user_id = auth.uid())));
CREATE POLICY "Staff manage assignments" ON public.assignments FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  class_id uuid REFERENCES public.school_classes(id) ON DELETE SET NULL,
  subject text NOT NULL,
  title text NOT NULL,
  score numeric NOT NULL DEFAULT 0,
  max_score numeric NOT NULL DEFAULT 100,
  feedback text,
  assessment_id uuid,
  graded_by uuid,
  graded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.grades TO authenticated;
GRANT ALL ON public.grades TO service_role;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Connected users read grades" ON public.grades FOR SELECT TO authenticated USING (public.is_staff(auth.uid()) OR student_id = auth.uid() OR EXISTS (SELECT 1 FROM public.student_enrolments e WHERE e.student_id = grades.student_id AND e.parent_user_id = auth.uid()));
CREATE POLICY "Staff manage grades" ON public.grades FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.timetable_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.school_classes(id) ON DELETE CASCADE,
  subject text NOT NULL,
  teacher_id uuid,
  day_of_week integer NOT NULL,
  starts_at time NOT NULL,
  ends_at time NOT NULL,
  room text,
  entry_type text NOT NULL DEFAULT 'class',
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.timetable_entries TO authenticated;
GRANT ALL ON public.timetable_entries TO service_role;
ALTER TABLE public.timetable_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Connected users read timetable" ON public.timetable_entries FOR SELECT TO authenticated USING (public.is_staff(auth.uid()) OR teacher_id = auth.uid() OR EXISTS (SELECT 1 FROM public.student_enrolments e WHERE e.class_id = timetable_entries.class_id AND (e.student_id = auth.uid() OR e.parent_user_id = auth.uid())));
CREATE POLICY "Staff manage timetable" ON public.timetable_entries FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  subject text NOT NULL,
  class_id uuid REFERENCES public.school_classes(id) ON DELETE SET NULL,
  class_name text NOT NULL,
  topic text NOT NULL,
  assessment_type text NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 30,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  published boolean NOT NULL DEFAULT false,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.assessments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assessments TO authenticated;
GRANT ALL ON public.assessments TO service_role;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads published assessments" ON public.assessments FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Owners read assessments" ON public.assessments FOR SELECT TO authenticated USING (created_by = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "Staff create assessments" ON public.assessments FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()) AND created_by = auth.uid());
CREATE POLICY "Staff update assessments" ON public.assessments FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff delete assessments" ON public.assessments FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

CREATE TABLE public.assessment_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  student_id uuid,
  student_name text NOT NULL,
  student_email text,
  class_name text,
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  score numeric,
  max_score numeric NOT NULL DEFAULT 100,
  auto_graded boolean NOT NULL DEFAULT false,
  needs_review boolean NOT NULL DEFAULT true,
  feedback text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.assessment_submissions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assessment_submissions TO authenticated;
GRANT ALL ON public.assessment_submissions TO service_role;
ALTER TABLE public.assessment_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone submits assessments" ON public.assessment_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Staff or owner reads submissions" ON public.assessment_submissions FOR SELECT TO authenticated USING (public.is_staff(auth.uid()) OR student_id = auth.uid());
CREATE POLICY "Staff grades submissions" ON public.assessment_submissions FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Admins delete submissions" ON public.assessment_submissions FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER classes_updated BEFORE UPDATE ON public.school_classes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER enrolments_updated BEFORE UPDATE ON public.student_enrolments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER assignments_updated BEFORE UPDATE ON public.assignments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER grades_updated BEFORE UPDATE ON public.grades FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER timetable_updated BEFORE UPDATE ON public.timetable_entries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER assessments_updated BEFORE UPDATE ON public.assessments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER submissions_updated BEFORE UPDATE ON public.assessment_submissions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_roles_user ON public.user_roles(user_id);
CREATE INDEX idx_enrolments_student ON public.student_enrolments(student_id);
CREATE INDEX idx_enrolments_class ON public.student_enrolments(class_id);
CREATE INDEX idx_assignments_class ON public.assignments(class_id);
CREATE INDEX idx_grades_student ON public.grades(student_id);
CREATE INDEX idx_timetable_class ON public.timetable_entries(class_id);
CREATE INDEX idx_assessments_slug ON public.assessments(slug);
CREATE INDEX idx_submissions_assessment ON public.assessment_submissions(assessment_id);