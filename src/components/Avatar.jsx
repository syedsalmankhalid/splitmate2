// Pending members have no name yet, so fall back to the first letter of their email.
function initialsOf(name) {
  if (name.includes('@')) return name[0].toUpperCase()
  const words = name.trim().split(/\s+/)
  return words
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')
}

export default function Avatar({ name, className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-avatar-bg text-2xs font-semibold text-avatar-ink ${className}`}
    >
      {initialsOf(name)}
    </span>
  )
}
