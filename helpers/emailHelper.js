const { sendMailer } = require("../utils/nodemailer");
const reportAction = require("../constants/reportActions");

const sendRejectMail = async (email, name, reason) => {
  const content = `Dear ${name},\nYour request has been rejected\nReason: ${reason}`;
  await sendMailer(email, "Request Rejected", content);
};

const sendAcceptMail = async (email, name) => {
  const content = `Dear ${name},\nYour request has been accepted`;
  await sendMailer(email, "Request Accepted", content);
};

const sendReportMails = async (client, serviceProvider, service, action) => {
  if (action === reportAction.block) {
    const clientContent = `Your report against ${serviceProvider.fullname} on ${service.serviceName} has been reviewd.
                               ${serviceProvider.fullname} has been blocked from the platform.`;
    const serviceProviderContent = `As per the report from ${client.fullname} on service ${service.serviceName}, you have been blocked from the platform.`;

    await sendMailer(client.email, "Report Resolved", clientContent);
    await sendMailer(
      serviceProvider.email,
      "Blocking from the platform",
      serviceProviderContent
    );
  } else if (action === reportAction.warn) {
    const clientContent = `Your report against ${serviceProvider.fullname} on ${service.serviceName} has been reviewed. 
                               A warning has been issued to ${serviceProvider.fullname}.`;
    const serviceProviderContent = `As per the report from ${client.fullname} on service ${service.serviceName}, you have been issued a warning. 
                                        Please ensure compliance with platform guidelines.`;

    await sendMailer(client.email, "Report Reviewed", clientContent);
    await sendMailer(
      serviceProvider.email,
      "Warning Issued",
      serviceProviderContent
    );
  } else if (action === reportAction.ignore) {
    const clientContent = `Your report against ${serviceProvider.fullname} on ${service.serviceName} has been reviewed. 
                               However, no action was taken as it did not violate platform policies.`;

    await sendMailer(
      client.email,
      "Report Reviewed - No Action Taken",
      clientContent
    );
  }
};

module.exports = {
  sendRejectMail,
  sendAcceptMail,
  sendReportMails,
};
