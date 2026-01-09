import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import PageContainer from '@/components/PageContainer';
import { adminApi } from '@/src/lib/admin-api';
import { meApi } from '@/src/lib/api';
import UsersTable from './UsersTable';

type UsersPageProps = {
  searchParams?: Promise<{ page?: string }>;
};

export default async function AdminUsersPage({ searchParams }: UsersPageProps) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map(cookie => `${cookie.name}=${cookie.value}`)
    .join('; ');

  // Check authentication
  try {
    await meApi.getProfile(cookieHeader);
  } catch (error) {
    redirect('/login');
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const page = Number(resolvedSearchParams.page) || 1;

  let usersData;
  try {
    usersData = await adminApi.getUsers(page, 50, cookieHeader);
  } catch (error) {
    redirect('/');
  }

  return (
    <PageContainer title="All Users" description="Manage and view all registered users">
      <UsersTable initialData={usersData} />
    </PageContainer>
  );
}
