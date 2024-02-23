import React, { FC } from 'react';
import { Helmet } from 'react-helmet-async';

interface HelmetWrapperProps {
    title: string;
    description: string;
    url: string;
    image: string;
    hashtag: string;
    keywords: string;
    canonical: string;
}
const HelmetWrapper: FC<HelmetWrapperProps> = ({ title, description, url, image, hashtag, keywords, canonical }) => {
    return (
        <Helmet>
            <title>{'Hack Trip ' + title.slice(0, 100)}</title>
            <meta name='description' content={'Hack Trip is an app where you can share your trips or get valuable tips for your future trips. These are our TOP 5 most liked in Hack Trips!' + description.slice(0, 100)} />
            <meta name='keywords' content={keywords} />
            <meta property="og:title" content={title.slice(0, 100)} />
            <meta property="og:url" content={url} />
            <meta property="og:image:url" content={url} />
            <meta property="og:image" content={`https://storage.googleapis.com/hack-trip/${image}`} />
            <meta property="og:type" content="website" />
            <meta property="og:description" content={'Hack Trip is an app where you can share your trips or get valuable tips for your future trips. These are our TOP 5 most liked in Hack Trips!' + description.slice(0, 100)} />
            <meta property="quote" content={'Hack Trip ' + title.slice(0, 100)} />
            <meta property="og:locale" content="en_US" />
            <meta property="og:hashtag" content={hashtag} />
            <meta property="og:site_name" content="Hack-Trip" />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content={title.slice(0, 100)} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content="@hack-trip" />
            <meta name="twitter:title" content={'Hack Trip ' + title.slice(0, 100)} />
            <meta name="twitter:description" content={'Hack Trip is an app where you can share your trips or get valuable tips for your future trips. These are our TOP 5 most liked in Hack Trips!' + description.slice(0, 100)} />
            <meta name="twitter:image" content={`https://storage.googleapis.com/hack-trip/${image}`} />
            <meta name="twitter:image:alt" content={'Hack Trip ' + title.slice(0, 100)} />
            <meta name="twitter:creator" content="@hack-trip" />
            <meta property="viber:image" content={`https://storage.googleapis.com/hack-trip/${image}`} />
            <meta property="viber:image:width" content="170" />
            <meta property="viber:image:height" content="170" />
            <link rel="canonical" href={canonical} />
        </Helmet>
    )
}

export default HelmetWrapper;


