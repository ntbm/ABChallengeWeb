interface StatusBadgeProps {
  type: 'date' | 'note'
  active: boolean
}

export function StatusBadge({ type, active }: StatusBadgeProps) {
  if (!active) return null
  
  return (
    <span 
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
        type === 'date' 
          ? 'bg-green-100 text-green-800' 
          : 'bg-blue-100 text-blue-800'
      }`}
    >
      {type === 'date' ? '●' : '✎'}
    </span>
  )
}
