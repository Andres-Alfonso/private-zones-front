// app/components/profile/ProfileHeader.tsx
interface ProfileHeaderProps {
  onBack: () => void;
}

export default function ProfileHeader({ onBack }: ProfileHeaderProps) {
  return (
    <div className="mb-6">
      <button
        onClick={onBack}
        className="text-blue-600 hover:text-blue-700 font-medium transition-colors mb-4 flex items-center"
      >
        <span className="mr-2">←</span>
        Volver al inicio
      </button>
      <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
      <p className="text-gray-600 mt-1">Gestiona tu información personal</p>
    </div>
  );
}