import './App.css';

import { Provider } from 'react-redux';
import { store } from './appRedux/store/index';

function App() {
  return (
    <Provider store={store}>
      <div className="App">
          Hello World!!!
      </div>
    </Provider>
  );
}

export default App;
