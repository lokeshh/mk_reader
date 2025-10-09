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
    if (this.props.location.pathname === '/') {
      this.props.history.push(`/1/1`)
      window.location.reload()
    }
    var x = this.props.location.pathname.split('/');

    this.props.changeBook(x[1])
    this.props.changeChapter(x[1], x[2])
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
      <Row style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Col xs={12} md={6} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <InputLabel id="book-label" style={{ marginBottom: '8px', fontWeight: 'bold', fontSize: '18px', fontFamily: 'Shobhika-Regular, Shobhika, serif' }}>प्रकरणम्</InputLabel>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
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
            <Select
              native
              labelId="book-label"
              id="book-select"
              value={currentBook}
              onChange={this.selectBook.bind(this)}
              style={{ minWidth: '80px' }}
            >
              {[1, 2, 3, 4, 5, 6].map(i => (
                <option value={i} key={i}>{i}</option>
              ))}
            </Select>
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
        <Col xs={12} md={6} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <InputLabel id="chapter-label" style={{ marginBottom: '8px', fontWeight: 'bold', fontSize: '18px', fontFamily: 'Shobhika-Regular, Shobhika, serif' }}>सर्गः</InputLabel>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
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
            <Select
              native
              labelId="chapter-label"
              id="chapter-select"
              value={currentChapter}
              onChange={this.selectChapter.bind(this)}
              style={{ minWidth: '80px' }}
            >
              {maxChapters > 0 && [...Array(maxChapters).keys()].map(i => {
                i += 1;
                return <option value={i} key={i}>{i}</option>;
              })}
            </Select>
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
