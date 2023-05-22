const nodemailer = require('nodemailer');
const ejs = require('ejs');
const fs = require('fs')

exports.mail = async function (email, password, firstname) {

    const data = {
        name: firstname,
        passwrd: password,
        username: email
    }

    // Read the HTML content file
    await fs.readFile('./templates/mailtemplate.ejs', 'utf8', async (err, template) => {
        if (err) {
            console.error(err);
            return;
        }

        // Render the HTML and Bind data
        const html = ejs.render(template, data);


        // Create the transporter
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'vigneshshanmugam9@gmail.com',
                pass: 'exvvlmxdsdlezpnk'
            }
        });



        // Generate the completemail
        var mailOptions = {
            from: 'vigneshshanmugam9@gmail.com',
            to: email,
            subject: 'Sign in password',
            html: html
        };


        // Send mail to the newly created user
         transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                return error;
            } else {
                return info;
            }
        });
    });

}