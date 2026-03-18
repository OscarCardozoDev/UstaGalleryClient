interface Props {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: Props) {
  return (
    <header className="bg-[#f8f5f8] rounded-tl-[20px] rounded-tr-[20px] border-b-2 border-[#dddddd]">
      <div className="flex items-center px-4 py-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-700"
          aria-label="Abrir menú"
        >
          <svg 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 6h16M4 12h16M4 18h16" 
            />
          </svg>
        </button>
        
        <h1 className="ml-4 text-[#171717] text-xl font-semibold">
          Dashboard
        </h1>
      </div>
    </header>
  );
}