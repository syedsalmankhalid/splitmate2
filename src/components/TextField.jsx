export default function TextField({ label, id, ...inputProps }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm text-ink">
        {label}
      </label>
      <input id={id} className="input" {...inputProps} />
    </div>
  )
}
