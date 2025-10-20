import '../public/styles.css';
import GTM from '../utils/gtm';

export default function App({ Component, pageProps }) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  return (
    <>
      <GTM id={gtmId} />
      <Component {...pageProps} />
    </>
  );
}