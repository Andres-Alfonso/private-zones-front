// app/components/profile/ProfileInfo.tsx
import { User, Mail, Building, Phone, MapPin, Calendar, Briefcase, FileText } from 'lucide-react';
import InfoItem from './InfoItem';
import { ProfileData } from '../../api/types/user.types';

interface ProfileInfoProps {
  profileData: ProfileData;
}

export default function ProfileInfo({ profileData }: ProfileInfoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InfoItem 
        icon={<User className="h-5 w-5" />}
        label="Nombre completo"
        value={`${profileData.name} ${profileData.lastName}`}
      />
      <InfoItem 
        icon={<Mail className="h-5 w-5" />}
        label="Correo electrónico"
        value={profileData.email}
      />
      {profileData.profileConfig?.phoneNumber && (
        <InfoItem 
          icon={<Phone className="h-5 w-5" />}
          label="Teléfono"
          value={profileData.profileConfig.phoneNumber}
        />
      )}
      {profileData.profileConfig?.documentNumber && (
        <InfoItem 
          icon={<FileText className="h-5 w-5" />}
          label={`${profileData.profileConfig.type_document || 'Documento'}`}
          value={profileData.profileConfig.documentNumber}
        />
      )}
      {profileData.profileConfig?.organization && (
        <InfoItem 
          icon={<Building className="h-5 w-5" />}
          label="Organización"
          value={profileData.profileConfig.organization}
        />
      )}
      {profileData.profileConfig?.charge && (
        <InfoItem 
          icon={<Briefcase className="h-5 w-5" />}
          label="Cargo"
          value={profileData.profileConfig.charge}
        />
      )}
      {profileData.profileConfig?.city && (
        <InfoItem 
          icon={<MapPin className="h-5 w-5" />}
          label="Ciudad"
          value={`${profileData.profileConfig.city}${profileData.profileConfig.country ? `, ${profileData.profileConfig.country}` : ''}`}
        />
      )}
      {profileData.profileConfig?.address && (
        <InfoItem 
          icon={<MapPin className="h-5 w-5" />}
          label="Dirección"
          value={profileData.profileConfig.address}
        />
      )}
      <InfoItem 
        icon={<Calendar className="h-5 w-5" />}
        label="Miembro desde"
        value={new Date(profileData.createdAt).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      />
    </div>
  );
}