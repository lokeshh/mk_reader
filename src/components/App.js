import React, { Component } from 'react';
import './App.css';
import OmLogo from './OM.png';
import {
  Container, Row, Col
} from 'reactstrap';
import VerseSelector from './verseSelector';
import VerseDisplay from './verseDisplay';
import CommDisplay from './commDisplay';
import CommAbsDisplay from './commAbsDisplay';

export default class App extends Component {

  

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={OmLogo} height='50px' width='50px' alt='OM'/>
        </header>
        <Container>
          <br />
          <Row>
            <Col>
              <h3>मोक्षोपायः</h3>
            </Col>
          </Row>

          <br />

          <VerseSelector />

          <hr />

          <VerseDisplay />

          {/* <br />

          <CommAbsDisplay />

          <br />

          <CommDisplay /> */}
        </Container>

      </div>
    );
  }
}
