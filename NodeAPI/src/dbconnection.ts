
  import { createPool, Pool } from 'mysql2/promise'

  export async function connect(): Promise<Pool> {
      const conn = await createPool({
          host: 'localhost',
          user: 'root',
          password: "cloudshare2023",
         database:"cloudshare"
      });
      return conn;
  }
 