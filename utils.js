import fs from 'fs';
import path from 'path';
import { stringify } from 'csv';
import YAML from 'yaml';

export const readFileAsBase64 = (filePath) => {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const base64Data = fileBuffer.toString('base64');
    return base64Data;
  } catch (error) {
    console.error('Error reading file:', error);
    return null;
  }
};


export const sleep = async (seconds) => {
  console.log(`Sleeping for ${seconds} seconds.`)
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

export const parseOutput = (content, outputFormat) => {
  try {
    if (outputFormat === 'json') {
      content = content.replace(/```json/g, '').replace(/```/g, '').replace(/\\n/g, '');
      return JSON.parse(content);
    } else if (outputFormat === 'yaml') {
      content = content.replace(/```yaml/g, '').replace(/```/g, '').replace(/---/g, "").replace(/.../g, "");
      return YAML.parse(content, { uniqueKeys: false, strict: false });
    } else {
      return content;
    }
  } catch (error) {
    console.log(content);
    return null;
  }
}

export const convertToCSV = async (data) => {
  return new Promise((resolve, reject) => {
    stringify(data, {
      header: true
    }, (err, output) => {
      if (err) {
        reject(err);
      } else {
        resolve(output);
      }
    });
  });
};

export function ensureDirectoryExistence(filePath) {
  var dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}