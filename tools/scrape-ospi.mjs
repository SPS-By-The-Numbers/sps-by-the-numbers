import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import fs from 'node:fs';

const ALL_SCHOOL_IDS = [
    "101054", "101143", "101144", "101061", "101102", "101139",
    "101081", "101071", "101039", "104200", "105910", "101068",
    "101087", "106431", "101004", "105540", "101106", "106070",
    "101118", "101089", "101064", "101094", "101107", "101145",
    "101082", "101101", "106068", "101003", "101049", "101008",
    "101135", "101062", "101045", "101080", "101055", "101129",
    "101126", "101036", "101053", "101086", "101174", "104944",
    "101077", "101177", "101123", "103841", "105909", "100996",
    "101115", "105777", "101037", "101058", "101111", "101042",
    "101130", "101105", "101093", "101063", "101052", "101152",
    "106215", "105493", "101138", "101096", "101091", "101038",
    "106214", "101085", "101044", "101134", "105166", "101066",
    "101117", "100973", "101083", "101131", "101122", "101147",
    "101112", "101076", "101168", "100990", "104180", "105167",
    "101125", "101128", "101176", "101051", "106069", "101079",
    "101120", "101116", "101006", "105168", "101137", "105454",
    "100989", "101173", "106071", "101041", "106083", "101013",
    "101159", "101056", "100976", "101099", "101113", "101167",
    "101114", "101098", "101072", "101057", "101124", "101047",
    "101136"
];

const ALL_HEADERS = {
    id: "Organization Lvl Id",
    name: "Organization Name",
    year: "School Year",
    group: "Student Group",
    group_type: "Student Group Type",
    count: "Student Count",
};

async function fetchCsv(schoolId) {
  const url = `https://tableau.ospi.k12.wa.us/t/Public/views/ReportCard_Enrollment/Enrollment_Summary_Dashboard?iframeSizedToWindow=true&:embed=y&:showAppBanner=false&:display_count=no&:showVizHome=no&:toolbar=no&format=csv&organizationid=${schoolId}`;
  const response = await fetch(url);
  const text = await response.text();
  return parse(text, { columns: true, skip_empty_lines: true});
}

async function scrape(results, outputHeaders, schoolId) {
  const csvdata = await fetchCsv(schoolId);
  const row = {};
  for (const record of csvdata) {

    // These are always the same so its idempotnent.
    row[ALL_HEADERS.id] = record[ALL_HEADERS.id];
    row[ALL_HEADERS.name] = record[ALL_HEADERS.name];
    row[ALL_HEADERS.year] = record[ALL_HEADERS.year];

    // Record the datum.
    const group = record[ALL_HEADERS.group];
    outputHeaders.add(group);
    row[group] = record[ALL_HEADERS.count];
  }
  results.push(row);
}

async function scrapeAll() {
  const results = [];
  const outputHeaders = new Set([
      ALL_HEADERS.id,
      ALL_HEADERS.name,
      ALL_HEADERS.year,
  ]);

  const outstanding = []; 
  for (const id of ALL_SCHOOL_IDS) {
    outstanding.push(scrape(results, outputHeaders, id));
    if (outstanding.length > 5) {
      await Promise.all(outstanding);;
      outstanding.length = 0;
    }
  }
  return stringify(results, { header: true, columns: [...outputHeaders] });
}

fs.writeFileSync('output.csv', await scrapeAll());

