import { useState, useEffect } from "react";

const MultiSelect = ({ optionMap, selectedIds = [], onChange }) => {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    setOptions(
      optionMap?.map(({ id, label }) => ({
        id,
        label,
        value: selectedIds.includes(id),
      })) ?? []
    );
  }, [optionMap]);

  return (
    <ul className="multi-select">
      {options.map(({ id, label, value }, index) => (
        <li
          key={id}
          onClick={() => {
            const optsCpy = [...options];
            optsCpy[index].value = !optsCpy[index].value;
            setOptions(optsCpy);
            onChange?.(optsCpy.filter(opt => opt.value).map(opt => opt.id), label, id);
          }}
          style={{
            background: value ? "var(--clr-primary)" : "lightgray",
            color: value ? "white" : "gray",
          }}
        >
          {label}
        </li>
      ))}
    </ul>
  );
};

export default MultiSelect;
