interface SectionHeaderProps {
  topLine: string;
  bottomLine: string;
}

function SectionHeader({ topLine, bottomLine }: SectionHeaderProps) {
  return (
    <div className="w-full mb-4 md:mb-3">
      <div className="flex items-center mb-2 md:mb-1 pb-3">
        <div className="flex flex-col gap-[0.1rem]">
          <div className="text-(--title-color) text-[0.8rem] font-medium 
                          uppercase tracking-[0.3px] md:text-[0.75rem]">{topLine}</div>
          <div className="text-(--description-color) text-[0.7rem] font-normal 
                          opacity-70 md:text-[0.65rem]">{bottomLine}</div>
        </div>
      </div>
      <hr className="w-full border-0 mt-0 mb-8 bg-gray-300" 
           style={{ display: 'block', height: '4px', minHeight: '4px', 
           maxHeight: '4px', marginTop: '0', marginBottom: '2rem', padding: 0, lineHeight: 0 }} />
    </div>
  );
}

export default SectionHeader;
