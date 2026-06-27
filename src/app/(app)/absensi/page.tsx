import { getAttendance, getStudentClasses, getTeacherAttendance } from '@/lib/actions';
import AbsensiClient from './AbsensiClient';

export default async function AbsensiPage() {
  const today = new Date().toISOString().split('T')[0];
  const attendance = await getAttendance(today);
  const teacherAttendance = await getTeacherAttendance(today);
  const classes = await getStudentClasses();
  return (
    <AbsensiClient
      initialAttendance={attendance}
      initialTeacherAttendance={teacherAttendance}
      classes={classes}
      initialDate={today}
    />
  );
}
