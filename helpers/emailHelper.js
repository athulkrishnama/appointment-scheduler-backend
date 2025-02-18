const {sendMailer} = require('../utils/nodemailer')

const sendRejectMail = async (email, name, reason) => {
    const content = `Dear ${name},\nYour request has been rejected\nReason: ${reason}`
    await sendMailer(email, "Request Rejected", content)
}

const sendAcceptMail = async (email, name) => {
    const content = `Dear ${name},\nYour request has been accepted`
    await sendMailer(email, "Request Accepted", content)
}

module.exports = {
    sendRejectMail,
    sendAcceptMail
}