////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Module: email_interface
// Author: Tom Connolly
// Description: Interface module to take care of sending emails when the server activity requires
// Testing script: /testing/unit_testing/interface_tests/email_interface.test.js
//
////////////////////////////////////////////////////////////////////////////////////////////////////

//external dependencies
var nodemailer = require('nodemailer');

//internal dependencies



module.exports = {
    
    send: function(send_config, success_callback, failure_callback){
        
        var email_title = send_config.email_title;
        var email_html = send_config.email_html;
        var recipient_address = send_config.recipient_address;
        
        //send email with link in it to a page where a user can reset their password
        var transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.SERVER_EMAIL_ADDRESS,
                pass: process.env.SERVER_EMAIL_PASSWORD
            }
        });

        //config mail options
        var mailOptions = {
            from: 'noreply@beeftracker.com',
            to: recipient_address,
            subject: email_title,
            html: email_title
        };

        //send email notifying beeftracker account new submisson
        transporter.sendMail(mailOptions, function(error, info){
            if(error){ 
                console.log(error);
                failure_callback({ failed: true, module: "email_interface", function: "send", message: error })
            }
            else{
                console.log('Message sent: ' + info.response);
                success_callback(null);
            };
        });
    }
}