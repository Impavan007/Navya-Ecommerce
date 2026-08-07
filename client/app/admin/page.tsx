import { redirect } from 'next/navigation';

export default function adminPage() {
  redirect('/admin/users');
}