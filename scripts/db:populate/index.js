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

        semesterUrls.push(getSpecificCourseUrl(subjects[i], courseNumber, '201709'))
        semesterUrls.push(getSpecificCourseUrl(subjects[i], courseNumber, '201801'))
        semesterUrls.push(getSpecificCourseUrl(subjects[i], courseNumber, '201805'))
      }
    }
  }

  return semesterUrls;
}

const seedFromInfo = ({ frequency, time, days, location, range }) => {
  // TODO: do the processing.

  console.log(frequency);
}

const seedOneClassOneSemester = async (url) => {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);

  const infoCellSelector = 'table.datadisplaytable table.datadisplaytable td.dddefault';
  const infoCells = $(infoCellSelector);

  const getContents = function() {
    return $(this).text();
  };

  const info = infoCells.map(getContents).get();

  for (let i = 0; i < info.length; i += 7) {
    seedFromInfo({
      frequency: info[i],
      time: info[i + 1],
      days: info[i + 2],
      location: info[i + 3],
      range: info[i + 4],
    })
  }
}

const seedAllEntities = (urls) => Promise.all(urls.map(seedOneClassOneSemester))

const populate = async () => {
  const urls = ['https://www.uvic.ca/BAN1P/bwckctlg.p_disp_listcrse?term_in=201801&subj_in=ADMN&crse_in=312&schd_in=']; // await getAllUrls();

  await seedAllEntities(urls);

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

populate();
