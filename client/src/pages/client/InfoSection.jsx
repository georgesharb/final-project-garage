// My info is READ ONLY: only the owner can change it.
export default function InfoSection({ me }) {
  return (
    <section className="card">
      <h2>My info</h2>
      <p>
        Name: <b>{me.name}</b> · Phone: <b>{me.phone}</b> · Email: <b>{me.email}</b>
      </p>
      <p className="muted">To change your info, contact the garage.</p>
    </section>
  );
}
