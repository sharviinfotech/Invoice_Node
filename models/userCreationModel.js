const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    confPassword: {
        type: String,
        required: true,
    },
    contact: {
        type: Number,
        required: true,
    },
    plant: {
        type: Number,
        required: false,
    },
    Design: {
        type: String,
        required: false,
    },
    function: {
        type: String,
        required: false,
    },
    
});

const itemSchema = new mongoose.Schema({
    Description: {
        type: String,
        required: false,
    },
    Material: {
        type: String,
        required: true,
    },
    UOM: {
        type: String,
        required: true,
    },
    Quantity: {
        type: String,
        required: true,
    },
    PreRate: {
        type: String,
        required: false,
    },
    vender1Rate: {
        type: String,
        required: false,
    },
    vender1Amount: {
        type: String,
        required: false,
    },
    vender2Rate: {
        type: String,
        required: false,
    },
    vender2Amount: {
        type: String,
        required: false,
    },
});

const approvalSchema = new mongoose.Schema(
    {
        header: {
            project: {
                type: String,
                required: true,
            },
            function: {
                type: String,
                required: true,
            },
            date: {
                type: String,
                required: false,
            },
            companyName: {
                type: String,
                required: false,
            },
            vender1: {
                type: String,
                required: false,
            },
            vender2: {
                type: String,
                required: false,
            },
            WBSElement: {
                type: String,
                required: false,
            },
            subject: {
                type: String,
                required: false,
            },
        },
        Item: [itemSchema], // Array of items
        referenceNo: {
            type: Number,
            required: false,
            unique: true,
        },
        status:{type:String,required:false}
    },
    { timestamps: true } // Automatically adds createdAt and updatedAt timestamps
);
const counterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false,
        unique: true,
    },
    value: {
        type: Number,
        default: 100000,
    },
});
const invoiceProformaInvoiceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false,
        unique: true,
    },
 
    value: {
        type: Number,
        default: 800,
    },
    startWith: {
        type: String,
       required:true
    },
});

const invoiceTaxInvoiceCountSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false,
        unique: true,
    },
 
    value: {
        type: Number,
        default: 800,
    },
    startWith: {
        type: String,
       required:true
    },
});


const chargesSchema=new mongoose.Schema({
    description: {
        type: String,
        required: false,
    },
    units: {
        type: String,
        required: false,
    },
    rate: {
        type: String,
        required: false,
    },
    amount: {
        type: String,
        required: false,
    },
})
const taxSchema=new mongoose.Schema({
    description: {
        type: String,
        required: false,
    },
    percentage: {
        type: String,
        required: false,
    },
    amount: {
        type: String,
        required: false,
    },
})
// Invoice schema
const invoiceSchema = new mongoose.Schema({
  
    invoiceReferenceNo: {
        type: Number, // Ensure it's a number
        required: true,
        unique: true, // Ensures uniqueness
    },
    header:{
            
        invoiceHeader: {
            type: String,
            required: false,
        },
        invoiceImage: {
            type: String,
            required: false,
        },
      
        ProformaCustomerName: {
            type: String,
            required: true,
        },
        ProformaAddress: {
            type: String,
            required: true,
        },
        ProformaCity: {
            type: String,
            required: true,
        },
        ProformaState: {
            type: String,
            required: true,
        },
        ProformaPincode: {
            type: String,
            required: true,
        },
        ProformaGstNo: {
            type: String,
            required: true,
        },
    
        ProformaPanNO: {
            type: String,
            required: true,
        },
        ProformaInvoiceNumber: {
            type: String,
            required: false,
        },
        ProformaInvoiceDate: {
            type: Date,
            required: true,
        },
        ProformaPan: {
            type: String,
            required: true,
        },
        ProformaGstNumber: {
            type: String,
            required: true,
        },
        ProformaTypeOfAircraft: {
            type: String,
            required: true,
        },
        notes:{
            type: String,
            required: false,
        },    
        ProformaSeatingCapasity:{
            type: Number,
            required: true,
        },
        BookingDateOfJourny:{
            type: Date,
            required: true,
        },
        BookingSector:{
            type:String,
            required: true,
        },
        BookingBillingFlyingTime:{
            type:String,
            required: true,
        }
    },
    chargesList: [chargesSchema],
    taxList: [taxSchema],
    subtotal:{
        type:Number,
        required:true
    },
    grandTotal :{
        type:Number,
        required:true
    },
    amountInWords:{
        type:String,
        required:false
    },
    status:{
        type:String,
        required:false
    },
    reason:{
        type:String,
        equired:false
    },
    invoiceApprovedOrRejectedByUser:{
        type:String,
        equired:false
    },
    invoiceUniqueNumber: {
        type: String,
        required: true,
        unique: true,
    },
    invoiceApprovedOrRejectedDateAndTime:{
        type:String,
        required:false
    },
    loggedInUser:{
        type:String,
        required:false
    },
    proformaCardHeaderId:{
        type:String,
        required:true
    },
    proformaCardHeaderName:{
        type:String,
        required:true
    }

    // bankDetails:{
    //     accountName:{
    //         type:String,
    //         required: true,
    //     },
    //     bank:{
    //         type:String,
    //         required: true,
    //     },
    //     accountNumber:{
    //         type:String,
    //         required: true,
    //     },
    //     branch:{
    //         type:String,
    //         required: true,
    //     },
    //     ifscCode:{
    //         type:String,
    //         required: true,
    //     }

    // }

    
});




const countryListSchema = new mongoose.Schema({
    code:{
        type:String,
        required:false
    },
    name:{
        type:String,
        required:false
    },
})
const stateListSchema = new mongoose.Schema({
  
    code:{
        type:String,
        required:false
    },
    stateName:{
        type:String,
        required:false
    },
});

// Invoice schema
const invoiceLayoutSchema = new mongoose.Schema({

    invoiceLayoutId:{
      type:Number,
      required:true
    },

    header:{
            
        invoiceHeader: {
            type: String,
            required: false,
        },
        invoiceImage: {
            type: String,
            required: false,
        },
      
        ProformaCustomerName: {
            type: String,
            required: false,
        },
        ProformaAddress: {
            type: String,
            required: false,
        },
        ProformaCity: {
            type: String,
            required: false,
        },
        ProformaSate: {
            type: String,
            required: false,
        },
        ProformaPincode: {
            type: String,
            required: false,
        },
        ProformaGstNo: {
            type: String,
            required: false,
        },
    
        ProformaPanNO: {
            type: String,
            required: false,
        },
        ProformaInvoiceNumber: {
            type: String,
            required: false,
        },
        ProformaInvoiceDate: {
            type: String,
            required: false,
        },
        ProformaPan: {
            type: String,
            required: false,
        },
        ProformaGstNumber: {
            type: String,
            required: false,
        },
        ProformaTypeOfAircraft: {
            type: String,
            required: false,
        },
        notes:{
            type: String,
            required: false,
        },    
        ProformaSeatingCapasity:{
            type: Number,
            required: false,
        },
        BookingDateOfJourny:{
            type:String,
            required: false,
        },
        BookingSector:{
            type:String,
            required: false,
        },
        BookingBillingFlyingTime:{
            type:String,
            required: false,
        }
    },
    chargesList: [chargesSchema],
    taxList: [taxSchema],
    subtotal:{
        type:Number,
        required:false
    },
    grandTotal :{
        type:Number,
        required:false
    },
    // bankDetails:{
    //     accountName:{
    //         type:String,
    //         required: true,
    //     },
    //     bank:{
    //         type:String,
    //         required: true,
    //     },
    //     accountNumber:{
    //         type:String,
    //         required: true,
    //     },
    //     branch:{
    //         type:String,
    //         required: true,
    //     },
    //     ifscCode:{
    //         type:String,
    //         required: true,
    //     }

    // }

    status:{
        type:String,
        required:false
    }

    
});

// user creation 
const userCreationSchema = new mongoose.Schema({      
    userUniqueId:{
        type: Number,
        required: true,
        unique:true
    } ,
        userName: {
            type: String,
            required: true,
        },
        userFirstName: {
            type: String,
            required: true,
        },
        userLastName: {
            type: String,
            required: false,
        },
        userEmail: {
            type: String,
            required: true,
        },
        userContact: {
            type: String,
            required: true,
        },
        userPassword: {
            type: String,
            required: true,
        },
        userConfirmPassword: {
            type: String,
            required: true,
        },
        userStatus: {
            type: Boolean,
            required: true,
        },
        userActivity: {
            type: String,
            required: true,
        },
        
        
    
    
});


const customerCreationSchema = new mongoose.Schema({

    customerUniqueId:{
        type: Number,
        required: true,
        unique:true
    } ,
    customerName:{
        type:String,
        required:true
    },
    customerAddress:{
        type:String,
        required:true
    },
    customerCity:{
        type:String,
        required:true
    },
    customerState:{
        type:String,
        required:true
    },
    customerPincode:{
        type:String,
        required:true
    },
    customerGstNo:{
        type:String,
        required:true
    },
    customerPanNo:{
        type:String,
        required:true
    },
    customerEmail:{
        type:String,
        required:true
    },
    customerContact:{
        type:Number,
        required:true
    },
    customerAlernativecontact:{
        type:Number,
        required:false
    },
    customerCreditPeriod:{
        type:String,
        required:true
    }

})
const customerCountSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false,
        unique: true,
    },
 
    value: {
        type: Number,
        default: 800,
    },
});

const Counter = mongoose.model('Counter', counterSchema);
const User = mongoose.model('User', userSchema);
const Approval = mongoose.model('Approval', approvalSchema);
const invoice = mongoose.model('NewInvoice',invoiceSchema)
const countries = mongoose.model('counters',countryListSchema)
const statee = mongoose.model('statee', stateListSchema);
const layout = mongoose.model('InvoiceLayout',invoiceLayoutSchema);
const invoiceproformaCount= mongoose.model('invoiceProformaCount',invoiceProformaInvoiceSchema)
const invoicetaxCount= mongoose.model('invoiceTaxCount',invoiceTaxInvoiceCountSchema)
const userCreation =mongoose.model('userCreation',userCreationSchema);
const customerCreation =mongoose.model('customerCreation',customerCreationSchema);
const customerCount= mongoose.model('customerCount',customerCountSchema)

// Export as an object
module.exports = { User, Approval ,Counter,invoice,countries,statee,layout,invoiceproformaCount,invoicetaxCount,userCreation,customerCreation,customerCount};
