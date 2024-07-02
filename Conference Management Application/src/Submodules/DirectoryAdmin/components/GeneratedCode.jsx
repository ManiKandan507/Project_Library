import { useEffect, useState } from "react";

import { Icon } from "semantic-ui-react";
import "./index.css";

const GeneratedCode = ({ code }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!show) return;
    navigator.clipboard.writeText(code);
    const timer = setTimeout(() => setShow(false), 2000);
    return () => clearTimeout(timer);
  }, [show]);

  return (
    <code>
      {code}
      <div className="text-right">
        {show && <span className="generated-code-copied">Copied!</span>}
        <Icon
          onClick={() => setShow(true)}
          className="pointer"
          name="copy outline"
          style={{ marginLeft: ".5em" }}
        />
      </div>
    </code>
  );
};

export default GeneratedCode;
