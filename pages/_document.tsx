import Document, { Html, Head, Main, NextScript } from 'next/document'
import { GA_TRACKING_ID } from '@utils'

export default class MyDocument extends Document {
    render() {
        return (
            <Html>
                <Head>
                    <link rel="stylesheet" href="https://cdn.quilljs.com/1.2.6/quill.snow.css" />
                    <link
                        rel="apple-touch-icon"
                        sizes="180x180"
                        href="/static/apple-touch-icon.png"
                    />
                    <link
                        rel="icon"
                        type="image/png"
                        sizes="32x32"
                        href="/static/favicon-32x32.png"
                    />
                    <link
                        rel="icon"
                        type="image/png"
                        sizes="16x16"
                        href="/static/favicon-16x16.png"
                    />
                    <link rel="manifest" href="/static/site.webmanifest" />
                    <meta name="msapplication-TileColor" content="#da532c" />
                    <meta name="theme-color" content="#ffffff" />
                    <style jsx global>{`
                        .ql-toolbar.ql-snow {
                            border: 1px solid #d9d9d9;
                            background: white;
                            border-top-left-radius: 5px;
                            border-top-right-radius: 5px;
                        }

                        .ql-container.ql-snow {
                            border: 1px solid #d9d9d9;
                            background: white;
                            border-bottom-left-radius: 5px;
                            border-bottom-right-radius: 5px;
                        }

                        .primary {
                            color: #079e99;
                        }

                        .b--primary {
                            color: #079e99;
                        }

                        .bg-primary {
                            background-color: #079e99;
                        }

                        .card {
                            border-radius: 3px;
                            box-shadow: 0 1px 2px #c9cccd;
                        }

                        .ant-form-explain {
                            white-space: pre-line;
                        }

                        .twitter-tweet {
                            margin: 0 auto;
                        }
                    `}</style>
                </Head>
                <body style={{ margin: 0 }}>
                    <Main />
                    <NextScript />
                </body>
                <script
                    async
                    src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
                />
                <script async src={'https://platform.twitter.com/widgets.js'} charSet="utf-8" />
                <script async src={'https://imgur.com/min/embed.js'} charSet="utf-8" />
                <script async src={'https://www.instagram.com/embed.js'} charSet="utf-8" />
                <script async src={'https://w.soundcloud.com/player/api.js'} charSet="utf-8" />
                <script
                    async
                    src={'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v3.2'}
                    charSet="utf-8"
                />
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                                window.dataLayer = window.dataLayer || [];
                                function gtag(){dataLayer.push(arguments);}
                                gtag('js', new Date());
                                gtag('config', '${GA_TRACKING_ID}');
                              `,
                    }}
                />
            </Html>
        )
    }
}
