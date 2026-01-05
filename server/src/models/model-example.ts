import db from '../db';
export type Cimeri = {
   id?: number;
   emri?: string;
   mbiemri?: string;
   email?: string;
   password?: string;
   telefoni?: string;
};

const executeQuery = async (query: string, params: any[] = []): Promise<any> => {
   try {
      const [rows] = await db.execute(query, params);
      return rows;
   } catch (error) {
      console.error('Database error:', error);
      throw error;
   }
};

export const getCimerByEmailModel = async (email: string) => {
   const query = 'SELECT * FROM cimerat WHERE email = ?';
   const rows = await executeQuery(query, [email]);
   return rows[0] || null;
};

export const getCimerByIdModel = async (id: number) => {
   const query = 'SELECT * FROM cimerat WHERE id = ?';
   const rows = await executeQuery(query, [id]);
   return rows[0] || null;
};

export const getAllCimersModel = async () => {
   const query = 'SELECT * FROM cimerat';
   const rows = await executeQuery(query, []);
   return rows || null;
};
