import { Request, Response, NextFunction } from 'express';
import Logger from '../libs/logger';
import langs from '../constants/langs';
import { defaultValidator } from '../libs/defaultValidator';

const logger = Logger.create('paramValidator');
const v = defaultValidator();
const newValidator = (validateSchema: any) => (req: Request, res: Response, next: NextFunction) => {
  try {
    const check = v.compile(validateSchema);
    const match = check(req.body);
    logger.debug('Param validated');
    if (match !== true) {
      return res.status(400).json({
        success: false,
        message: 'Validator Error',
        code: langs.VALIDATE_ERROR,
        data: match,
      });
    }

    return next();
  } catch (err: any) {
    logger.error('newValidator Error', req.method, req.originalUrl, err);

    return res.status(400).json({
      success: false,
      message: 'Validator Error',
      code: langs.VALIDATE_ERROR,
      data: err.message,
    });
  }
};
export default newValidator;
