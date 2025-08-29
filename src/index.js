import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { BrowserRouter } from 'react-router-dom';

import App from './components/App';
import reducers from './reducers';
// import promiseMiddleware from 'redux-promise';
import thunk from 'redux-thunk';

import registerServiceWorker from './registerServiceWorker';
import 'bootstrap/dist/css/bootstrap.css';
import './index.css';
import "@fontsource/tiro-devanagari-sanskrit";             // Default weight (400)
import "@fontsource/tiro-devanagari-sanskrit/400.css";     // Explicit weight
// Use additional files like `400-italic.css` if needed

const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);

ReactDOM.render(
  <Provider store={createStoreWithMiddleware(reducers)}>
    <BrowserRouter><App /></BrowserRouter>
  </Provider>,
  document.getElementById('root'));
registerServiceWorker();
