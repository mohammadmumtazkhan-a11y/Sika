interface CountryPillProps {
  flag: string;
  name: string;
}

export default function CountryPill({ flag, name }: CountryPillProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#DCE3DF] text-sm font-medium text-[#1E2A24] hover:border-[#1FAF5A] hover:shadow-[0_2px_12px_rgba(31,175,90,0.15)] transition-all duration-200 cursor-default">
      <span className="text-lg leading-none">{flag}</span>
      <span>{name}</span>
    </div>
  );
}
