import React from 'react'
import Typography from '@material-ui/core/Typography';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import '../../css/index.css';

export default function Header() {
  
  return (
      <div >
        <AppBar position="static" className="shared-header" >
          <Toolbar variant="dense" className="center-all" style={{height:56}}>
            <Typography className="org-header-title" gutterBottom>
                Fashion Store
            </Typography>
          </Toolbar>
        </AppBar>  
      
      </div>
    );
}