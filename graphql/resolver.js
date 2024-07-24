import db from "../db/initDB.js";

const resolvers = {
  Query: {
    test: async (_parent, _args, _context) => {
      const result = await db.query(`SELECT * FROM dummy_table`);
      return result.rows[1];
    },
  },
  Mutation: {
    mutationTest: (_parent, _args, _context) => "Mutation Test Successful",
  },
};

export default resolvers;
