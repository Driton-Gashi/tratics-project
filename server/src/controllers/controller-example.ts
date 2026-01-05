import type { Request, Response } from 'express';
import { getCimerByEmailModel, getAllCimersModel, getCimerByIdModel } from '../models/model-example';

const serverError = (res: Response) => res.status(500).json({ message: 'Server error.' });

export const getCimerByEmailController = async (req: Request, res: Response) => {
   try {
      const emailParam = req.query.email;

      const email = typeof emailParam === 'string' ? emailParam.trim() : '';

      if (!email) {
         return res.status(400).json({
            message: 'Email query parameter is required.',
            example: '/cimerat/by-email?email=example@gmail.com',
         });
      }

      const cimer = await getCimerByEmailModel(email);

      if (!cimer) {
         return res.status(404).json({ message: 'Cimer not found.' });
      }

      return res.status(200).json(cimer);
   } catch (error) {
      console.error(error);
      return serverError(res);
   }
};

export const getAllCimersController = async (_req: Request, res: Response) => {
   try {
      const cimers = await getAllCimersModel();
      return res.status(200).json(cimers);
   } catch (error) {
      console.error(error);
      return serverError(res);
   }
};

export const getCimerByIdController = async (req: Request, res: Response) => {
   try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
         return res.status(400).json({ message: 'Invalid cimer ID.' });
      }

      const cimer = await getCimerByIdModel(id);

      if (!cimer) {
         return res.status(404).json({ message: 'Cimer not found.' });
      }

      return res.status(200).json(cimer);
   } catch (error) {
      console.error(error);
      return serverError(res);
   }
};
