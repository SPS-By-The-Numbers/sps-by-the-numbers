import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import Script from 'next/script'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>SPS By The Numbers</title>
        <meta name="Data-centric analyses and insights for Seattle Public Schools" />
      </Head>
      <main className={styles.main}>
        <h1 className={styles.title}>
	<img className="object-scale-down h-24 inline" src="/logo.png" />SPS By The Numbers
        </h1>

        <p className={styles.description}>
	Data-centric analyses and insights for Seattle Public Schools
        </p>

        <div className={styles.grid}>
          <div className={styles.card}>
            <Link href="/posts/election-2023-candidate-letters" passHref={true}>
              <h2>Candidate responses on HCC and school consolidations</h2>
On Nov 5th/6th, one of the parents on HCC Seattle Elementary Schools FB group started getting respones from schoolboard candidates about their views on HCC. To avoid having information trapped inside a FB group, am reposting on this website.  Permission was granted to repost as long as all responses are published together. Displayed in order posted.
            </Link>
          </div>

          <div className={styles.card}>
            <Link href="https://experience.arcgis.com/experience/a52ef1e7b30c4130bf8ac3d59970650b/" passHref={true}>
              <h2>Beth Day's Neighborhood Elementary School Data map</h2>
              Use the linked map to explore enrollment, building capacity, and building condition for neighborhood attendance area elementary schools in the Seattle Public Schools system. Layers showing percentages of student populations of special interest are also available (including non-white, Black/African-American, English Language Learners, highly mobile, homeless, low income, Section 504, and disabled). Also included are layers derived from the 2020 USA Census data.
            </Link>
          </div>

          <div className={styles.card}>
            <Link href="/transcripts/sps-board/2023-10-11/board-meeting" passHref={true}>
              <h2>Oct 11, 2023 Board Meeting Transcript</h2>
              Board meeting with parent testimony about massive 50 elementary school reshuffle
              followed by board discussion of the financial policy adoption.

              This is the 2nd use of pyannote and whisper to create searchable transcription.
              Uses WhisperX, speech-diarization-3.0 and large-v2 transcription model.

              Click words in text to jump to that point in the video.
            </Link>
          </div>

          <div className={styles.card}>
            <Link href="/transcripts/sps-board/2023-10-11/board-meeting" passHref={true}>
              <h2>Oct 11, 2023 Board Meeting Transcript</h2>
              Board meeting with parent testimony about massive 50 elementary school reshuffle
              followed by board discussion of the financial policy adoption.

              This is the 2nd use of pyannote and whisper to create searchable transcription.
              Uses WhisperX, speech-diarization-3.0 and large-v2 transcription model.

              Click words in text to jump to that point in the video.
            </Link>
          </div>

          <div className={styles.card}>
            <Link href="/transcripts/sps-board/2023-10-17/board-special-meeting" passHref={true}>
              <h2>Oct 17, 2023 Special Board Working Session Transcript</h2>
              Test of publishing transcription of Board Working Session. This uses pyannote
              and whisper and allows folks to search for what SPS directors and admin say.

              Click words in text to jump to that point in the video.
            </Link>
          </div>

          <div className={styles.card}>
            <Link href="/posts/state-underfunding-open-letter" passHref={true}>
              <h2>Email and Responses to Open Letter on State Underfunding of SPS</h2>
              This post publishes the open letter sent to State Legislators showing
              that the current legislation so severely underfunds SPS -- especially
              in light of Seattle&apos;s significantly higher cost of living -- that
              absent a legislative fix, teacher strikes and service degradations are
              inevitable.
            </Link>
          </div>

          <div className={styles.card}>
            <Link href="/posts/hampson-2022-strike" passHref={true}>
              <h2>Notes from Conv w/ Director Hampson on 2022 Strike</h2>
              Someone posted detailed notes from a conversation with Director Hampson about the 2022
              strike. It contains a lot of information about one director&apos;s thoughts. Almost no other
              info about SPS admin&apos;s or board&apos;s beliefs had been shared prior. It was deleted for
              some reason. Preserving it so everyone has equal access to information.
            </Link>
          </div>

          <div className={styles.card}>
            <Link href="/bell-times" passHref={true}>
              <h2>SPS Bell Time Survey Results</h2>
              <strong>Key results:</strong> <br /> Even families still without bus service overwhelmingly prefer a 2-bell schedule. Other data gathered is harder to analyze. Click through and read HAZARD at top.
            </Link>
          </div>

          <div className={styles.card}>
            <Link href="https://andrewbcooper.shinyapps.io/spsstarttimes/" passHref={true}>
              <h2>SPS Start Times Exploration Tool</h2>
              Andy Cooper (acooper at alumni.washington.edu)&apos;s awesome tool for exploring the impact of the
              2022 proposed bell time changes by joining multiple government datasets at the census tract granularity.
              Includes Equity metrics.
            </Link>
          </div>
          <div className={styles.card}>
            <Link href="/hcc-northend-resegregation" passHref={true}>
              <h2>HCC Dismantling Resegregates North End</h2>
              <strong>Key results:</strong> <br /> Cascadia is less white than 2/3 of the schools it draws from. Instead of removing a segregationist program, we have actaully resegregated Districts 1, 2, and 4.
            </Link>
          </div>
          <div className={styles.card}>
            <Link href="/tools/panorama-slicer" passHref={true}>
              <h2>SPS Panorama Data Slicer (2022)</h2>
              Tool for comparing SPS Panorama data for different schools, sorting them to find the most
              distinguishing characteristics. Much more understandable than the Panorama site.
            </Link>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>Powered by sleep-deprived parents.
        <br />
        <br />
        Questions? email: awong dot dev at gmail dot com</p>
      </footer>
    </div>
  )
}
