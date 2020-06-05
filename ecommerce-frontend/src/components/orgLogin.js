import React, { Component } from 'react'
import {connect} from "react-redux";
import Card from '@material-ui/core/Card';
import { withRouter } from 'react-router';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { orgLogin } from '../actions/orderAction';



class OrgLogin extends Component {
    constructor(props){
        super(props);
        this.state = {
            email       : '',
            password    : '',
            apassword   : '',
            isEmailError : false,
            isPasswordError : false,
        }
    }

    passwordHandleChange = (e) =>{
        // console.log(e.target.value);
        // var pass = this.state.password.concat("*");
        // var act_pass = this.state.apassword.concat(e.target.value[e.target.value.length-1]);
        // this.setState({
        //     apassword : act_pass,
        //     password  : pass
        // })
        this.setState({
            isPasswordError : false,
            password : e.target.value,
        })
    }

    

    emailHandleChange = (e) =>{
        this.setState({
            isEmailError : false,
            email : e.target.value,
        })
    }

    completeLogIn = () => {
       
        if(!this.state.email && !this.state.password.length ){
            this.setState({
                isEmailError : true,
                isPasswordError : true
            })
        }else if(!this.state.email ){
            this.setState({
                isEmailError : true,
            })
        }else if(!this.state.password ){
            this.setState({
                isPasswordError : true,
            })
        }else{
            this.props.orgLogin(this.state.email,this.state.password)
                .then(res =>{
                    // if(res !==  undefined && res.data && res.data.success ){
                    //     this.props.isOrgVerified()
                    //         .then(res =>{
                    //             if(res !==  undefined && res.data && res.data.success ){
                    //                 console.log(res);
                    //                 if(res.data.data.status === 1 && res.data.data.jobcount > 0){
                    //                     this.props.history.push({ 
                    //                         pathname : '/org/dashboard/jobs'
                    //                     });
                    //                 }
                    //                 if(res.data.data.status === 1 && res.data.data.jobcount == 0){
                    //                     this.props.history.push({ 
                    //                         pathname : constants.ORG_VERIFIED
                    //                     });
                    //                 }
                    //                 if(res.data.data.status === 2){
                    //                     this.props.history.push({ 
                    //                         pathname : constants.ORG_REJECTED
                    //                     });
                    //                 }
                    //                 if(res.data.data.status === 3){
                    //                     this.props.history.push({ 
                    //                         pathname : constants.ORG_VERIFY_COMPANY_PROFILE
                    //                     });
                    //                 }
                    //             }
                    //     })
                    // }
                })
        }
    }

    orgSignUpPage = () =>{
        this.props.history.push({ 
            pathname :"/signup"
        });
    }


    render() {

        return (
            <div >
                <Typography className="org-signup-form-heading" gutterBottom>
                   Login
                </Typography>
              
                <div className="row center-all no-margin no-padding">
                    <Card className="col-xl-4 col-lg-6  col-sm-6 org-login-card-container" >
                        <CardContent>
                            <div className="">
                                <Typography className="org-signup-detail-title"   gutterBottom>
                                    Email
                                </Typography>
                                <input type="email" required className={this.state.isEmailError ? "org-signup-input-field org-err-input" : "org-signup-input-field"} placeholder="Ex : john@zomato.com" value={this.state.email} onChange={this.emailHandleChange} />
                                {this.state.isEmailError ? <p className="org-error-msg">Please enter your email address</p> : null }
                                <Typography className={this.state.isEmailError ? "org-signup-detail-title org-signup-detail-title-err-margin": "org-signup-detail-title org-signup-detail-title-margin" } gutterBottom>
                                    Password
                                </Typography>
                                <input type="password" required className = {this.state.isPasswordError ? "org-signup-input-field org-err-input" : "org-signup-input-field"} placeholder="Enter Password" value={this.state.password} onChange={this.passwordHandleChange} />
                                {this.state.isPasswordError ? <p className="org-error-msg" style={{marginBottom:0}}>Please enter your password</p> : null }
                               
                                <Button variant="contained" className="org-signup-btn org-signup-detail-title-margin" onClick={this.completeLogIn}>
                                    Log In
                                </Button>
                                <div>
                                    <p className="org-signup-footer">Don’t have an account? <a className="org-hover-text" style={{color:'#255CA8',fontWeight:600,cursor:'pointer'}} onClick={this.orgSignUpPage}>Sign Up</a></p>
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


const mapDispatchToProps = {orgLogin};

export default withRouter(connect( mapStateToProps, mapDispatchToProps)(OrgLogin));