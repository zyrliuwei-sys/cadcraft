const GTM_ID = 'GTM-MBGHXM6W';

/** Google Tag Manager container bootstrap. */
export function GoogleTagManager() {
  const src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;

  return (
    <>
      <script id="gtm-loader" async src={src} />
      <script
        id="gtm-init"
        dangerouslySetInnerHTML={{
          __html:
            "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());",
        }}
      />
    </>
  );
}
