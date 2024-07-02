import "./App.css";

import MailingListForm from "./MailingListForm";

function App({ staticConfig }) {
  return (
    <div className="App">
      <MailingListForm staticConfig={staticConfig} />
    </div>
  );
}

export default App;
