// app/routes/profile.tsx
import type { MetaFunction } from "@remix-run/node";
import AuthGuard from '~/components/AuthGuard';
import ProfileContent from '~/components/profile/ProfileContent';

export const meta: MetaFunction = () => {
  return [
    { title: "Mi Perfil" },
    { name: "description", content: "Gestiona tu información de perfil" },
  ];
};

export default function Profile() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}