import { HexColorPicker } from "react-colorful";

import "./index.css";

const ColorDisplay = ({ label, value, onChange }) => {
  return (
    <div>
      <h5
        className="text-center form-header"
        style={{ marginBottom: ".5em", fontSize: "1em" }}
      >
        {label}
      </h5>

      <div
        className="color-display-wrapper mx-auto"
        style={{ marginBottom: ".5em" }}
      >
        <button
          className="color-display mx-auto"
          style={{
            background: value,
          }}
        ></button>
        <div className="color-popover">
          <HexColorPicker color={value} onChange={onChange} />
        </div>
      </div>
      <input
        type="text"
        placeholder="Color"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
};

export default ColorDisplay;
