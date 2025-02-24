const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const connectDB = require('./config/db');
const { fetchInvoiceList, } = require('./fetchInvoiceFolder/totalInvoiceData'); // Fixed typo here\
const{sendInvoiceDataToEmail} =require('./fetchInvoiceFolder/sendInvoiceToMail')
const userHandler = require('./handlers/userHandler');
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
        // const invoiceData = await fetchInvoiceList();  // Get the current invoice data
        const invoiceData = await userHandler.getTotalInvoice(req,res);
        // Check if the invoice data has changed (simple comparison for illustration)
        // if (JSON.stringify(invoiceData) !== JSON.stringify(lastInvoiceData)) {
            console.log('Invoice data has changed. Sending email...');
            const email = "sunilkumar@sharviinfotech.com";
            await sendInvoiceDataToEmail(email, JSON.stringify(invoiceData, null, 2));
            
            // Update the last known invoice data
            lastInvoiceData = invoiceData;
        // } else {
        //     console.log('No changes in invoice data. No email sent.');
        // }
    } catch (error) {
        console.error('Error fetching invoice data:', error.message);
    }
}

postInvoiceListInMail();
