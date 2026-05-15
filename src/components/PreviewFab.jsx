import { Eye } from 'lucide-react'

export default function PreviewFab({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="absolute bottom-32 right-4 bg-purple-600 text-white rounded-full pl-4 pr-5 py-3 flex items-center gap-2 shadow-lg shadow-purple-300 font-semibold text-[15px] active:scale-95 transition-all z-10"
    >
      <Eye size={17} /> Pré-visualizar
    </button>
  )
}
