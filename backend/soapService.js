import express from 'express';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { soap } from 'strong-soap';

// Adjust the path to your Sequelize model
import { user as User } from './models/index.js';

// For replacing __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const wsdlPath = path.join(__dirname, 'contact.wsdl');

const contactService = {
  ContactService: {
    ContactPort: {
      GetContactsByOrganization(args, callback) {
        const orgName = args.organization;

        User.findAll({
          where: { organisation: orgName },
          attributes: ['userID', 'name', 'email', 'phone', 'organisation'],
        })
          .then((users) => {
            const response = JSON.stringify(users);
            callback({ contacts: response });
          })
          .catch((err) => {
            console.error('SOAP Error:', err);
            callback({ contacts: JSON.stringify([]) });
          });
      },
    },
  },
};

app.listen(3001, () => {
  const xml = readFileSync(wsdlPath, 'utf8');
  soap.listen(app, '/soap/contactService', contactService, xml);
  console.log('SOAP service running at http://localhost:3001/soap/contactService?wsdl');
});
