import { useRef, useState, useEffect } from "react";

// optionMap: js Map object of id => label
const OrderedMultiSelect = ({ optionMap, selectedIds, onChange }) => {
  const dropdownRef = useRef(null);
  const [opening, setOpening] = useState(false);

  const container = useRef(null);

  const availableIds = [...optionMap.entries()].filter(
    ([id]) => !selectedIds.includes(id)
  );

  useEffect(() => {
    if (!dropdownRef.current) return;
    const rect = dropdownRef.current.getBoundingClientRect();
    const parentRect = dropdownRef.current.parentNode.getBoundingClientRect();

    const overflowX = window.innerWidth - parentRect.x - rect.width;
    const overflowY = window.innerHeight - parentRect.y - rect.height;
    dropdownRef.current.style.left = `${Math.min(-10, overflowX)}px`;
    dropdownRef.current.style.top = `calc(${Math.min(30, overflowY)}px)`;
  }, [opening]);

  const dragging = e => {
    e.preventDefault();
    if (!container.current) return;

    const getOffset = child => {
      const box = child.getBoundingClientRect();
      const x = e.clientX - box.right + box.width / 2;
      const y = e.clientY - box.top - box.height;
      return { x, y };
    };

    const children = container.current.querySelectorAll(
      ":scope > *:not(.add-field)"
    );

    let before = null;
    let after = null;

    // find closest child before and after dragging position
    for (const child of children) {
      const { x, y } = getOffset(child);
      const closestBefore = before
        ? getOffset(before)
        : { x: Number.NEGATIVE_INFINITY, y: Number.NEGATIVE_INFINITY };
      const closestAfter = after
        ? getOffset(after)
        : { x: Number.POSITIVE_INFINITY, y: Number.POSITIVE_INFINITY };

      if (y > 0 || y < closestBefore.y) continue;
      if (x < 0 && x > closestBefore.x) before = child;
      if (x > 0 && x < closestAfter.x) after = child;
    }

    const dragging = container.current.querySelector(".dragging");
    if (before) before.before(dragging);
    if (after) after.after(dragging);
  };

  const dragEnd = e => {
    e.target.classList.remove("dragging");
    const children = container.current.querySelectorAll(
      ":scope > *:not(.add-field)"
    );
    onChange([...children].map(child => child.id));
  };

  return (
    <ol ref={container} className="ordered-multi-select" onDragOver={dragging}>
      {selectedIds.map(id => (
        <li
          key={id}
          id={id}
          draggable
          onDragStart={e => e.target.classList.add("dragging")}
          onDragEnd={dragEnd}
        >
          {optionMap.get(id)}
          <button
            className="remove"
            onClick={() => {
              onChange(selectedIds.filter(sid => sid !== id));
            }}
          >
            <i className="times icon" style={{ fontSize: ".75em" }}></i>
          </button>
        </li>
      ))}
      {availableIds.length > 0 && (
        <li
          onClick={() => setOpening(o => !o)}
          className="add-field"
          tabIndex="0"
        >
          <p>Add Field +</p>

          <div className="dropdown" ref={dropdownRef}>
            {availableIds.map(([id, label]) => (
              <button
                key={id}
                onClick={() => onChange([...selectedIds, id])}
                className="dropdown-button"
              >
                {label}
              </button>
            ))}
          </div>
        </li>
      )}
    </ol>
  );
};

export default OrderedMultiSelect;
