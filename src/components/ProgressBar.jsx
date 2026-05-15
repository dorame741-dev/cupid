export default function ProgressBar({ current, total }) {
  return (
    <div className="flex items-center px-1">
      {Array.from({ length: total }, (_, i) => i + 1).map((step, idx, arr) => (
        <div key={step} className="flex items-center flex-1 last:flex-none">
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300
            ${step < current ? 'bg-purple-600 text-white' : ''}
            ${step === current ? 'border-2 border-purple-600 text-purple-600 bg-white shadow-sm shadow-purple-200' : ''}
            ${step > current ? 'border-2 border-gray-200 text-gray-300 bg-white' : ''}
          `}>
            {step < current ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : step}
          </div>
          {idx < arr.length - 1 && (
            <div className={`h-0.5 flex-1 mx-1 rounded-full transition-all duration-300 ${step < current ? 'bg-purple-600' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}
