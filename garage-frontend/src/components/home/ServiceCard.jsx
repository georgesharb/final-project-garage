export default function ServiceCard({ name, description }) {
  return (
    <article className="service">
      <h3>{name}</h3>
      <p>{description}</p>
    </article>
  );
}
