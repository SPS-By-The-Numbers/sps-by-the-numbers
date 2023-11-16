'use client'

import { intlFormat } from 'date-fns';
import Link from 'next/link'
import { ReactNode } from 'react';
import { getVideoPath } from 'utilities/path-utils';

type DateProps = {
    category: string,
    date: Date,
    videos: any[],
};

export default function VideoLinks({category, videos, date}: DateProps): ReactNode {

    const videoLinks: ReactNode[] = videos.map(
        video => (
            <li key={video.metadata.video_id} className="mx-3 list-disc">
                <Link href={getVideoPath(category, video.metadata.video_id)}>
                    {video.metadata.title}
                </Link>
            </li>
    ));

    return (
        <main className="mx-5 my-5">
          <h2 className="my-4 text-lg">
            Meetings that we have transcripts for.
            Transcripts for { category } on { intlFormat(date) }
          </h2>
            <ul className="flex flex-col flex-wrap h-screen">
                { videoLinks }
            </ul>
        </main>
    );
}
