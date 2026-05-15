import { ChevronLeft } from 'lucide-react'

export default function BackButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-purple-100 active:scale-90 transition-all shrink-0"
    >
      <ChevronLeft size={20} className="text-purple-600 ml-[-1px]" />
    </button>
  )
}
