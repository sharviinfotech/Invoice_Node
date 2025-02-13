module.exports = (() => {
    const express = require('express');
    const router = express.Router();
    const userHandler = require('../handlers/userHandler');

    // Define routes
    router.post('/user/create', userHandler.userCreate);
    router.get('/user/getDetails', userHandler.getDetails);
    router.put('/user/updateUserDetails', userHandler.updateUser);
    router.post('/submit/approval', userHandler.submitApproval);
    router.get('/get/approvalList', userHandler.listOfApproval);

    router.post('/invoice/createNewInvoice',userHandler.invoiceCreation)
    router.get('/invoice/countryList', userHandler.countryList);
    router.get('/invoice/stateList', userHandler.stateList);
    router.put('/updateInvoiceByReferenceNo/:referenceNo', userHandler.updateInvoice);
    router.get('/invoice/getAllInvoices',userHandler.getTotalInvoice);
    router.post('/invoice/invoiceTemplate',userHandler.invoiceLayout);
    router.get('/invoice/getInvoiceLayout',userHandler.getInvoiceLayout)
    router.post('/invoice/userNewCreation',userHandler.userCreationNew);
    router.put('/invoice/updateExitUser/:UniqueId',userHandler.updateUserCreation);
    router.get('/invoice/getAllUserList',userHandler.getAllUser);
    router.post('/invoice/authenticationLogin',userHandler.submitLogin);
    router.post('/invoice/invoiceApprovedOrRejected',userHandler.approveOrReject);
    router.post('/invoice/combinationOfDateAndStatus',userHandler.InvoiceBasedOnDates);
    router.post('/invoice/SaveCustomerCreation',userHandler.customerCreation);
    router.put('/invoice/updateExitCustomer/:customerUniqueId',userHandler.customerUpdate);
    router.get('/invoice/getAllCustomerList',userHandler.getAllCustomer);
    router.post('/invoice/forgotPassword',userHandler.forgot);
    router.get('/invoice/approveorrejectMail', userHandler.approveOrRejectMail);
    router.get('/invoice/getAllCharges',userHandler.chargesList);

    
    console.log('enter route')
    // router.post('/', userHandler.createUser);

    return router;
})();
