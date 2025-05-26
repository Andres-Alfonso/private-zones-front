// app/routes/profile.tsx

import { useState, useEffect } from 'react';
import { useAuthApi } from '~/hooks/useAuthApi';
import AuthGuard from '~/components/AuthGuard';

export default function Profile() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}

function ProfileContent() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const api = useAuthApi();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.get('/v1/auth/me');
        setProfileData(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [api]);

  if (loading) {
    return <div>Cargando perfil...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Mi Perfil</h1>
      
      {profileData && (
        <div className="bg-white p-6 rounded-lg shadow">
          <pre>{JSON.stringify(profileData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}