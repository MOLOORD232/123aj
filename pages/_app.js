// pages/_app.js
// Change from:
// import '@/styles/globals.css'
// To:
import '../styles/globals.css'

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}
