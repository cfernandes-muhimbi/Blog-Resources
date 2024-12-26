// create a particular filecontent by name
const getFileMimeType = require('../getFileMimeType');
const https = require('https');
const path = require('path');

const perform = async (z, bundle) => {
  const encodedFile = bundle.inputData.file;
  const filename = bundle.inputData.filename;
  const filenameWithoutExtension = path.basename(filename, path.extname(filename));
  const extension = path.extname(filename);

    // Remove the dot from the extension
    const extensionWithoutDot = extension.replace('.', '');
    const mimeType = await getFileMimeType.getMime(extensionWithoutDot);

  const result = await new Promise((resolve, reject) => {
       https.get(encodedFile, (res) => {
          const data = [];
          res.on('data', (chunk) => {
              data.push(chunk);
          });
          res.on('end', () => {
              const fileContent = Buffer.concat(data).toString('base64');
              resolve({ fileContent });  // Wrap the file content in an object
          });
      }).on('error', (err) => {
          reject(err);
      });
  });

  const response = await z.request({
    method: 'POST',
    url: 'https://api.muhimbi.com/api/v1/operations/Convert',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: {
      use_async_pattern: 'false',
      source_file_name: filename,
      source_file_content: result.fileContent,
      output_format: 'PDF',
      fail_on_error: 'true',
    }
  });
  const decodedFile = await Buffer.from(response.data.processed_file_content, 'base64').toString('utf-8');

  // ... rest of your code ...
  const base64 = response.data.processed_file_content; // replace this with your base64 string
  const fileByte = await Buffer.from(base64, 'base64');
  const stashedfile = await z.stashFile(fileByte, fileByte.length, filenameWithoutExtension+'.pdf', mimeType);
  //const stashedfile = await z.stashFile(fileByte, fileByte.length, 'Yo.pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  const output = { name: filenameWithoutExtension+'.pdf', file: stashedfile };
  z.console.log(stashedfile);
  return output;

};
module.exports = {
  key: 'convert_document',
  noun: 'Convert Document',

  display: {
    label: 'Convert Document',
    description: 'Convert more than 60 file types to PDF documents or other formats'
  },

  operation: {
    perform,
    // `inputFields` defines the fields a user could provide
    // Zapier will pass them in as `bundle.inputData` later. They're optional.
    // End-users will map data into these fields. In general, they should have any fields that the API can accept. Be sure to accurately mark which fields are required!
    inputFields: [
      { key: 'filename', required: true, type: 'string', label: 'Filename' },
      { key: 'file', required: true, type: 'file', label: 'File' },
      { key: 'output_file_type', required: true, type: 'string', label: 'Output File Type',default: 'PDF'},
    ],
    outputFields: [
      // these are placeholders to match the example `perform` above
      {key: 'name', label: 'File Name'},
      {key: 'File', label: 'Proccessed File'}
    ]
  }
};
