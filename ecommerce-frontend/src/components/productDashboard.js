import React, { Component } from 'react'
import {connect} from "react-redux";
import { withRouter } from 'react-router';
import Typography from '@material-ui/core/Typography';
import { fetchProducts,placeOrder } from '../actions/orderAction';
import Loader from './shared/Loader';
import Cookies from 'universal-cookie';
import bvalid from 'bvalid/lib/bvalid.es';
const cookies = new Cookies();

class OrgSignUp extends Component {
    constructor(props){
        super(props);
        this.state = {
            current_page : 1,
            quantarr     : [1,2,3,4,5,6,7,8,9,10],
            quantval     : 1
        }
    }

    componentDidMount(){
        this.props.fetchProducts({current_page : this.state.current_page});
    }

    showMoreRecords = () => {
        this.props.fetchProducts({current_page : this.state.current_page+1});
    }
  
    selectQuantity = (e) =>{
        console.log(e.target.value)
        this.setState({
            quantval : e.target.value
        })
    }

    placeOrder(product){
        var jtkn = cookies.get('ou_at');
        // // console.log(this.props.location.pathname);
        if(!jtkn ){
          this.props.history.push('/login');
        }else{
            var data = {
                product_id  : product._id ,
                quantity    : this.state.quantval
            }
            this.props.placeOrder(data);
        }
    }
      
    render() {

        if(this.props.ecomPanel.products){

            const showMoreButton = (
                <div>
                  <button onClick = {this.showMoreRecords}>Show More</button>
                </div>
            );

            return (
                <div style={{maxWidth: 1180,margin:'0px auto'}}>
                    <Typography className="org-signup-form-heading" style={{marginTop: 40}}>
                        Available Products 
                    </Typography>
                    <div style={{marginTop : 40}}>
                        {this.props.ecomPanel.total_products == 0 ? 
                            <div>
                                Empty Inventory
                            </div>
                            :
                            <div className="row  no-margin no-padding">
                                {this.props.ecomPanel.products.map(product => (
                                    <div className=" col-sm-4 " key={product._id}>
                                        <div className="product-card-container">
                                            <div style={{fontWeight: 600}}>{product.product_nm}</div>
                                            <div style={{marginTop: 10}} style={{fontSize: 14}}>{product.product_desc}</div>
                                            <div><b>Rs {product.offered_price} </b><span style={{textDecoration: 'line-through',fontSize:14, marginRight:20}}>Rs {product.actual_price} </span>{product.discount > 0  ? 'Discount offered '+ product.discount : null}</div>

                                            {/* Check whether stock available */}
                                            {(!product.is_product_avail || (product.stock_ordered == product.total_stock) || (product.total_stock == 0 ) ) ?           
                                                <div>
                                                    Out of Stock
                                                </div>
                                                :
                                                <div>
                                                    <div style={{marginTop: 20}}>Quantity 
                                                        <select style={{marginLeft: 10}} onChange={this.selectQuantity}>
                                                            {this.state.quantarr.map(value => (
                                                                product.one_time_order_quant >= value ?
                                                                <option value={value} key= {value}>{value}</option> : null
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div style={{marginTop: 20}}>
                                                        <button className="btn btn-primary" onClick={() => this.placeOrder(product)}>Place Order</button>
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                ))}
                                { (this.props.ecomPanel.products.length < this.props.ecomPanel.total_products) ? showMoreButton : null}
                           
                           </div>
                        }
                        
                    </div>
                </div>  
            );
        }else{
            return (
                <div>
                    <Loader />
                </div>
            );
        }
    }
}

const mapStateToProps = state => {
  return {
      ecomPanel : state.ordReducer
  }
}

const mapDispatchToProps = {fetchProducts,placeOrder};

export default withRouter(connect( mapStateToProps, mapDispatchToProps)(OrgSignUp));