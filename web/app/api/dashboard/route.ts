import { json, isResponse, requireUser } from '@/lib/http';
import { withStoreRead } from '@/lib/storage';
import { mergeStudentProfile } from '@/lib/student-profile';
import { isActiveEnrollment } from '@/lib/types';
import type { Course, Order } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const auth = requireUser(request, 'student');
  if (isResponse(auth)) return auth;

  return withStoreRead((store) => {
    const user = store.users.find((item) => item.id === auth.id);
    if (!user) return json({ message: 'User not found' }, 404);

    const courses = store.enrollments
      .filter((item) => Number(item.studentId) === Number(auth.id) && isActiveEnrollment(item))
      .map((item) => store.courses.find((course) => course.id === item.courseId))
      .filter((course): course is Course => Boolean(course));

    const assignments = store.assignments
      .filter((item) => Number(item.studentId) === Number(auth.id))
      .map((assignment) => {
        const course = store.courses.find((item) => item.id === assignment.courseId);
        return { ...assignment, courseTitle: course ? course.title : 'Unknown Course' };
      });

    const orders: Order[] = store.orders
      .filter((item) => Number(item.studentId) === Number(auth.id))
      .map((order) => ({
        ...order,
        studentName: user.name,
        studentEmail: user.email,
      }));

    return json({
      courses,
      assignments,
      orders,
      name: user.name,
      email: user.email,
      profile: mergeStudentProfile(user.id, user.profile),
    });
  });
}
