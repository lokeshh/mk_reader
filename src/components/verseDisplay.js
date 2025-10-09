import React from 'react';
import { connect } from 'react-redux';
import { Row, Col, CardHeader, CardBody, Card } from 'reactstrap';
import { compose } from "redux";
import { withRouter } from "react-router-dom";
import { changeVerse } from "../actions/verseSelectorActions";
import { toDevanagari } from "../utils/numerals";

const VerseDisplay = ({ displayVerse }) => {
  return (
    <Row>
      <Col>
        <Card className="card bg-light mb-3">
          <CardHeader>
            <h4>मूलश्लोकाः</h4>
          </CardHeader>
          <CardBody>
            <h5 className="display-linebreak">
              {displayVerse.map((verse, index) => {
                var new_verse = ["\n"]
                new_verse = new_verse.concat(verse)
                var last_line = new_verse.pop()
                last_line = last_line + toDevanagari(index.toString()) + "॥"
                new_verse = new_verse.concat([last_line])
                return Object.values(new_verse).map((line, lineIdx) => (
                  <div key={`${index}-${lineIdx}`}>{ line }<br /></div>
                ))
              })}
            </h5>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
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

