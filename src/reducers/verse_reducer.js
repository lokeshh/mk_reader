import { FETCH_VERSE_COUNT, VERSE_COUNT_SUCCESS, CHAPTER_COUNT_SUCCESS,
  CHANGE_BOOK, CHANGE_CHAPTER, CHANGE_VERSE, VERSE_TEXT_SUCCESS, RESET_TEXT,
  COMM_TEXT_SUCCESS, COMM_ABS_TEXT_SUCCESS
} from '../actions/verseSelectorActions'

const DEFAULT_VERSE = [
  'सन्तोषः परमो लाभः सत्सङ्गः परमा गतिः।',
  'विचारः परमं ज्ञानं शमो हि परमं सुखम्॥'
]

const INITIAL_STATE = {
  maxChapters: 0,
  maxVerses: 0,
  currentBook: 1,
  currentChapter: 1,
  currentVerse: 0,
  loadingVerseCount: false,
  displayVerse: DEFAULT_VERSE,
  displayComm: 'ॐ',
  displayCommAbs: ['ॐ']
}

export default function(state = INITIAL_STATE, action) {
  switch(action.type) {
    case FETCH_VERSE_COUNT:
      return {...state, loadingVerseCount: true}
    case VERSE_COUNT_SUCCESS:
      return {...state, loadingVerseCount: false, maxVerses: action.payload.val()}
    case CHAPTER_COUNT_SUCCESS:
      return {...state, maxChapters: action.payload}
    case CHANGE_BOOK:
      return {...state, currentBook: action.payload}
    case CHANGE_CHAPTER:
      return {...state, currentChapter: action.payload}
    case CHANGE_VERSE:
      return {...state, currentVerse: action.payload}
    case VERSE_TEXT_SUCCESS:
      if (action.payload.val() != null) {
        return {...state, displayVerse: action.payload.val()}
      }
      return state
    case COMM_TEXT_SUCCESS:
      if (action.payload.val() != null) {
        return {...state, displayComm: action.payload.val()}
      }
      return state
    case COMM_ABS_TEXT_SUCCESS:
      if (action.payload.val() != null) {
        return {...state, displayCommAbs: action.payload.val()}
      }
      return state
    case RESET_TEXT:
      return {...state, displayVerse: DEFAULT_VERSE}
    default:
      return state
  }
}
