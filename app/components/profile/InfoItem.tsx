// app/components/profile/InfoItem.tsx
interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

export default function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
      <div className="text-blue-600 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-sm text-gray-900 mt-1 break-words">{value}</p>
      </div>
    </div>
  );
}