const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const connectDB = require('./config/db');
const { fetchInvoiceList, } = require('./fetchInvoiceFolder/totalInvoiceData'); // Fixed typo here\
const{sendInvoiceDataToEmail} =require('./fetchInvoiceFolder/sendInvoiceToMail')

// Initialize App
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Load Routes
app.use('/api', routes);

// Database Connection
connectDB();

// Server Initialization
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

async function postInvoiceListInMail() {
    try {
        const invoiceData = await fetchInvoiceList();  // Call the function here
        console.log('postInMailResponse', invoiceData);
        console.log("postResponse server", JSON.stringify(invoiceData, null, 2));
    
         const email ="sunilkumar@sharviinfotech.com"
        await sendInvoiceDataToEmail(email,JSON.stringify(invoiceData, null, 2))

    } catch (error) {
        console.error('Error fetching invoice data:', error.message);
    }
}

postInvoiceListInMail();
