import './SectionHeader.css';

interface SectionHeaderProps {
  topLine: string;
  bottomLine: string;
}

function SectionHeader({ topLine, bottomLine }: SectionHeaderProps) {
  return (
    <div className="section-header">
      <div className="section-header-lines">
        <div className="section-header-line"></div>
        <div className="section-header-line"></div>
      </div>
      <div className="section-header-text">
        <div className="section-header-top">{topLine}</div>
        <div className="section-header-bottom">{bottomLine}</div>
      </div>
    </div>
  );
}

export default SectionHeader;
