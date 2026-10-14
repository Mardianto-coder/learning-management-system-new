import { json, isResponse, requireUser } from '@/lib/http';
import { withStoreRead } from '@/lib/storage';
import { dedupeBankAccounts } from '@/lib/banks';
import { mergeStudentProfile } from '@/lib/student-profile';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const auth = requireUser(request, 'admin');
  if (isResponse(auth)) return auth;

  return withStoreRead((store) => {
    const assignments = store.assignments.map((assignment) => {
      const course = store.courses.find((item) => item.id === assignment.courseId);
      const student = store.users.find((item) => item.id === assignment.studentId);
      return {
        ...assignment,
        courseTitle: course ? course.title : 'Unknown Course',
        studentName: student ? student.name : 'Unknown Student',
        studentEmail: student ? student.email : 'Unknown Email',
      };
    });
    const orders = store.orders.map((order) => {
      const student = store.users.find((item) => item.id === order.studentId);
      return {
        ...order,
        studentName: student?.name || 'Unknown Student',
        studentEmail: student?.email || 'Unknown Email',
      };
    });
    const students = store.users
      .filter((user) => user.role === 'student')
      .map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        profile: mergeStudentProfile(user.id, user.profile),
      }));
    return json({
      courses: store.courses,
      assignments,
      orders,
      payment: { ...store.payment, accounts: dedupeBankAccounts(store.payment.accounts) },
      students,
    });
  });
}
