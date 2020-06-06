import axios from "axios";
import {API_ENDPOINT} from '../constants';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

export function logoutOrgUser(){
  cookies.remove("ou_at",{path : "/"});
  return function(dispatch){
    window.location.replace('/');
  }
}


const startLoader = (dispatch,a)=>{
    return dispatch({ type: "START_LOADER" });
}
  
const stopLoader = (dispatch)=>{
    return dispatch({ type: "STOP_LOADER" });
}


export const hideAlert =() => dispatch =>{
  dispatch({
    type: "HIDE_NOTIFY", payload: {}
  });
}

const handleResponseErrorCase1 = (data)=>{
  console.log(data);
  if(data && data.code){
    if(data.code == 401 || data.code == 498){
      cookies.remove("ou_at",{path : "/"});
      return window.location.replace('/');
    }else if(data.code == 404 && data.err ==  "Organisation not found"){
      return window.location.replace('/cmpprofile');
    }
  }
}


export const orgSignUp = (eml , pass, cpass) => dispatch => {
  
  var requestObj = {
    method: 'POST',
    data: {
      eml  : eml,
      pwd  : pass,
      cpwd : cpass 
    },
    url: API_ENDPOINT + '/user/sign_up',
  };
  startLoader(dispatch,1);
  
  axios(requestObj).then((response) => {
    stopLoader(dispatch);
    if (response && response.data.success && response.data) {
      if(response.data.data.a_tkn){
        cookies.set('ou_at', response.data.data.a_tkn,{ path: '/' });
      }
      return window.location.replace('/');
    } else {
      return dispatch({
        type: "SHOW_NOTIFY", payload: {
          type: 'error',
          message: "Something went wrong",
          dispatch: dispatch
        }
      });
    }
  })
  .catch((err) => {
    var err_msg = "Something went wrong";
    if (err.response && err.response.statusText) {
      err_msg = err.response.statusText;
    }
    if(err.response && err.response.data && err.response.data.err){
      err_msg = err.response.data.err;
    }
    if(err && err.response && err.response.data){
      handleResponseErrorCase1(err.response.data || {})
    }
    stopLoader(dispatch);
    return dispatch({
      type: "SHOW_NOTIFY", payload: {
        type: 'error',
        message: err_msg,
        dispatch: dispatch
      }
    });
  })
}


export const orgLogin = (eml , pass) => dispatch => {
  
  var requestObj = {
    method: 'POST',
    data: {
      eml   : eml,
      pwd  : pass
    },
    url: API_ENDPOINT + '/user/login',
   
  };
  startLoader(dispatch,1);
  
  return axios(requestObj).then((response) => {
    console.log(response);
    stopLoader(dispatch);
    if (response && response.data.success && response.data) {
      if(response.data.data.a_tkn){
        cookies.set('ou_at', response.data.data.a_tkn,{ path: '/' }); 
      }
      return window.location.replace('/');
     } else {
      return dispatch({
        type: "SHOW_NOTIFY", payload: {
          type: 'error',
          message: "Something went wrong",
          dispatch: dispatch
        }
      });
    }
  })
  .catch((err) => {
    stopLoader(dispatch);
    var err_msg = "Something went wrong";
    if (err.response && err.response.statusText) {
      err_msg = err.response.statusText;
    }
    if(err.response && err.response.data && err.response.data.err){
      err_msg = err.response.data.err;
    }
    if(err && err.response && err.response.data){
      handleResponseErrorCase1(err.response.data || {})
    }
    return dispatch({
      type: "SHOW_NOTIFY", payload: {
        type: 'error',
        message: err_msg,
        dispatch: dispatch
      }
    });
  })
}

//fetching products from backend server
export const fetchProducts = (data) => dispatch => {
  
  var requestObj = {
    method: 'POST',
    data: {
      limit   : 6,
      pageno  : data.current_page
    },
    url: API_ENDPOINT + '/user/ft_products',
  };
  axios(requestObj).then((response) => {
    // stopLoader(dispatch);
    if (response && response.data.success && response.data) {
      console.log("hlo");
      if(data.current_page == 1){
        dispatch({
            type: "AVAILABLE_PRODUCTS",
            payload: {
                products : response.data.data.products,
                total_products : response.data.data.total_products
            }
        });
      }else{
        console.log("tes")
          dispatch({
              type: "UPDATE_AVAILABLE_PRODUCTS",
              payload: {
                  products : response.data.data.products,
                  total_products : response.data.data.total_products
              }
          });
      }
    } else {
      return dispatch({
        type: "SHOW_NOTIFY", payload: {
          type: 'error',
          message: "Something went wrong",
          dispatch: dispatch
        }
      });
    }
  })
  .catch((err) => {
    // stopLoader(dispatch);
    var err_msg = "Something went wrong";
    if (err.response && err.response.statusText) {
      err_msg = err.response.statusText;
    }
    if(err.response && err.response.data && err.response.data.err){
      err_msg = err.response.data.err;
    }
    if(err && err.response && err.response.data){
      handleResponseErrorCase1(err.response.data || {})
    }
      return dispatch({
      type: "SHOW_NOTIFY", payload: {
        type: 'error',
        message: err_msg,
        dispatch: dispatch
      }
    });
  })
}

//placing order
export const placeOrder = (data) => dispatch => {
  
  var requestObj = {
    method: 'POST',
    data: {
      prd_id  : data.product_id,
      quant   : data.quantity
    },
    url: API_ENDPOINT + '/user/ad_order',
    headers: {
      'x-access-token': cookies.get('ou_at')
    }
  };
  axios(requestObj).then((response) => {
    // stopLoader(dispatch);
    if (response && response.data.success && response.data) {
        dispatch({
            type: "SHOW_NOTIFY",
            payload: {
              type: 'success',
              message: "Added to Cart",
              dispatch: dispatch
            }
        });
    } else {
      return dispatch({
        type: "SHOW_NOTIFY", payload: {
          type: 'error',
          message: "Something went wrong",
          dispatch: dispatch
        }
      });
    }
  })
  .catch((err) => {
    // stopLoader(dispatch);
    var err_msg = "Something went wrong";
    if (err.response && err.response.statusText) {
      err_msg = err.response.statusText;
    }
    if(err.response && err.response.data && err.response.data.err){
      err_msg = err.response.data.err;
    }
    if(err && err.response && err.response.data){
      handleResponseErrorCase1(err.response.data || {})
    }
      return dispatch({
      type: "SHOW_NOTIFY", payload: {
        type: 'error',
        message: err_msg,
        dispatch: dispatch
      }
    });
  })
}