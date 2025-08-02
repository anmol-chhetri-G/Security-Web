import { json } from 'express';

export const requestLogger = (req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
};

export const jsonParser = json();