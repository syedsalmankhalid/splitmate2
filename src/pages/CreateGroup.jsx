import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Avatar from '../components/Avatar'
import TextField from '../components/TextField'
import { useAuth } from '../context/AuthContext'
import { createGroup, getUserByEmail, normalizeEmail } from '../data/storage'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function CreateGroup() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [members, setMembers] = useState([])
  const [memberError, setMemberError] = useState('')
  const [formError, setFormError] = useState('')

  function addMember() {
    const email = normalizeEmail(emailInput)
    if (!EMAIL_PATTERN.test(email)) return setMemberError('Enter a valid email address.')
    if (email === user.email) return setMemberError("You're already in the group.")
    if (members.some((m) => m.email === email)) return setMemberError('That person is already added.')

    const registered = getUserByEmail(email)
    setMembers([...members, { email, name: registered?.name ?? null, pending: !registered }])
    setEmailInput('')
    setMemberError('')
  }

  function handleEmailKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      addMember()
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!name.trim()) return setFormError('Give your group a name.')
    const group = createGroup({ name, creator: user, memberEmails: members.map((m) => m.email) })
    navigate(`/group/${group.id}`)
  }

  return (
    <div>
      <Link to="/dashboard" className="text-sm text-ink-secondary hover:text-ink">
        ← Back to dashboard
      </Link>
      <h1 className="mt-3 text-xl text-ink">Create a group</h1>

      <form onSubmit={handleSubmit} className="card mt-6 space-y-6">
        <TextField
          id="group-name"
          label="Group name"
          placeholder="e.g. Goa trip"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div>
          <label htmlFor="member-email" className="mb-1.5 block text-sm text-ink">
            Add members by email
          </label>
          <div className="flex gap-2">
            <input
              id="member-email"
              type="email"
              placeholder="friend@example.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={handleEmailKeyDown}
              className="input"
            />
            <button type="button" onClick={addMember} className="btn btn-secondary shrink-0">
              Add
            </button>
          </div>
          {memberError && <p className="mt-1.5 text-sm text-danger">{memberError}</p>}

          <ul className="mt-4 divide-y divide-line rounded-lg border border-line">
            <li className="flex items-center gap-3 px-3 py-2.5">
              <Avatar name={user.name} />
              <span className="min-w-0 flex-1 truncate text-sm">
                <span className="text-ink">{user.name}</span>{' '}
                <span className="text-ink-muted">{user.email}</span>
              </span>
              <span className="text-xs text-ink-muted">You · creator</span>
            </li>
            {members.map((member) => (
              <li key={member.email} className="flex items-center gap-3 px-3 py-2.5">
                <Avatar name={member.name ?? member.email} />
                <span className="min-w-0 flex-1 truncate text-sm">
                  {member.name && <span className="text-ink">{member.name} </span>}
                  <span className={member.name ? 'text-ink-muted' : 'text-ink'}>{member.email}</span>
                </span>
                {member.pending && <span className="badge bg-pending-soft text-pending">pending</span>}
                <button
                  type="button"
                  onClick={() => setMembers(members.filter((m) => m.email !== member.email))}
                  className="text-xs text-ink-muted hover:text-danger"
                  aria-label={`Remove ${member.email}`}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-ink-muted">
            People without an account are added as pending and join once they register.
          </p>
        </div>

        {formError && <p className="text-sm text-danger">{formError}</p>}
        <button type="submit" className="btn btn-primary w-full">
          Create group
        </button>
      </form>
    </div>
  )
}
