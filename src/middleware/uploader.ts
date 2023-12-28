/* eslint-disable @typescript-eslint/no-unused-vars */
import { extname, join } from 'path';

export const editFileName = (req, file, callback) => {
  const fileExtName = extname(file.originalname);
  const fileName =
    file.originalname
      .replace(fileExtName, '')
      .toLowerCase()
      .split(' ')
      .join('-')
      .split('#')
      .join('-') +
    '-' +
    Date.now();
  callback(null, fileName + fileExtName);
};

export const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return callback(new Error('Only image files are allowed!'), false);
  }
  callback(null, true);
};

export const anyFileFilter = (req, file, callback) => {
  callback(null, true);
};
