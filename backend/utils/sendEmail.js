import SibApiV3Sdk from "sib-api-v3-sdk";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY; // Load API key from .env

const sendEmail = async (to, subject, htmlContent) => {
  try {
    const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

    const sender = {
      email: process.env.BREVO_FROM_EMAIL, // Must be a verified sender in Brevo
      name: "Placement Portal ❤️ by GenAI", // Change this to your app name
    };

    const receivers = [{ email: to }];

    await tranEmailApi.sendTransacEmail({
      sender,
      to: receivers,
      subject, 
      htmlContent,
    });

    console.log(`📩 Email sent to ${to}`);
  } catch (error) {
    console.error(
      "❌ Error sending email:",
      error.response ? error.response.body : error.message
    );
  }
};

export default sendEmail;
