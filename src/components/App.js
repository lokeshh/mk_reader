import React, { Component } from 'react';
import './App.css';
import OmLogo from './OM.png';
import {
  Container, Row, Col
} from 'reactstrap';




// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;

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
              <h3>Mokshopaya</h3>
            </Col>
          </Row>

          {/* <br />

          <VerseSelector />

          <hr />

          <VerseDisplay /> */}

        </Container>

      </div>
    );
  }
}
