import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, CardHeader, CardBody, Card } from 'reactstrap';
import { compose } from "redux";
import { withRouter } from "react-router-dom";
import { changeVerse } from "../actions/verseSelectorActions";


class VerseDisplay extends Component {

  // prevVerse() {
  //   if (this.props.currentVerse !== 1) {
  //     const currentVerse = parseInt(this.props.currentVerse) - 1
  //     this.props.history.push(`/${this.props.currentBook}/${this.props.currentChapter}/${currentVerse}`)
  //     this.props.changeVerse(this.props.currentBook, this.props.currentChapter, currentVerse);
  //   }
  // }

  // nextVerse() {
  //   if (this.props.currentVerse !== this.props.maxVerses) {
  //     const currentVerse = parseInt(this.props.currentVerse) + 1
  //     this.props.history.push(`/${this.props.currentBook}/${this.props.currentChapter}/${currentVerse}`)
  //     this.props.changeVerse(this.props.currentBook, this.props.currentChapter, currentVerse);
  //   }
  // }
  
  render() {
    return (
      <Row>
        <Col>
          <Card className="card bg-light mb-3">
            <CardHeader>
              {/* <button type="button" className="btn btn-secondary float-left btn-sm" onClick={() => this.prevVerse()}>Previous</button>
              <button type="button" className="btn btn-secondary float-right btn-sm" onClick={() => this.nextVerse()}>Next</button> */}
              <h4>मूलश्लोकाः</h4>
            </CardHeader>
            <CardBody>
            <h5 className="display-linebreak">
                {
                  this.props.displayVerse.map((verse, index) => {

                    // verse = Object.values(verse).push("\n")
                    var new_verse = ["\n"]
                    new_verse = new_verse.concat(verse)
                    var last_line = new_verse.pop()
                    last_line = last_line + toDevanagari(index.toString()) + "॥"
                    new_verse = new_verse.concat([last_line])
                    return Object.values(new_verse).map(line => {
                      return <div>{ line }<br /></div>
                    })
                  })
                }
              </h5>
            </CardBody>
          </Card>
        </Col>
      </Row>
    );
  }
}

function mapStateToProps({ verseReducer: { displayVerse, currentBook, currentChapter, currentVerse, maxVerses } }) {
  return { displayVerse, currentBook, currentChapter, currentVerse, maxVerses };
}

export default compose(
  withRouter,
  connect(mapStateToProps, {
    changeVerse
  })
)(VerseDisplay);

function toDevanagari(num) {
  const englishToDevanagari = {
    "0": "०",
    "1": "१",
    "2": "२",
    "3": "३",
    "4": "४",
    "5": "५",
    "6": "६",
    "7": "७",
    "8": "८",
    "9": "९",
  };

  return String(num).split("").map(char =>
    englishToDevanagari[char] || char // keep non-digits as is
  ).join("");
}
