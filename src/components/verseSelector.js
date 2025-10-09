import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col } from 'reactstrap';
import { compose } from "redux";
import { changeChapter, changeBook, changeVerse } from '../actions/verseSelectorActions';
import { withRouter } from "react-router-dom";
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';

class VerseSelector extends Component {
  componentDidMount() {
    const { pathname } = this.props.location;
    if (pathname === '/') {
      this.props.history.push(`/1/1`);
      return;
    }
    const parts = pathname.split('/');
    const book = Number(parts[1]) || 1;
    const chapter = Number(parts[2]) || 1;
    this.props.changeBook(book);
    this.props.changeChapter(book, chapter);
  }

  selectBook(e) {
    const book = e.target.value
    this.props.changeBook(book);
    this.props.changeChapter(book, 1)
    this.props.changeVerse(book, 1, 1)
    this.props.history.push(`/${book}/1`)
  }

  selectChapter(e) {
    const chapter = e.target.value
    const book = this.props.verseReducer.currentBook
    this.props.changeChapter(book, chapter)
    this.props.changeVerse(book, chapter, 1)
    this.props.history.push(`/${book}/${chapter}`)
  }

  selectVerse(e) {
    const book = this.props.verseReducer.currentBook;
    const chapter = this.props.verseReducer.currentChapter;
    const verse = e.target.value
    this.props.changeVerse(book, chapter, verse)
    this.props.history.push(`/${book}/${chapter}/${verse}`)
  }

  render() {
    const maxChapters = this.props.verseReducer.maxChapters;
    const maxVerses = this.props.verseReducer.maxVerses;
  let { currentChapter, currentBook } = this.props.verseReducer;
  currentChapter = Number(currentChapter);
    return (
      <div>
      <Row style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Col xs={12} md={6} className="selector-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <InputLabel id="book-label" style={{ marginRight: '12px', fontWeight: 'bold', fontSize: '18px', fontFamily: 'Shobhika-Regular, Shobhika, serif' }}>प्रकरणम्</InputLabel>
            <button
              style={{ marginRight: '8px', background: '#f0f0f0', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', cursor: 'pointer' }}
              disabled={Number(currentBook) <= 1}
              onClick={() => {
                if (Number(currentBook) > 1) {
                  this.selectBook({ target: { value: Number(currentBook) - 1 } });
                }
              }}
              aria-label="Previous Book"
            >
              &#8592;
            </button>
            <div className="centered-select">
              <Select
                native
                labelId="book-label"
                id="book-select"
                value={currentBook}
                onChange={this.selectBook.bind(this)}
                style={{ minWidth: '60px' }}
              >
              {[1, 2, 3, 4, 5, 6].map(i => (
                <option value={i} key={i}>{i}</option>
              ))}
              </Select>
            </div>
            <button
              style={{ marginLeft: '8px', background: '#f0f0f0', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', cursor: 'pointer' }}
              disabled={Number(currentBook) >= 6}
              onClick={() => {
                if (Number(currentBook) < 6) {
                  this.selectBook({ target: { value: Number(currentBook) + 1 } });
                }
              }}
              aria-label="Next Book"
            >
              &#8594;
            </button>
          </div>
        </Col>
        <Col xs={12} md={6} className="selector-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <InputLabel id="chapter-label" style={{ marginRight: '12px', fontWeight: 'bold', fontSize: '18px', fontFamily: 'Shobhika-Regular, Shobhika, serif' }}>सर्गः</InputLabel>
            <button
              style={{ marginRight: '8px', background: '#f0f0f0', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', cursor: 'pointer' }}
              disabled={currentChapter <= 1}
              onClick={() => {
                if (currentChapter > 1) {
                  this.selectChapter({ target: { value: currentChapter - 1 } });
                }
              }}
              aria-label="Previous Chapter"
            >
              &#8592;
            </button>
            <div className="centered-select">
              <Select
                native
                labelId="chapter-label"
                id="chapter-select"
                value={currentChapter}
                onChange={this.selectChapter.bind(this)}
                style={{ minWidth: '60px' }}
              >
              {maxChapters > 0 && [...Array(maxChapters).keys()].map(i => {
                i += 1;
                return <option value={i} key={i}>{i}</option>;
              })}
              </Select>
            </div>
            <button
              style={{ marginLeft: '8px', background: '#f0f0f0', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', cursor: 'pointer' }}
              disabled={currentChapter >= maxChapters}
              onClick={() => {
                if (currentChapter < maxChapters) {
                  this.selectChapter({ target: { value: currentChapter + 1 } });
                }
              }}
              aria-label="Next Chapter"
            >
              &#8594;
            </button>
          </div>
        </Col>
      </Row>
      {/* Font size controls */}
      <Row style={{ justifyContent: 'center', marginTop: 12 }}>
        <Col xs={12} style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            style={{
              marginRight: 8,
              padding: '6px 14px',
              cursor: 'pointer',
              background: '#ffffff',
              border: '1px solid #d0d7de',
              borderRadius: 20,
              boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
              fontFamily: 'Shobhika-Regular, Shobhika, serif',
              fontSize: 16
            }}
            onClick={() => {
              const root = document.documentElement;
              const computed = getComputedStyle(root).getPropertyValue('--verse-font-size') || '20px';
              const current = parseInt(computed, 10) || 20;
              root.style.setProperty('--verse-font-size', `${Math.max(12, current - 2)}px`);
            }}
          >
            अ-
          </button>
          <button
            style={{
              padding: '6px 14px',
              cursor: 'pointer',
              background: '#ffffff',
              border: '1px solid #d0d7de',
              borderRadius: 20,
              boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
              fontFamily: 'Shobhika-Regular, Shobhika, serif',
              fontSize: 16
            }}
            onClick={() => {
              const root = document.documentElement;
              const computed = getComputedStyle(root).getPropertyValue('--verse-font-size') || '20px';
              const current = parseInt(computed, 10) || 20;
              root.style.setProperty('--verse-font-size', `${Math.min(40, current + 2)}px`);
            }}
          >
            अ+
          </button>
        </Col>
      </Row>
      </div>
    )
  }
}

function mapStateToProps({ verseReducer }) {
  return { verseReducer };
}

export default compose(
  withRouter,
  connect(mapStateToProps, {
    changeChapter,
    changeBook,
    changeVerse
}))(VerseSelector);
