const axios = require('axios');
const { User, Approval, Counter, invoice, countries, statee, layout, invoiceproformaCount,
    invoicetaxCount,uniqueId, userCreation, customerCreation, customerCount,chargesCreation,chargesCount } = require('../models/userCreationModel');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const moment = require('moment');
const nodemailer = require('nodemailer');

module.exports = (() => {
    return {
        createUser: async (req, res) => {
            try {
                const { userName, firstName, lastName, email, password, confPassword, contact, plant, Design, function: userFunction } = req.body;

                // Ensure password and confPassword match
                if (password !== confPassword) {
                    return res.status(400).json({ error: "Passwords do not match" });
                }

                const newUser = new User({ // Use the correct model
                    userName,
                    firstName,
                    lastName,
                    email,
                    password,
                    confPassword,
                    contact,
                    plant,
                    Design,
                    function: userFunction,
                });

                // Save the user to the database
                const savedUser = await newUser.save();

                res.status(200).json({ responseData: { message: "User created successfully", data: savedUser } });
            } catch (err) {
                console.error("Error saving user:", err);
                res.status(500).json({ error: "Failed to create user" });
            }
        },
        getUserDetails: async (req, res) => {
            try {
                const { userId } = req.query; // Optionally pass `userId` as a query parameter
                let users;
                users = await User.find();
                res.status(200).json({ responseData: { message: "Users fetched successfully", data: users } });
            } catch (err) {
                console.error("Error fetching users:", err);
                res.status(500).json({ error: "Failed to fetch users" });
            }
        },
        updateUser: async (req, res) => {
            try {
                const { userId } = req.params; // User ID from route parameter
                const updateData = req.body; // Data to update


                const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
                    new: true,
                    runValidators: true,
                });

                if (!updatedUser) {
                    return res.status(404).json({ error: "User not found" });
                }

                res.status(200).json({ responseData: { message: "User updated successfully", data: updatedUser } });
            } catch (err) {
                console.error("Error updating user:", err);
                res.status(500).json({ error: "Failed to update user" });
            }
        },

        submitApproval: async (req, res) => {
            try {
                const { header, Item } = req.body;

                if (!header || !Item || !Array.isArray(Item)) {
                    return res.status(400).json({ error: "Invalid request data" });
                }

                const mappedHeader = {
                    project: header.project,
                    function: header.function,
                    date: header.date,
                    companyName: header.companyName,
                    vender1: header.vender1,
                    vender2: header.vender2,
                    WBSElement: header.WBSElement,
                    subject: header.subject,
                };

                let referenceNo;

                // Check and initialize the counter if not already created
                const counter = await Counter.findOneAndUpdate(
                    { name: "approvalReference" },
                    { $inc: { value: 1 } },
                    { new: true, upsert: true, setDefaultsOnInsert: true } // Ensures default is applied when creating
                );

                referenceNo = counter.value;
                console.log("Item", Item)
                const newApproval = new Approval({
                    header: mappedHeader,
                    Item,
                    referenceNo,
                    status: 'In Process'
                });

                const savedApproval = await newApproval.save();

                res.status(200).json({
                    referenceNo,
                    message: "Approval submitted successfully",
                    data: savedApproval,
                });
            } catch (err) {
                console.error("Error submitting approval:", err);
                res.status(500).json({ error: "Failed to submit approval" });
            }
        },


        approvalList: async (req, res) => {
            try {

                const approvals = await Approval.find();

                const formattedData = approvals.map(approval => ({
                    header: {
                        ...approval.header,
                        Item: approval.Item,
                        referenceNo: approval.referenceNo,
                        status: approval.status
                    },
                }));

                res.status(200).json({
                    responseData: {
                        message: "ApprovalList fetched successfully",
                        data: formattedData,
                    },
                });
            } catch (err) {
                console.error("Error fetching approval list:", err);
                res.status(500).json({ error: "Failed to fetch approval list" });
            }
        },
        submitInvoice: async (req, res) => {
            console.log('requestbody', req.body)
            try {
                // const { invoiceHeader,fromName,fromEmail,fromAddress,fromMobileNumber, toName,toEmail,toAddress,toMobileNumber,toGstinNo,
                //     toPan,invoiceNumber,invoiceDate,panNumber,gstinNo,typeOfAircraft,notes } = req.body

                const { header, chargesList, taxList, subtotal, grandTotal, amountInWords, reason, invoiceApprovedOrRejectedByUser,
                    invoiceApprovedOrRejectedDateAndTime, loggedInUser, status,proformaCardHeaderId,proformaCardHeaderName

                } = req.body
                console.info("req.body", req.body)
                // below is the proforma invoice
               var  invoiceUniqueNumber;
               var  invoiceDateObj;
               var  bookingDate;
               var  invoiceReferenceNo;
               let originalUniqueId; // To store the numerical part

                if (proformaCardHeaderId === "PQ") {
                
                // Check and initialize the counter if not already created
                const counter = await invoiceproformaCount.findOneAndUpdate(
                    { name: "invoiceUniqueNumber" },  // Find condition
                    {
                        $inc: { value: 1 },
                        $setOnInsert: { startWith: "RGPAPL/PQ-" }  // Ensures it's set only if a new document is inserted
                    },
                    { new: true, upsert: true, setDefaultsOnInsert: true }  // Ensure default values are applied
                );
                 
                if (header.ProformaInvoiceDate) {
                    invoiceDateObj = moment(header.ProformaInvoiceDate, "DD-MM-YYYY").toDate();
                    console.log("Converted Invoice Date:", invoiceDateObj);
                } else {
                    throw new Error("ProformaInvoiceDate is required.");
                }
            
                if (header.BookingDateOfJourny) {
                    bookingDate = moment(header.BookingDateOfJourny, "DD-MM-YYYY").toDate();
                    console.log("Converted bookingDate :", bookingDate);
                } else {
                    throw new Error("ProformaInvoiceDate is required.");
                }
                console.log("counter", counter)
                invoiceReferenceNo = counter.value;
                start = counter.startWith;
                console.log("invoiceReferenceNo", invoiceReferenceNo)
                const parts = header.ProformaInvoiceDate.split('-'); // Split the date into parts
                console.log("parts", parts)
                const mm_yyyy = moment(invoiceDateObj).format("MM-YYYY");
                console.log("mm_yyyy", mm_yyyy);
                invoiceUniqueNumber = start + invoiceReferenceNo + '/' + mm_yyyy
                console.log("start", start, invoiceUniqueNumber)
                } 
                // below is the TAX invoice
                else if (proformaCardHeaderId === "TAX") {
                    
                // Check and initialize the counter if not already created
                const counter = await invoicetaxCount.findOneAndUpdate(
                    { name: "invoiceUniqueNumber" },  // Find condition
                    {
                        $inc: { value: 1 },
                        $setOnInsert: { startWith: "RGPAPL/TAX-" }  // Ensures it's set only if a new document is inserted
                    },
                    { new: true, upsert: true, setDefaultsOnInsert: true }  // Ensure default values are applied
                );
                
                if (header.ProformaInvoiceDate) {
                    invoiceDateObj = moment(header.ProformaInvoiceDate, "DD-MM-YYYY").toDate();
                    console.log("Converted Invoice Date:", invoiceDateObj);
                } else {
                    throw new Error("ProformaInvoiceDate is required.");
                }
                
                if (header.BookingDateOfJourny) {
                    bookingDate = moment(header.BookingDateOfJourny, "DD-MM-YYYY").toDate();
                    console.log("Converted bookingDate :", bookingDate);
                } else {
                    throw new Error("ProformaInvoiceDate is required.");
                }
                console.log("counter", counter)
                invoiceReferenceNo = counter.value;
                start = counter.startWith;
                console.log("invoiceReferenceNo", invoiceReferenceNo)
                const parts = header.ProformaInvoiceDate.split('-'); // Split the date into parts
                console.log("parts", parts)
                const mm_yyyy = moment(invoiceDateObj).format("MM-YYYY");
                console.log("mm_yyyy", mm_yyyy);
                 invoiceUniqueNumber = start + invoiceReferenceNo + '/' + mm_yyyy
                console.log("start", start, invoiceUniqueNumber)
                } 

                // Get and increment the SINGLE counter
        const originalId = await uniqueId.findOneAndUpdate(
            { name: "originalUniqueId" }, // Always find the same counter document
            { $inc: { value: 1 } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
                originalUniqueId = originalId.value; // Store the number
                console.log("invoiceUniqueNumber end",invoiceUniqueNumber)
                
                const headerObj = {
                    invoiceHeader: header.invoiceHeader,
                    invoiceImage: header.invoiceImage,
                    ProformaCustomerName: header.ProformaCustomerName,
                    ProformaAddress: header.ProformaAddress,
                    ProformaCity: header.ProformaCity,
                    ProformaState: header.ProformaState,
                    ProformaPincode: header.ProformaPincode,
                    ProformaGstNo: header.ProformaGstNo,
                    ProformaPanNO: header.ProformaPanNO,
                    ProformaInvoiceNumber: header.ProformaInvoiceNumber,
                    ProformaInvoiceDate: invoiceDateObj,
                    ProformaPan: header.ProformaPan,
                    ProformaGstNumber: header.ProformaGstNumber,
                    ProformaTypeOfAircraft: header.ProformaTypeOfAircraft,
                    ProformaSeatingCapasity: header.ProformaSeatingCapasity,
                    notes: header.notes,
                    BookingDateOfJourny: bookingDate,
                    BookingSector: header.BookingSector,
                    BookingBillingFlyingTime: header.BookingBillingFlyingTime,

                }
                // const bankObj={
                //     accountName:bankDetails.accountName,
                //     bank:bankDetails.bank,
                //     accountNumber:bankDetails.accountNumber,
                //     branch:bankDetails.branch,
                //     ifscCode:bankDetails.ifscCode,
                // }
                // let status = "Pending"
                const newInvoice = new invoice(
                    {
                        originalUniqueId: originalUniqueId,
                        header: headerObj,
                        chargesList,
                        taxList,
                        invoiceReferenceNo,
                        subtotal,
                        grandTotal,
                        amountInWords,
                        // bankDetails:bankObj
                        status,
                        reason,
                        invoiceApprovedOrRejectedByUser,
                        invoiceUniqueNumber,
                        invoiceApprovedOrRejectedDateAndTime,
                        loggedInUser,
                        proformaCardHeaderId,
                        proformaCardHeaderName
                    }

                );
                console.log("newInvoice", newInvoice)
                const savedInvoice = await newInvoice.save();

                res.status(200).json({
                    invoiceReferenceNo,
                    message: "Generated",
                    data: savedInvoice,
                    status: 200
                });
            } catch (err) {
                console.error("Error submitting approval:", err);
                res.status(500).json({
                    error: "Failed to Submit Invoice Creation",
                    status: 500
                });
            }
        },



        countryList: async (req, res) => {
            console.log("countries enter into")
            try {
                const countyList = await countries.find();
                console.log("countries", countyList)
                res.status(200).json({
                    responseData: {
                        message: "Countries fetched successfully",
                        data: countyList,
                        status: 200
                    },
                });
            } catch (err) {
                console.error("Error fetching approval list:", err);
                res.status(500).json({
                    error: "Failed to fetch approval list",
                    status: 500

                });
            }
        },
        stateList: async (req, res) => {
            console.log("state enter into");
            try {
                const stateList = await statee.find();
                console.log("state", stateList);
                res.status(200).json({
                    responseData: {
                        message: "State fetched successfully",
                        data: stateList,
                        status: 200
                    },
                });
            } catch (err) {
                console.error("Error fetching state list:", err);
                res.status(500).json({
                    error: "Failed to fetch state list",
                    status: 500
                });
            }
        },




        updateInvoice: async (req, res) => {
            console.log("updateInvoice called");
            try {
                const { referenceNo } = req.params;
                let updateData = req.body;
                console.log("Updating Invoice:", referenceNo, updateData);

                // Ensure the updateData.header exists
                if (updateData.header) {
                    if (updateData.header.ProformaInvoiceDate) {
                        const parsedDate = moment(updateData.header.ProformaInvoiceDate, "DD-MM-YYYY", true);
                        if (parsedDate.isValid()) {
                            updateData.header.ProformaInvoiceDate = parsedDate.toISOString(); // Convert to ISO format
                        } else {
                            return res.status(400).json({
                                message: "Invalid ProformaInvoiceDate format. Use 'DD-MM-YYYY'.",
                                status: 400
                            });
                        }
                    }

                    if (updateData.header.BookingDateOfJourny) {
                        const parsedDate = moment(updateData.header.BookingDateOfJourny, "DD-MM-YYYY", true);
                        if (parsedDate.isValid()) {
                            updateData.header.BookingDateOfJourny = parsedDate.toISOString(); // Convert to ISO format
                        } else {
                            return res.status(400).json({
                                message: "Invalid BookingDateOfJourny format. Use 'DD-MM-YYYY'.",
                                status: 400
                            });
                        }
                    }
                }

                const updatedInvoice = await invoice.findOneAndUpdate(
                    { invoiceReferenceNo: referenceNo }, // Find invoice by reference number
                    { $set: updateData }, // Apply updates
                    { new: true, runValidators: true }
                );

                if (!updatedInvoice) {
                    return res.status(400).json({
                        message: 'Invoice not found',
                        status: 400
                    });
                }

                res.status(200).json({
                    message: 'Invoice updated successfully',
                    updatedInvoice,
                    status: 200
                });

            } catch (error) {
                console.error("Error updating invoice:", error);
                res.status(500).json({
                    message: "Failed to update invoice",
                    error: error.message,
                    status: 500
                });
            }
        },





        getTotalInvoice: async (req, res) => {
            try {
                const invoices = await invoice.find();
                console.log('invoices', invoices)
                if (!invoices || invoices.length === 0) {
                    return res.status(200).json({
                        message: "No Data Available",
                        data: [],
                        status: 200
                    });
                }

                // Format the date fields
                const formattedInvoices = invoices.map(inv => ({
                    ...inv._doc,
                    header: {
                        ...inv.header,
                        ProformaInvoiceDate: moment(inv.header.ProformaInvoiceDate).format("DD-MM-YYYY"),
                        BookingDateOfJourny: moment(inv.header.BookingDateOfJourny).format("DD-MM-YYYY")
                    }
                }));

                return res.status(200).json({
                    message: "Invoices Fetched Successfully",
                    data: formattedInvoices,
                    status: 200
                });

            } catch (error) {
                console.error("Error fetching invoices:", error);
                return res.status(500).json({
                    message: "Failed to fetch invoices",
                    error: error.message,
                    status: 500
                });
            }
        },


        invoiceLayoutSubmit: async (req, res) => {
            console.log('request body', req.body);
            try {
                const { invoiceLayoutId, header, chargesList, taxList, subtotal, grandTotal, status } = req.body;
                console.info("req.body", req.body);

                const headerObj = {
                    invoiceHeader: header.invoiceHeader,
                    invoiceImage: header.invoiceImage,
                    ProformaCustomerName: header.ProformaCustomerName,
                    ProformaAddress: header.ProformaAddress,
                    ProformaCity: header.ProformaCity,
                    ProformaState: header.ProformaState,
                    ProformaPincode: header.ProformaPincode,
                    ProformaGstNo: header.ProformaGstNo,
                    ProformaPanNO: header.ProformaPanNO,
                    ProformaInvoiceNumber: header.ProformaInvoiceNumber,
                    ProformaInvoiceDate: header.ProformaInvoiceDate,
                    ProformaPan: header.ProformaPan,
                    ProformaGstNumber: header.ProformaGstNumber,
                    ProformaTypeOfAircraft: header.ProformaTypeOfAircraft,
                    ProformaSeatingCapasity: header.ProformaSeatingCapasity,
                    notes: header.notes,
                    BookingDateOfJourny: header.BookingDateOfJourny,
                    BookingSector: header.BookingSector,
                    BookingBillingFlyingTime: header.BookingBillingFlyingTime,
                };

                // const bankObj = {
                //     accountName: bankDetails.accountName,
                //     bank: bankDetails.bank,
                //     accountNumber: bankDetails.accountNumber,
                //     branch: bankDetails.branch,
                //     ifscCode: bankDetails.ifscCode,
                // };

                // Delete the existing record to ensure only one record exists
                await layout.deleteMany({});

                // Save the latest record
                const newLayout = new layout({
                    invoiceLayoutId,
                    header: headerObj,
                    chargesList,
                    taxList,
                    subtotal,
                    grandTotal,
                    status
                    // bankDetails: bankObj
                });

                const savedLayout = await newLayout.save();

                res.status(200).json({
                    message: "Invoice Layout Saved Successfully",
                    data: savedLayout,
                    status: 200
                });

            } catch (err) {
                console.error("Error submitting Layout:", err);
                res.status(500).json({
                    error: "Failed to Submit Invoice Layout",
                    status: 500
                });
            }
        },
        getAllInvoiceLayout: async (req, res) => {

            try {
                const invoiceLayoutData = await layout.find();

                if (invoiceLayoutData.length === 0) {
                    return res.status(404).json({
                        message: "No Invoices Found",
                        status: 404
                    })
                }

                return res.json({ message: "Invoice Layouts Fetched Successfully", invoiceLayoutData })

            } catch (error) {
                console.log("error invoice", error)

                res.json({ error: error.message })
            }
        },

        // userCreationSave:async(req,res)=>{
        //     console.log("saveNewUserCreation",req,res)
        //     try{

        //     const {userName,userFirstName,userLastName,userEmail, userContact,userPassword, userConfirmPassword,userStatus,userActivity} = req.body;
        //     let userUniqueId;
        //     // Check and initialize the counter if not already created
        //     const counter = await invoiceCount.findOneAndUpdate(
        //         { name: "userUniqueId" },  // Find condition
        //         { 
        //             $inc: { value: 1 }, 
        //         },  
        //         { new: true, upsert: true, setDefaultsOnInsert: true }  // Ensure default values are applied
        //     );
        //     console.log("counter",counter)
        //     userUniqueId = counter.value;
        //          const userPayload = new userCreation({
        //             userName,
        //             userFirstName,
        //             userLastName,
        //             userEmail,
        //             userContact,
        //             userPassword,
        //             userConfirmPassword,
        //             userStatus,
        //             userActivity,
        //             userUniqueId

        //          });

        //          const saveNewUser = await userPayload.save()
        //          console.log('saveNewUser',saveNewUser)
        //          let obj ={
        //             userName:saveNewUser.userName,
        //             userStatus:saveNewUser.userStatus,
        //             userActivity:saveNewUser.userActivity,
        //             userUniqueId:userUniqueId
        //          }
        //          console.log('obj',obj)
        //          res.status(200).json({
        //             message:"User Created Succesfully",
        //             data:obj,
        //             status:200,

        //          })


        //     }catch(error){
        //      res.json({
        //         message:"Failed To Save the User",
        //         status:500
        //      })
        //     }
        // },
        getAllUserLists: async (req, res) => {
            try {
                const usersList = await userCreation.find()
                console.log("usersList", usersList)
                if (usersList.length === 0) {
                    res.json({
                        message: "No Data Available",
                        status: 200
                    })
                }
                res.json({
                    message: "User Data Fetched Successfully",
                    data: usersList,
                    status: 200
                })

            } catch (error) {

                res.json({
                    error: error.message
                })
            }
        },

        //     updateUserCreation:async(req,res)=>{
        //      console.log("updateUserCreation req",req,"res",res)
        //      try{
        //         const {UniqueId}=req.params;
        //         const updateUserData = req.body;
        //         console.log("UniqueId",UniqueId,"updateUserData",updateUserData);
        //         const updateUserObj = await userCreation.findOneAndUpdate(
        //             {userUniqueId:UniqueId},
        //             {$set:updateUserData},
        //             {new:true,runValidators:true}
        //         )

        //         if(!updateUserObj){
        //           return res.status(400).json({
        //             message:"User Not Found",
        //             status:400
        //           })
        //         }
        //         res.status(200).json({
        //             message:"User Updated successfully",updateUserObj,
        //             status:200
        //         })

        //      }catch(error){
        //         console.log("updateUserCreation error",error)
        //         res.status(500).json({
        //             error:error.message,
        //             status:500
        //         })
        //      }

        //     },
        //    userLogin :async(req, res) => {

        //         try {
        //             const { userName, userPassword } = req.body;

        //             // Find user by userName
        //             const user = await userCreation.findOne({ userName });

        //             if (!user) {
        //                 return res.status(404).json({
        //                     message: "User Not Found",
        //                     status: 404,
        //                     isValid: false
        //                 });
        //             }

        //             // Compare password securely
        //             console.log('userPassword',userPassword,"user.userPassword",user.userPassword)
        //             const isMatch = await bcrypt.compare(userPassword, user.userPassword);
        //             console.log('isMatch',isMatch)
        //             if (!isMatch) {
        //                 return res.status(400).json({
        //                     message: "Invalid credentials",
        //                     status: 400,
        //                     isValid: false
        //                 });
        //             }

        //             // Generate JWT Token
        //             const token = jwt.sign(
        //                 { id: user._id, userName: user.userName },
        //                 "your_jwt_secret",
        //                 { expiresIn: "1h" }
        //             );

        //             return res.status(200).json({
        //                 message: "Login successful",
        //                 status: 200,
        //                 isValid: true,
        //                 token // Include token in response
        //             });

        //         } catch (error) {
        //             return res.status(500).json({
        //                 message: "Server error",
        //                 status: 500,
        //                 isValid: false,
        //                 error: error.message
        //             });
        //         }
        //     }




        // new code start
        // userCreationSave: async (req, res) => {
        //     try {
        //         console.log("req.body",req.body)
        //         const { userName, userFirstName, userLastName, userEmail, userContact, userPassword, userConfirmPassword, userStatus, userActivity } = req.body;
        //         console.log("userPassword",userPassword,"userConfirmPassword",userConfirmPassword)
        //         if (userPassword !== userConfirmPassword) {
        //             return res.status(400).json({ message: "Passwords do not match", status: 400 });
        //         }

        //         const existingUser = await userCreation.findOne({ userEmail });
        //         if (existingUser) {
        //             return res.status(400).json({ message: "User with this email already exists", status: 400 });
        //         }

        //         const counter = await invoiceCount.findOneAndUpdate(
        //             { name: "userUniqueId" },
        //             { $inc: { value: 1 } },
        //             { new: true, upsert: true, setDefaultsOnInsert: true }
        //         );
        //         const userUniqueId = counter.value;
        //         console.log("userUniqueId",userUniqueId)
        //         const hashedPassword = await bcrypt.hash(userPassword, 10);
        //          console.log("hashedPassword",hashedPassword)
        //         const userPayload = new userCreation({
        //             userName,
        //             userFirstName,
        //             userLastName,
        //             userEmail,
        //             userContact,
        //             userPassword: hashedPassword,
        //             userConfirmPassword:hashedPassword,
        //             userStatus,
        //             userActivity,
        //             userUniqueId
        //         });

        //         const saveNewUser = await userPayload.save();
        //         res.status(201).json({
        //             message: "User Created Successfully",
        //             data: {
        //                 userName: saveNewUser.userName,
        //                 userStatus: saveNewUser.userStatus,
        //                 userActivity: saveNewUser.userActivity,
        //                 userUniqueId: saveNewUser.userUniqueId
        //             },
        //             status: 201
        //         });
        //     } catch (error) {
        //         res.status(500).json({ message: "Failed to save the user", status: 500, error: error.message });
        //     }
        // },

        // updateUserCreation: async (req, res) => {
        //     try {
        //         const { UniqueId } = req.params;
        //         const updateUserData = req.body;
        //         if (updateUserData.userPassword) {
        //             updateUserData.userPassword = await bcrypt.hash(updateUserData.userPassword, 10);
        //         }

        //         const updateUserObj = await userCreation.findOneAndUpdate(
        //             { userUniqueId: UniqueId },
        //             { $set: updateUserData },
        //             { new: true, runValidators: true }
        //         );

        //         if (!updateUserObj) {
        //             return res.status(404).json({ message: "User Not Found", status: 404 });
        //         }

        //         res.status(200).json({ message: "User Updated Successfully", data: updateUserObj, status: 200 });
        //     } catch (error) {
        //         res.status(500).json({ message: "Update Failed", status: 500, error: error.message });
        //     }
        // },
        userCreationSave: async (req, res) => {
            try {
                console.log("req.body", req.body);
                const { userName, userFirstName, userLastName, userEmail, userContact, userPassword, userConfirmPassword, userStatus, userActivity } = req.body;
                console.log("userPassword", userPassword, "userConfirmPassword", userConfirmPassword);

                if (userPassword !== userConfirmPassword) {
                    return res.status(400).json({ message: "Passwords do not match", status: 400 });
                }

                const existingUser = await userCreation.findOne({ userEmail });
                if (existingUser) {
                    return res.status(400).json({ message: "User with this email already exists", status: 400 });
                }

                const counter = await invoiceCount.findOneAndUpdate(
                    { name: "userUniqueId" },
                    { $inc: { value: 1 } },
                    { new: true, upsert: true, setDefaultsOnInsert: true }
                );
                const userUniqueId = counter.value;
                console.log("userUniqueId", userUniqueId);

                // Do NOT hash the password, save it as plain text
                const userPayload = new userCreation({
                    userName,
                    userFirstName,
                    userLastName,
                    userEmail,
                    userContact,
                    userPassword, // Store plain text password
                    userConfirmPassword, // Store plain text confirm password (you might not need to save this)
                    userStatus,
                    userActivity,
                    userUniqueId
                });

                const saveNewUser = await userPayload.save();
                res.status(201).json({
                    message: "User Created Successfully",
                    data: {
                        userName: saveNewUser.userName,
                        userStatus: saveNewUser.userStatus,
                        userActivity: saveNewUser.userActivity,
                        userUniqueId: saveNewUser.userUniqueId
                    },
                    status: 201
                });
            } catch (error) {
                res.status(500).json({ message: "Failed to save the user", status: 500, error: error.message });
            }
        },

        updateUserCreation: async (req, res) => {
            try {
                const { UniqueId } = req.params;
                const updateUserData = req.body;

                // If the password is being updated, keep it as plain text (no hashing)
                if (updateUserData.userPassword) {
                    updateUserData.userPassword = updateUserData.userPassword; // Don't hash the password
                }

                const updateUserObj = await userCreation.findOneAndUpdate(
                    { userUniqueId: UniqueId },
                    { $set: updateUserData },
                    { new: true, runValidators: true }
                );

                if (!updateUserObj) {
                    return res.status(404).json({ message: "User Not Found", status: 404 });
                }

                res.status(200).json({ message: "User Updated Successfully", data: updateUserObj, status: 200 });
            } catch (error) {
                res.status(500).json({ message: "Update Failed", status: 500, error: error.message });
            }
        },


        userLogin: async (req, res) => {
            try {
                const { userName, userPassword } = req.body; // Get username and password
                console.log("userName", userName, userPassword);

                const user = await userCreation.findOne({ userName }); // Find user by username
                console.log("user", user)
                if (!user) {
                    return res.status(404).json({
                        message: "User Not Found. Please enter a valid User",
                        status: 404,
                        isValid: false
                    });
                }
                let obj = {
                    userName: user.userName,
                    userFirstName: user.userFirstName,
                    userLastName: user.userLastName,
                    userEmail: user.userEmail,
                    userUniqueId: user.userUniqueId,
                    userStatus: user.userStatus,
                    isValid: user.userStatus,
                    userActivity: user.userActivity
                }
                console.log("password", userPassword, "user.userPassword", user.userPassword);
                if (user.userStatus == false) {
                    return res.status(200).json({
                        message: "User Not In Active",
                        status: 200,
                        data: obj,
                    });
                }
                // Compare plain password directly
                if (userPassword !== user.userPassword) {
                    return res.status(400).json({
                        message: "Invalid Credentials",
                        status: 400,
                        isValid: false
                    });
                }

                const token = jwt.sign(
                    { id: user._id, userName: user.userName }, // JWT payload with username
                    process.env.JWT_SECRET || "your_jwt_secret",
                    { expiresIn: "1h" }
                );



                res.status(200).json({
                    message: "Login Successful",
                    status: 200,
                    data: obj,
                    token
                });
            } catch (error) {
                res.status(500).json({ message: "Server Error", status: 500, isValid: false, error: error.message });
            }
        },
        approvedOrRejected: async (req, res) => {
            console.log("req.body", req.body)
            try {
                const { invoiceReferenceNo, status, reason, invoiceApprovedOrRejectedByUser, invoiceApprovedOrRejectedDateAndTime } = req.body; // Extract only required fields

                if (!invoiceReferenceNo || !status) {
                    return res.status(400).json({ message: "userUniqueId and status are required", status: 400 });
                }

                // Find and update the user with new status and remarkReason
                const updatedUser = await invoice.findOneAndUpdate(
                    { invoiceReferenceNo }, // Search by userUniqueId
                    {
                        $set: { status, reason, invoiceApprovedOrRejectedByUser, invoiceApprovedOrRejectedDateAndTime } // Update or add status & remarkReason
                    },
                    { new: true, runValidators: true } // Return updated document
                );

                if (!updatedUser) {
                    return res.status(404).json({ message: "User Not Found", status: 404 });
                }

                res.status(200).json({ message: "Status Updated Successfully", data: updatedUser, status: 200 });

            } catch (error) {
                res.status(500).json({ message: "Update Failed", status: 500, error: error.message });
            }
        },

        approvedOrRejectedMail: async (req, res) => {
            try {
                console.log("req.query",req.query)
                const { invoiceReferenceNo, status, reason, invoiceApprovedOrRejectedByUser, invoiceUniqueNumber } = req.query;

                if (!invoiceReferenceNo || !status) {
                    return res.send(`
                        <script>
                            var newWindow = window.open("", "_blank", "width=400,height=200");
                            newWindow.document.write('<p style="font-size:18px;">Invalid request. Missing required parameters.</p>');
                              setTimeout(() => {
            newWindow.close();
            window.close();
        }, 5000);
                        </script>
                    `);
                }
             // Get current date and time in "dd-mm-yyyy hh:mm am/pm" format
        let invoiceApprovedOrRejectedDateAndTime = new Date().toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        }).replace(",", "");

                // Find and update the invoice
                const updatedInvoice = await invoice.findOneAndUpdate(
                    { invoiceReferenceNo },
                    { $set: { status, reason, invoiceApprovedOrRejectedByUser,invoiceApprovedOrRejectedDateAndTime } },
                    { new: true, runValidators: true }
                );

                if (!updatedInvoice) {
                    return res.send(`
                        <script>
                            var newWindow = window.open("", "_blank", "width=400,height=200");
                            newWindow.document.write('<p style="font-size:18px;">Invoice not found.</p>');
                            setTimeout(() => newWindow.close();window.close(), 5000);
                        </script>
                    `);
                }

                res.send(`
                  <script>
        var newWindow = window.open("", "_blank", "width=400,height=200");
        newWindow.document.write('<p style="font-size:18px;">Invoice Number ${invoiceUniqueNumber} has been ${status} successfully!</p>');
        
        setTimeout(() => {
            newWindow.close();
            window.close();
        }, 5000);
    </script>
                `);

            } catch (error) {
                res.send(`
                    <script>
                        var newWindow = window.open("", "_blank", "width=400,height=200");
                        newWindow.document.write('<p style="font-size:18px; color:red;">Update Failed: ${error.message}</p>');
                          setTimeout(() => {
            newWindow.close();
            window.close();
        }, 3000);
                    </script>
                `);
            }
        },





        fetchInvoiceBasedOnDates: async (req, res) => {
            try {
                console.log('req.body', req.body);
                const { fromInvoiceDate, toInvoiceDate, status } = req.body;

                // Convert input dates to start and end of the day
                const fromDate = moment(fromInvoiceDate, "DD-MM-YYYY").startOf('day').toDate();
                const toDate = moment(toInvoiceDate, "DD-MM-YYYY").endOf('day').toDate();

                // Validate status
                const validStatuses = ["Approved", "Rejected", "Pending"];
                if (!validStatuses.includes(status)) {
                    return res.status(400).json({ message: "Invalid status value", status: 400 });
                }

                console.log("fromDate", fromDate, "toDate", toDate);

                // Fetch invoices with the correct date filtering
                const invoices = await invoice.find({
                    ProformaInvoiceDate: { $gte: fromDate, $lte: toDate },
                    status: status
                });

                console.log("invoices", invoices);

                if (invoices.length === 0) {
                    return res.status(200).json({ message: "No invoices found", status: 200 });
                }

                return res.status(200).json({ message: "Invoices fetched successfully", data, status: 200 });

            } catch (error) {
                console.error("Error fetching invoices:", error);
                return res.status(500).json({ message: "Internal Server Error", error: error.message });
            }
        },
        newCustomerCreation: async (req, res) => {
            console.log("newCustomerCreation ", req, res)
            try {
                const { customerName, customerAddress, customerCity, customerState, customerPincode, customerGstNo, customerPanNo, customerEmail, customerContact, customerAlernativecontact, customerCreditPeriod } = req.body;

                const counter = await customerCount.findOneAndUpdate(
                    { name: "customerUniqueId" },
                    { $inc: { value: 1 } },
                    { new: true, upsert: true, setDefaultsOnInsert: true }
                );
                const customerUniqueId = counter.value;
                console.log("customerUniqueId", customerUniqueId);
                const customerPayload = new customerCreation({
                    customerName,
                    customerAddress,
                    customerCity,
                    customerState,
                    customerPincode,
                    customerGstNo,
                    customerPanNo,
                    customerEmail,
                    customerContact,
                    customerAlernativecontact,
                    customerCreditPeriod,
                    customerUniqueId

                })

                const NewCustomersList = await customerPayload.save()

                res.status(200).json({
                    message: "New Customer Created Successfully",
                    status: 200,
                    data: NewCustomersList,
                    customerUniqueId
                })

            } catch (error) {
                res.status(500), json({
                    message: "Failed to Save Customer",
                    status: 500,
                })
            }
        },

        updateCustomer: async (req, res) => {
            console.log("req.params:", req.params, "req.body:", req.body);

            try {
                const customerUniqueId = Number(req.params.customerUniqueId); // Convert to number
                if (isNaN(customerUniqueId)) {
                    return res.status(400).json({
                        message: "Invalid Customer ID",
                        status: 400
                    });
                }

                const updateObj = req.body;
                console.log("customerUniqueId:", customerUniqueId);
                console.log("updateObj:", updateObj);

                const updateUserObj = await customerCreation.findOneAndUpdate(
                    { customerUniqueId: customerUniqueId },
                    { $set: updateObj },
                    { new: true, runValidators: true }
                );

                console.log("updateUserObj:", updateUserObj);

                if (!updateUserObj) {
                    return res.status(404).json({
                        message: "Customer Not Found",
                        status: 404
                    });
                }

                res.status(200).json({
                    message: "Customer Data Updated Successfully",
                    status: 200,
                    updatedCustomer: updateUserObj
                });

            } catch (error) {
                console.error("Error updating customer:", error);
                res.status(500).json({
                    message: "Failed to Update Customer",
                    status: 500
                });
            }
        },

        listOfCustomers: async (req, res) => {
            try {
                const customersList = await customerCreation.find()

                if (!customersList || customersList.length === 0) {
                    return res.status(200).json({
                        message: "No Data Available",
                        customersList: [],
                        status: 200
                    })

                }

                res.status(200).json({
                    message: "Customer Data Fetched Successfully",
                    data: customersList,
                    status: 200
                })

            } catch (error) {
                res.status(500).json({
                    message: "Failed to Fetch Cstomers Data"
                })

            }

        },
        forgotPassword: async (req, res) => {

            console.log("forgotPassword", req.res)
            try {
                const { userEmail } = req.body;
                console.log("userEmail", userEmail)
                if (!userEmail) {
                    return res.status(400).json({ message: "Email is required" });
                }
                const user = await userCreation.findOne({ userEmail: userEmail });
                console.log("user", user)
                if (!user) {
                    return res.status(404).json({ message: "User not found" });
                }

                let obj = {
                    userUniqueId: user.userUniqueId,
                    userEmail: user.userEmail,
                    userName: user.userName,
                    userPassword: user.userPassword,
                }

                res.status(200).json({
                    message: "Password reset email sent successfully",
                    status: 200,
                    data: obj
                })
                enterIntoSendMail(obj)
            }
            catch (error) {
                res.status(500).json({
                    message:"500 Internal Server Error",
                    status:500
                })
            }

        },

        chargesSubmit: async(req,res)=>{

            try{
               console.log("req.body",req.body)
                const { chargesName } = req.body;

                const counter = await chargesCount.findOneAndUpdate(
                    { name: "chargesUniqueId" },
                    { $inc: { value: 1 } },
                    { new: true, upsert: true, setDefaultsOnInsert: true }
                );
                const chargesUniqueId = counter.value;
                console.log("chargesUniqueId", chargesUniqueId);
                const chargesPayload = new chargesCreation({
                    chargesName,
                    chargesUniqueId
                    
                })
                console.log("chargesPayload", chargesPayload);
                const NewchargesList = await chargesPayload.save()
                console.log("NewchargesList", NewchargesList);
                res.status(200).json({
                    message: "New Charges Created Successfully",
                    status: 200,
                    data: NewchargesList,
                    chargesUniqueId
                })

            }catch(error){
                res.status(500).json({
                    message:"500 Internal Server Error",
                    status:500
                })

            }
        },
        listOfCharges: async (req, res) => {
            try {
                console.log("chargesCreation",chargesCreation)
                const chargesData = await chargesCreation.find()
              console.log("chargesData",chargesData)
                if (!chargesData || chargesData.length === 0) {
                    return res.status(200).json({
                        message: "No Data Available",
                        data: [],
                        status: 200
                    })

                }

                res.status(200).json({
                    message: "Charges Data Fetched Successfully",
                    data: chargesData,
                    status: 200
                })

            } catch (error) {
                res.status(500).json({
                    message: "Failed to Fetch Cstomers Data"
                })

            }

        },



        // below is the username and password
        // userLogin: async (req, res) => {
        //     try {
        //         const { userName, userPassword } = req.body;
        //         const user = await userCreation.findOne({ userName });

        //         if (!user) {
        //             return res.status(404).json({ message: "User Not Found", status: 404, isValid: false });
        //         }
        //         console.log("userPassword",userPassword,"user.userPassword",user.userPassword)
        //         const isMatch = await bcrypt.compare(userPassword, user.userPassword);
        //         console.log("isMatch",isMatch)
        //         if (!isMatch) {
        //             return res.status(400).json({ message: "Invalid Credentials", status: 400, isValid: false });
        //         }

        //         const token = jwt.sign(
        //             { id: user._id, userName: user.userName },
        //             process.env.JWT_SECRET || "your_jwt_secret",
        //             { expiresIn: "1h" }
        //         );

        //         res.status(200).json({ message: "Login Successful", status: 200, isValid: true, token });
        //     } catch (error) {
        //         res.status(500).json({ message: "Server Error", status: 500, isValid: false, error: error.message });
        //     }
        // }

        // below is the email and password
        // userLogin: async (req, res) => {
        //     try {
        //         const { email, userPassword } = req.body; // changed userName to email
        //         const user = await userCreation.findOne({ email }); // find user by email

        //         if (!user) {
        //             return res.status(404).json({ message: "User Not Found", status: 404, isValid: false });
        //         }

        //         console.log("userPassword", userPassword, "user.userPassword", user.userPassword);
        //         const isMatch = await bcrypt.compare(userPassword, user.userPassword);

        //         console.log("isMatch", isMatch);
        //         if (!isMatch) {
        //             return res.status(400).json({ message: "Invalid Credentials", status: 400, isValid: false });
        //         }

        //         const token = jwt.sign(
        //             { id: user._id, email: user.email }, // changed userName to email in the JWT payload
        //             process.env.JWT_SECRET || "your_jwt_secret",
        //             { expiresIn: "1h" }
        //         );

        //         res.status(200).json({ message: "Login Successful", status: 200, isValid: true, token });
        //     } catch (error) {
        //         res.status(500).json({ message: "Server Error", status: 500, isValid: false, error: error.message });
        //     }
        // }





        // new code end 


        // approvalList: async (req, res) => {
        //     try {
        //         let list;        
        //         list = await Approval.find();        
        //         res.status(200).json({ responseData: { message: "ApprovalList fetched successfully", data: list } });
        //     } catch (err) {
        //         console.error("Error fetching users:", err);
        //         res.status(500).json({ error: "Failed to fetch users" });
        //     }
        // },




    };
})();

const sendEmails = async (recipient, subject, message) => {
    const mailOptions = {
        from: 'noreply.itapps@hbl.in',
        to: 'sriramunaidug@sharviinfotech.com',
        subject: 'Forgot Deatils',
        text: message,
    };

    return transporter.sendMail(mailOptions);
};
const transporter = nodemailer.createTransport({
    host: "smtp.logix.in",
    port: 587,
    secure: false, // Use TLS
    auth: {
        user: "noreply.itapps@hbl.in",
        pass: "Happy#1968",
    },
});

const enterIntoSendMail = async (obj) => {
    const mailOptions = {
        from: 'noreply.itapps@hbl.in',
        to: obj.userEmail,
        subject: 'Your Login Credentials',
        html: `
         <p>Dear User,</p>
    
    <p>We are pleased to provide you with your login credentials:</p>
    
    <p><strong>Username:</strong> ${obj.userName}</p>  
    <p><strong>Password:</strong> ${obj.userPassword}</p>  
    
    <p>For security reasons, please keep this information strictly confidential. If you have any questions or require assistance, do not hesitate to contact our support team.</p>  
    
    <p>Best regards,</p>  
    <p> Sharviinfotech</p>  
    
        `,
    };
    await transporter.sendMail(mailOptions);
}


