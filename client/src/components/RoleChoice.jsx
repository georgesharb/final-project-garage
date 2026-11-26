// Two buttons to choose "Client" or "Owner" on the Login page.
export default function RoleChoice({ role, setRole }) {
  return (
    <div className="role-choice">
      <button type="button" className={role === 'client' ? 'selected' : ''} onClick={() => setRole('client')}>
        Client
      </button>
      <button type="button" className={role === 'owner' ? 'selected' : ''} onClick={() => setRole('owner')}>
        Owner
      </button>
    </div>
  );
}
