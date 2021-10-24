import { combineReducers } from 'redux';
import verseReducer from './verse_reducer';

const rootReducer = combineReducers({
  verseReducer: verseReducer,
});

export default rootReducer;
