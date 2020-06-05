import { connect } from 'react-redux';
import React, { Component } from 'react';
import { withRouter } from 'react-router';
import close_img from '../../assests/close-btn.svg';
import success from '../../assests/success.svg';
import fail from '../../assests/fail.svg';
import {hideAlert} from '../../actions/orderAction';

class Alerts extends Component {
    constructor(props) {
      super(props);
      this.state = {
      }
    }

    componentDidUpdate = (prevprops)=>{
      if(prevprops.storedata!==this.props.storedata){
        if(this.props.type === 'error' ||
          (this.props.storedata && this.props.storedata.type === 'error')
        ){
          this.setState({heading : 'Error',img : fail});
        } else if(this.props.type === 'success' ||
          (this.props.storedata && this.props.storedata.type === 'success')
        ){
          this.setState({heading : 'Success',img : success});
        } else if(this.props.type === 'info' ||
          (this.props.storedata && this.props.storedata.type === 'info')
        ){
          this.setState({heading : 'Info',img : success});
        } else if(this.props.type === 'warning' ||
          (this.props.storedata && this.props.storedata.type === 'warning')
        ){
          this.setState({heading : 'Warning',img : fail});
        } else {
          this.setState({heading : 'Error',img : fail});
        }
      }
    }

    render() {
        return (
            <div className={ (this.props.show || (this.props.storedata && this.props.storedata.show)) ? "error-popover" : "error-popover hide-error-popover"}>
                <div className="ep-icon-container">
                    <img alt=""  className={"icon"} src={this.state.img}/>
                </div>
                <div className="ep-content">
                    <p className="ep-heading">{ this.state.heading }</p>
                    <p className="ep-msg">{this.props.message || (this.props.storedata &&  this.props.storedata.message)}</p>
                </div>
                <div className="close">
                    <img alt="close"  onClick={this.props.hideAlert} className="close-img" src={close_img}/>
                </div>
            </div>
        )
    }
}


function mapStateToProps(state) {
    return {
        storedata: state.ordReducer.data
    }
}

const mapDispatchToProps = {hideAlert}

export default withRouter(connect(mapStateToProps, mapDispatchToProps,)(Alerts));