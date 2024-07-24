import db from "../db/initDB.js";

const resolvers = {
  Query: {
    test: async (_parent, _args, _context) => {
      const result = await db.query(`SELECT * FROM dummy_table`);
      console.log("hello");
      return result.rows[1];
    },
  },
};

export default resolvers;
