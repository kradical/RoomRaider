const axios = require('axios');
const cheerio = require('cheerio');

const db = require('../../db');

const getHrefs = async (url) => {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);

  const links = $('a');

  const getHref = function() {
    return $(this).attr('href');
  };

  return links.map(getHref).get();
}

const getSpecificCourseUrl = (subject, courseNumber, termStart) =>
  `https://www.uvic.ca/BAN1P/bwckctlg.p_disp_listcrse?term_in=${termStart}&subj_in=${subject}&crse_in=${courseNumber}&schd_in=`

const getAllUrls = async () => {
  const baseUrl = 'https://web.uvic.ca/calendar2018-01/'
  const initialUrl = `${baseUrl}courses/`;

  const initialHrefs = await getHrefs(initialUrl);

  const startString = '../CDs/';
  const endString = '/CTs.html';
  const subjects = initialHrefs
    .filter((href) => href.includes(startString) && href.includes(endString))
    .filter((url, i, arr) => i === arr.indexOf(url))
    .map((href) => href.slice(startString.length, -endString.length));

  // ex href: '../CDs/ECON/CTs.html'
  const subjectUrls = subjects.map((subject) => `${baseUrl}CDs/${subject}${endString}`);

  const coursePromises = subjectUrls.map(getHrefs)
  const coursesHrefs = await Promise.all(coursePromises);

  const semesterUrls = [];
  for (let i = 0; i < subjects.length; i++) {
    for (let j = 0; j < coursesHrefs[i].length; j++) {
      const found = coursesHrefs[i][j].match(/(\d+)\.html/);

      // get the three semester urls
      if (found) {
        const courseNumber = found[1];

        semesterUrls.push(getSpecificCourseUrl(subjects[i], courseNumber, '201801'));
        semesterUrls.push(getSpecificCourseUrl(subjects[i], courseNumber, '201805'));
        semesterUrls.push(getSpecificCourseUrl(subjects[i], courseNumber, '201809'));
      }
    }
  }

  return semesterUrls;
}

const seedFromInfo = async ({ frequency, time, days, location, range }, owner, campus) => {
  // TODO: do the processing.

  const locationInfo = location.split(' ');
  const roomNumber = locationInfo.pop();
  const buildingName = locationInfo.join(' ');

  const building = await createBuilding(buildingName, campus);
  console.log(building);
}

const seedOneClassOneSemester = async (url, owner, campus) => {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);

  const infoCellSelector = 'table.datadisplaytable table.datadisplaytable td.dddefault';
  const infoCells = $(infoCellSelector);

  const getContents = function() {
    return $(this).text();
  };

  const info = infoCells.map(getContents).get();

  for (let i = 0; i < info.length; i += 7) {
    await seedFromInfo({
      frequency: info[i],
      time: info[i + 1],
      days: info[i + 2],
      location: info[i + 3],
      range: info[i + 4],
    }, owner, campus);
  }
}

const seedAllEntities = (urls, owner, campus) => Promise.all(urls.map((url) => seedOneClassOneSemester(url, owner, campus)))

const createBuilding = (name, campus) =>
  db.query(`
    INSERT INTO buildings (name, "campusId")
    VALUES ($1, $2)
    ON CONFLICT DO NOTHING
  `, [name, campus.id])

const createUvicUser = () =>
  db.query(`
    INSERT INTO users (username, password, name, type)
    VALUES ('uvic', 'thisIsAHash', 'UVic', 'entity')
    ON CONFLICT DO NOTHING
  `)

const createUvicCampus = () =>
  db.query(`
    INSERT INTO campuses (name) VALUES ('UVic')
    ON CONFLICT DO NOTHING
  `)

const findUvicUser = () =>
  db.query('SELECT * from  users WHERE username=\'uvic\';')

const findUvicCampus = () =>
  db.query('SELECT * from  campuses WHERE name=\'UVic\';')

const populate = async () => {
  const urls = ['https://www.uvic.ca/BAN1P/bwckctlg.p_disp_listcrse?term_in=201801&subj_in=PHYS&crse_in=111&schd_in='];
  // const urls = await getAllUrls();
  await createUvicUser();
  await createUvicCampus();

  const uvicUser = (await findUvicUser()).rows[0];
  const uvicCampus = (await findUvicCampus()).rows[0];

  await seedAllEntities(urls, uvicUser, uvicCampus);

  /*
   * TODO:
   *   - Get "Bookings" in memory
   *   - Create the user to insert with ("Uvic") // use cheerio
   *   - Insert building -> room -> booking
   */

  // example db usage
  // const res = await db.query('SELECT $1::text as message', ['Hello world!']);
  // console.log(res.rows[0].message);
};

populate()
  .then(process.exit.bind(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
