import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';

import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';


const useStyles = makeStyles({
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

const CommDisplay = ({ displayComm }) => {
  const classes = useStyles();
  return (
    <Card className={classes.root} style={{backgroundColor: '#ffc10733'}}>
      <CardContent>
        <Typography className={classes.title} color="textPrimary" gutterBottom>
          {displayComm}
        </Typography>
        <Typography variant="h5" component="h2">
        </Typography>
      </CardContent>
      <CardActions>
        <Typography variant="h6" color="textSecondary">-Vihari Lala Mitra</Typography>
      </CardActions>
    </Card>
  );
}

function mapStateToProps({ verseReducer: { displayComm } }) {
    return { displayComm };
  }
  
export default connect(mapStateToProps)(CommDisplay);