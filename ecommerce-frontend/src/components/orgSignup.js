import React, { Component } from 'react'
import {connect} from "react-redux";
import Card from '@material-ui/core/Card';
import { withRouter } from 'react-router';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { orgSignUp } from '../actions/orderAction';


class OrgSignUp extends Component {
    constructor(props){
        super(props);
        this.state = {
            email       : '',
            password    : '',
            apassword   : '',
            cpassword   : '',
            acpassword  : '',
            isEmailError : false,
            isPasswordError : false,
            isCPasswordError : false
        }
    }

    passwordHandleChange = (e) =>{
        this.setState({
            isPasswordError : false,
            password : e.target.value,
        })
    }

    confirmPasswordHandleChange = (e) =>{
        this.setState({
            isCPasswordError : false,
            cpassword : e.target.value,
        })
    }

    emailHandleChange = (e) =>{
        console.log(e.target.value);
        this.setState({
            isEmailError : false,
            email : e.target.value,
        })
    }

    completeSignUp = () => {
        
        if(!this.state.email && this.state.password.length < 8 && this.state.cpassword.length < 8){
            this.setState({
                isEmailError : true,
                isPasswordError : true,
                isCPasswordError : true
            })
        }else if(!this.state.email && this.state.password.length < 8){
            this.setState({
                isEmailError : true,
                isPasswordError : true,
            })
        }else if(!this.state.email && this.state.cpassword.length < 8){
            this.setState({
                isEmailError : true,
                isCPasswordError : true
            })
        }else if(this.state.password.length < 8 && this.state.cpassword.length < 8){
            this.setState({
                isPasswordError : true,
                isCPasswordError : true
            })
        }else if(!this.state.email ){
            this.setState({
                isEmailError : true,
            })
        }else if(this.state.password.length < 8 ){
            this.setState({
                isPasswordError : true,
            })
        }else if(this.state.cpassword.length < 8 ){
            this.setState({
                isCPasswordError : true
            })
        }else{
            this.props.orgSignUp(this.state.email,this.state.password,this.state.cpassword);
        }
    }

    orgLoginPage = () =>{
        this.props.history.push({ 
            pathname :"/login"
        });
    }

    render() {

        return (
            <div >
                <Typography className="org-signup-form-heading" >
                   Sign Up
                </Typography>
                <div className="row center-all no-margin no-padding">
                    <Card className="col-xl-4 col-lg-6  col-sm-6 org-signup-card-container">
                        <CardContent>
                           
                            <div className="org-signupcard-inner-contanier">
                                {/* <Typography className="org-signup-detail-title org-signup-detail-title-margin"   >
                                    Name
                                </Typography> */}
                                {/* <input type="tetx" required className={this.state.isEmailError ? "org-signup-input-field org-err-input" : "org-signup-input-field"} placeholder="Ex : john@zomato.com" value={this.state.email} onChange={this.emailHandleChange} /> */}
                                <Typography className="org-signup-detail-title org-signup-detail-title-margin"   >
                                    Email
                                </Typography>
                                <input type="email" required className={this.state.isEmailError ? "org-signup-input-field org-err-input" : "org-signup-input-field"} placeholder="Ex : john@zomato.com" value={this.state.email} onChange={this.emailHandleChange} />
                                {this.state.isEmailError ? <p className="org-error-msg">Please enter your email address</p> : null }
                                <Typography className={this.state.isEmailError ? "org-signup-detail-title org-signup-detail-title-err-margin": "org-signup-detail-title org-signup-detail-title-margin" }>
                                    Password
                                </Typography>
                                <input type="password" required className = {this.state.isPasswordError ? "org-signup-input-field org-err-input" : "org-signup-input-field"} placeholder="Enter Password" value={this.state.password} onChange={this.passwordHandleChange} />
                                {this.state.isPasswordError ? <p className="org-error-msg">Please enter a password at least 8 characters long</p> : null }
                                <Typography className={this.state.isPasswordError ? "org-signup-detail-title org-signup-detail-title-err-margin": "org-signup-detail-title org-signup-detail-title-margin" }   >
                                    Confirm Password
                                </Typography>
                                <input type="password" required className = {this.state.isCPasswordError ? "org-signup-input-field org-err-input" : "org-signup-input-field"} placeholder="Enter Password" value={this.state.cpassword} onChange={this.confirmPasswordHandleChange} />
                                {this.state.isCPasswordError ? <p className="org-error-msg">Please enter a password at least 8 characters long</p> : null }
                                <Button variant="contained" className={this.state.isCPasswordError ? "org-signup-btn org-signup-detail-title-err-margin": "org-signup-btn org-signup-detail-title-margin" } onClick={this.completeSignUp}>
                                    Sign Up
                                </Button>
                                <div>
                                    <p className="org-signup-footer">Already have an account? <span className="org-hover-text" style={{color:'#255CA8',fontWeight:600,cursor:'pointer'}} onClick={this.orgLoginPage}>Log In</span></p>
                                </div>
                            </div>       
                        </CardContent>
                    </Card>
                </div>
            </div>  
        );

    }
}

const mapStateToProps = state => {
  return {
  }
}

const mapDispatchToProps = {orgSignUp};

export default withRouter(connect( mapStateToProps, mapDispatchToProps)(OrgSignUp));