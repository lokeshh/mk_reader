import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';

export const FETCH_VERSE_COUNT = 'FETCH_VERSE_COUNT';
export const VERSE_COUNT_SUCCESS = 'VERSE_COUNT_SUCCESS';
export const CHAPTER_COUNT_SUCCESS = 'CHAPTER_COUNT_SUCCESS';
export const CHANGE_BOOK = 'CHANGE_BOOK';
export const CHANGE_CHAPTER = 'CHANGE_CHAPTER';
export const CHANGE_VERSE = 'CHANGE_VERSE';
export const VERSE_TEXT_SUCCESS = 'VERSE_TEXT_SUCCESS';
export const COMM_TEXT_SUCCESS = 'COMM_TEXT_SUCCESS';
export const COMM_ABS_TEXT_SUCCESS = 'COMM_ABS_TEXT_SUCCESS';
export const RESET_TEXT = 'RESET_TEXT';


const firebaseConfig = {
  apiKey: "AIzaSyA82zcPEsxhD4dAnJ6c_QotN8n7hqrPsEw",
  authDomain: "yv-api-5737d.firebaseapp.com",
  databaseURL: "https://yv-api-5737d.firebaseio.com",
  projectId: "yv-api-5737d",
  storageBucket: "yv-api-5737d.appspot.com",
  messagingSenderId: "1067244693931",
  appId: "1:1067244693931:web:dfe0203bc9fe77e646caee",
  measurementId: "G-55VK3ZZZ20"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export function changeChapter(book, chapter) {
  return dispatch => {
    dispatch({ type: FETCH_VERSE_COUNT });
    dispatch({ type: CHANGE_CHAPTER, payload: chapter });

    const location = `${book}/${chapter}`;

    // Fetch verse count (if needed)
    const countRef = ref(database, `yv/count/${location}`);
    get(countRef).then(snapshot => {
      dispatch({ type: VERSE_COUNT_SUCCESS, payload: snapshot.val() });
    });

    // Fetch verse text
    const coreRef = ref(database, `yv/mk_core/${location}`);
    get(coreRef).then(snapshot => {
      dispatch({ type: VERSE_TEXT_SUCCESS, payload: snapshot.val() });
    });
  };
}

export function changeVerse(book, chapter, verse) {
  return dispatch => {
    dispatch({ type: CHANGE_VERSE, payload: verse });

    const location = `${book}/${chapter}`;

    // Fetch verse text
    const coreRef = ref(database, `yv/mk_core/${location}`);
    get(coreRef).then(snapshot => {
      dispatch({ type: VERSE_TEXT_SUCCESS, payload: snapshot.val() });
    });

    // Fetch commentary text
    const vlmRef = ref(database, `yv/vlm/${location}`);
    get(vlmRef).then(snapshot => {
      dispatch({ type: COMM_TEXT_SUCCESS, payload: snapshot.val() });
    });

    // Fetch abstract commentary text
    const absRef = ref(database, `yv/abs/${location}`);
    get(absRef).then(snapshot => {
      dispatch({ type: COMM_ABS_TEXT_SUCCESS, payload: snapshot.val() });
    });
  };
}

export function changeBook(book) {
  const mapping = {
    1: 32,
    2: 20,
    3: 140,
    4: 44,
    5: 94,
    6: 253
  };

  return dispatch => {
    dispatch({ type: CHANGE_BOOK, payload: book });
    dispatch({
      type: CHAPTER_COUNT_SUCCESS,
      payload: mapping[book]
    });
  };
}
