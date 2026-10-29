import { Link } from 'react-router-dom'

export default function Logo({ to = '/' }) {
  return (
    <Link to={to} className="text-base font-bold tracking-tight text-ink">
      Splitmate
    </Link>
  )
}
