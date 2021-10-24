import React, { Component } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';

import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';


const classes = makeStyles({
    root: {
      minWidth: 275,
    },
    bullet: {
      display: 'inline-block',
      margin: '0 2px',
      transform: 'scale(0.8)',
    },
    title: {
      fontSize: 14,
    },
    pos: {
      marginBottom: 12,
    },
  });


class CommAbsDisplay extends Component {

    render() {
        return (
            <Card className={classes.root} style={{backgroundColor: '#ffc10733'}}>
            <CardContent>
              <Typography className={classes.title} component={'div'} color="textPrimary" gutterBottom>
              {
                this.props.displayCommAbs.map((line, index) => {
                  return <div key={index}>{ line }<br /></div>
                })
              }
              </Typography>
              <Typography variant="h5" component="h2">
              </Typography>
            </CardContent>
            <CardActions>
              <Typography varient="h6" color="textSecondary">-Ananda Bodhendra Saraswati</Typography>
            </CardActions>

          </Card>
      
      
        )
    }
    
}

function mapStateToProps({ verseReducer: { displayCommAbs } }) {
    return { displayCommAbs };
  }
  
  export default connect(mapStateToProps)(CommAbsDisplay);