const db = require('../../db');

const populate = async () => {
  /*
   * TODO:
   *   - Create the user to insert with ("Uvic")
   *   - Go through every faculty
   *   - Go through every class
   *   - Get "Bookings" in memory
   *   - Insert building -> room -> booking
   */

  const res = await db.query('SELECT $1::text as message', ['Hello world!']);
  console.log(res.rows[0].message);
};

populate();
