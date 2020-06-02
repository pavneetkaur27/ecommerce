const mongoose             = require('mongoose');

const model_name = 'order';

const schema = mongoose.Schema({

    // id of product from product model
    product_id : {
        type : mongoose.Schema.Types.ObjectId,
        required : true
    },
      
    // account id from account model
    aid : {
        type : mongoose.Schema.Types.ObjectId,
        required : true
    },

    // status of order placed
    status : {
        type    : Number,
        default : 1,
        required : true
    },
 
    //number of quantities ordered for product_id
    quantity : {
        type    : Number,
        default : 1,
        required : true
    },

    //total amount paid by user
    total_amount_paid : {
        type : Number,
        required : true
    },
    // active attribute for soft deletion 
    act : {
        type : Boolean,
        default : true
    },

    },{ 
    timestamps : true
  }
);


schema.statics = {
  STATUS : {
        INITIATED     : 1,
        MATCHED       : 2,
        HIRED         : 3,
        REVIEW        : 4,
        PAID          : 5,
        CANCELLED     : 4
  }
};


module.exports = mongoose.model(model_name,schema,model_name);