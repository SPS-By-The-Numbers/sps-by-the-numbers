import fs from 'node:fs';
import { parse } from 'csv-parse/sync';
import { readFile } from 'fs/promises';

const OSPI_TO_PANORAMA_NAME = {
    "Adams Elementary School":"Adams",
    "Aki Kurose Middle School":"Aki Kurose",
    "Alan T. Sugiyama High School":"Sugiyama",
    "Alki Elementary School":"Alki",
    "Arbor Heights Elementary School":"Arbor Heights",
    "B F Day Elementary School":"B.F. Day",
    "Bailey Gatzert Elementary School":"Bailey Gatzert",
    "Ballard High School":"Ballard",
    "Beacon Hill International School":"Beacon Hill Int'l",
    "Bridges Transition":"BRIDGES Transition",
    "Broadview-Thomson K-8 School":"Broadview-Thomson",
    "Bryant Elementary School":"Bryant",
    "Cascade Parent Partnership Program":"Cascade Parent Partnership",
    "Cascadia Elementary":"Cascadia",
    "Catharine Blaine K-8 School":"Blaine",
    "Cedar Park Elementary School":"Cedar Park",
    "Chief Sealth International High School":"Chief Sealth Int'l",
    "Cleveland High School STEM":"Cleveland STEM",
    "Concord International School":"Concord Int'l",
    "Daniel Bagley Elementary School":"Daniel Bagley",
    "David T. Denny International Middle School":"Denny Int'l",
    "Dearborn Park International School":"Dearborn Park Int'l",
    "Dunlap Elementary School":"Dunlap",
    "Eckstein Middle School":"Eckstein",
    "Edmonds S. Meany Middle School":"Meany",
    "Emerson Elementary School":"Emerson",
    "Fairmount Park Elementary School":"Fairmount Park",
    "Franklin High School":"Franklin",
    "Frantz Coe Elementary School":"Frantz Coe",
    "Garfield High School":"Garfield",
    "Gatewood Elementary School":"Gatewood",
    "Genesee Hill Elementary":"Genesee Hill",
    "Graham Hill Elementary School":"Graham Hill",
    "Green Lake Elementary School":"Green Lake",
    "Greenwood Elementary School":"Greenwood",
    "Hamilton International Middle School":"Hamilton Int'l",
    "Hawthorne Elementary School":"Hawthorne",
    "Hazel Wolf K-8":"Hazel Wolf",
    "Highland Park Elementary School":"Highland Park",
    "Ingraham High School":"Ingraham Int'l",
    "Interagency Detention School":"Interagency",
    "Interagency Open Doors": "Interagency Open Doors",
    "Interagency Programs": "Interagency Programs",
    "Jane Addams Middle School":"Jane Addams",
    "John Hay Elementary School":"John Hay",
    "John Muir Elementary School":"John Muir",
    "John Rogers Elementary School":"John Rogers",
    "John Stanford International School":"John Stanford Int'l",
    "Kimball Elementary School":"Kimball",
    "Lafayette Elementary School":"Lafayette",
    "Laurelhurst Elementary School":"Laurelhurst",
    "Lawton Elementary School":"Lawton",
    "Leschi Elementary School":"Leschi",
    "Licton Springs K-8":"Licton Springs",
    "Lincoln High School":"Lincoln",
    "Louisa Boren STEM K-8":"Louisa Boren STEM",
    "Lowell Elementary School":"Lowell",
    "Loyal Heights Elementary School":"Loyal Heights",
    "Madison Middle School":"Madison",
    "Madrona K-5 School":"Madrona",
    "Magnolia Elementary School":"Magnolia",
    "Maple Elementary School":"Maple",
    "Martin Luther King Jr. Elementary School":"Martin Luther King Jr.",
    "McClure Middle School":"McClure",
    "McDonald International School":"McDonald Int'l",
    "McGilvra Elementary School":"McGilvra",
    "Mercer International Middle School":"Mercer Int'l",
    "Middle College High School":"Middle College HS",
    "Montlake Elementary School":"Montlake",
    "Nathan Hale High School":"Nathan Hale",
    "North Beach Elementary School":"North Beach",
    "Northgate Elementary School":"Northgate",
    "Nova High School":"Nova",
    "Olympic Hills Elementary School":"Olympic Hills",
    "Olympic View Elementary School":"Olympic View",
    "Orca K-8 School":"Orca",
    "Pathfinder K-8 School":"Pathfinder",
    "Private School Services":"Private School Services",
    "Queen Anne Elementary":"Queen Anne",
    "Rainier Beach High School":"Rainier Beach",
    "Rainier View Elementary School":"Rainier View",
    "Rising Star Elementary School":"Rising Star",
    "Robert Eagle Staff Middle School":"Eagle Staff",
    "Roosevelt High School":"Roosevelt",
    "Roxhill Elementary School":"Roxhill",
    "Sacajawea Elementary School":"Sacajawea",
    "Salmon Bay K-8 School":"Salmon Bay",
    "Sand Point Elementary":"Sand Point",
    "Sanislo Elementary School":"Sanislo",
    "Seattle World School":"South Shore",
    "South Shore PK-8 School":"South Lake",
    "Stephen Decatur Elementary School":"Decatur",
    "Stevens Elementary School":"Stevens",
    "The Center School":"The Center School",
    "Thornton Creek Elementary School":"Thornton Creek",
    "Thurgood Marshall Elementary":"Thurgood Marshall",
    "Tops K-8 School":"TOPS",
    "View Ridge Elementary School":"View Ridge",
    "Viewlands Elementary School":"Viewlands",
    "Washington Middle School":"Washington",
    "Wedgwood Elementary School":"Wedgwood",
    "West Seattle Elementary School":"West Seattle Elementary",
    "West Seattle High School":"West Seattle High",
    "West Woodland Elementary School":"West Woodland",
    "Whitman Middle School":"Whitman",
    "Whittier Elementary School":"Whittier",
    "Wing Luke Elementary School":"Wing Luke"
}

// Do not change these values. The match the exact heading from OSPI.
const OSPI_RACE_CATEGORIES = [
  "American Indian/ Alaskan Native",
  "Asian",
  "Black/ African American",
  "Hispanic/ Latino of any race(s)",
  "Native Hawaiian/ Other Pacific Islander",
  "Two or More Races",
  "White"
];
const OSPI_GENDER_CATEGORIES = [
  "Female",
  "Gender X",
  "Male",
];

function getInt(row, category) {
  return parseInt(row[category].replaceAll(",",""));
}

async function getData(ospiFile, panoramaFile) {
  const ospiData = parse(await readFile(ospiFile, "utf8"),
      { columns: true, skip_empty_lines: true});
  const panoramaData = JSON.parse(await readFile(panoramaFile, "utf8"));

  return { ospiData, panoramaData };
}

async function doMerge(ospiData, panoramaData) {

  const allSchools = panoramaData.reports['School Report']['All Available Schools'];
  for (const row of ospiData) {
    const normalizedName = OSPI_TO_PANORAMA_NAME[row['Organization Name']];
    const school = allSchools[normalizedName];

    if (!school) {
      console.error(`Missing school ${school} ${row['Organization Name']}`);
      continue;
    }

    school["OSPI Racial Demographics"] = {
      answers: OSPI_RACE_CATEGORIES,
      answer_respondents: OSPI_RACE_CATEGORIES.map(category => getInt(row, category)),
    };

    school["OSPI Gender Demographics"] = {
      answers: OSPI_GENDER_CATEGORIES,
      answer_respondents: OSPI_GENDER_CATEGORIES.map(category => getInt(row, category)),
    };
    
  }

  return panoramaData;
}

const {ospiData, panoramaData} = await getData(process.argv[2], process.argv[3]);
const merged = await doMerge(ospiData, panoramaData);

console.log(JSON.stringify(merged, null, 2));
