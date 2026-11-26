import { useState } from 'react';

// Delete needs TWO clicks: 1st click asks "Sure?", 2nd click deletes.
// If you don't click again within 3 seconds, it goes back to normal.
export default function DeleteButton({ onDelete }) {
  const [armed, setArmed] = useState(false);

  function handleClick() {
    if (armed) {
      setArmed(false);
      onDelete();
    } else {
      setArmed(true);
      setTimeout(() => setArmed(false), 3000);
    }
  }

  return (
    <button className={armed ? 'btn-danger armed' : 'btn-danger'} onClick={handleClick}>
      {armed ? 'Click again to delete' : 'Delete'}
    </button>
  );
}
