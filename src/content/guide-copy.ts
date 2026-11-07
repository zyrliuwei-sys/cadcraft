export type GuidePage = 'download' | 'online';

export type GuideCopy = {
  /** Owner-supplied English body copy, 150–250 words in total. */
  paragraphs: string[];
  /** The same 5–8 visible pairs feed FAQPage structured data. */
  faq: [string, string][];
};

// Drafted from the verified release and this host’s actual behavior.
// The owner reviews these paragraphs and FAQs in the dedicated content PR.
export const guideCopy: Record<GuidePage, GuideCopy | null> = {
  download: {
    paragraphs: [
      'This page helps you choose an official CADCraft download, install it on the right operating system, and check the package before opening a drawing. The desktop application is free and open source. Optional Pro cloud features sold by cadcraft.org are separate from the upstream software and are not required to use a local installation.',
      'The linked release provides Windows installers and portable archives for several processor architectures, a universal macOS disk image, Linux packages for supported architectures, and FreeBSD archives. Choose the architecture that matches your computer: an aarch64 Linux package is not a replacement for an x86_64 download. Check the release asset list and SHA256SUMS.txt rather than downloading the repository’s source ZIP by mistake. Rust is required for a source build, not for a prebuilt installer.',
      'For ordinary desktop drafting, CADCraft reads ASCII DXF R12–2018 and binary DXF R13–2018. Desktop DWG conversion uses acadrust and has fidelity limits; PDF plotting, SVG and PNG export are available. Keep original drawings and inspect converted files. Desktop builds need compatible graphics drivers and fonts; the browser edition needs a modern WebAssembly-capable browser with a supported renderer, with CPU mode available for compatibility. There is no single verified minimum RAM specification promised here. Follow the platform steps below, then use the tutorials to reproduce a small drawing before trusting a production file.',
    ],
    faq: [
      [
        'Is the CADCraft desktop download free?',
        'Yes. The upstream desktop application is open source under MIT OR Apache-2.0. A cadcraft.org Pro subscription is optional and covers this site’s cloud features, not a desktop software license.',
      ],
      [
        'Which download should I choose for my computer?',
        'Use the Windows installer or portable archive matching your processor, the universal macOS DMG, or the Linux/FreeBSD package for your architecture. The quick Linux link is x86_64 Flatpak; ARM64 packages are separate release assets.',
      ],
      [
        'Does Code → Download ZIP install CADCraft?',
        'No. That ZIP contains source code. Open the official release’s Assets list and choose a compiled installer or package. The cadcraft-web archive is a self-hostable browser application, not a desktop installer.',
      ],
      [
        'Do I need Rust or a user account?',
        'You do not need Rust to run a prebuilt desktop package, and local drawing does not require a cadcraft.org account. Building from source requires the toolchain and native dependencies documented at the release tag.',
      ],
      [
        'How do I verify a downloaded file?',
        'Download SHA256SUMS.txt from the same release, compute the package’s SHA-256 locally with the commands on this page, and compare the full digest with the matching asset entry. A matching checksum confirms the downloaded bytes match that entry.',
      ],
      [
        'Which drawing formats can I use?',
        'Desktop CADCraft reads ASCII DXF R12–2018 and binary DXF R13–2018, converts DWG through acadrust, and saves DXF/DWG 2000–2018. PDF plotting, SVG and PNG export are available. Compatibility varies by entity and file; retain originals and check the output.',
      ],
    ],
  },
  online: {
    paragraphs: [
      'CADCraft Online lets you try a CAD drawing workflow without installing a desktop package. Click the canvas, type a command, or open a DXF file to inspect and edit geometry. This site hosts the upstream WebAssembly editor and adds its own browser file handling, local autosave and optional Pro cloud storage. It is an independent host, not the official ArtCraft product site or an Autodesk service.',
      'Use a current desktop browser with WebAssembly and a working WebGPU or WebGL2 renderer. If graphics initialization fails, try CPU mode. The interface is designed around a mouse and keyboard; a phone-sized viewport is useful for a quick inspection but is not equivalent to a native Android application or a comfortable desktop drafting workspace. There is no APK download attached to this page.',
      'DXF is the editor’s working exchange format. This host also offers beta DWG import through a separate converter running on your device, limited to 20 MiB of DWG input. The converted drawing is edited and saved as DXF; this is not browser-native DWG editing or a promise of lossless conversion. Export PDF, SVG or PNG when you need a viewable result, and check dimensions, text and unsupported objects before sharing it. Free local autosave remains in this browser and can be lost when browser data is cleared. Save important work as files, follow a short tutorial with a sample, and compare the workflow’s limits with AutoCAD before relying on it for production.',
    ],
    faq: [
      [
        'Can I use the online editor without an account?',
        'Yes. Loading the editor, local drawing, file import and local file saving are available without a cadcraft.org account. Pro cloud drawing features are optional.',
      ],
      [
        'Are my DWG files uploaded for conversion?',
        'The beta DWG converter runs on your device. DWG input is limited to 20 MiB; converted DXF is separately bounded. A Pro cloud save is a separate action and does upload a drawing when you choose that feature.',
      ],
      [
        'Does the browser save edited drawings as DWG?',
        'This site’s browser DWG workflow converts the input to DXF and saves a DXF copy. Use the desktop application when you need its DWG conversion workflow, and check round-trip fidelity rather than overwriting your only original.',
      ],
      [
        'What should I do if the editor stays blank?',
        'Try the WebGL2 or CPU renderer controls, a current desktop browser and compatible graphics drivers. A file that opens in the desktop application may still exceed browser resource or converter limits.',
      ],
      [
        'Can I use CADCraft Online on Android?',
        'You can test the browser page on a phone, but the interface is designed for a mouse and keyboard. A browser view is not an official native Android APK. The checked release asset list does not contain an APK.',
      ],
      [
        'Where are free autosaved drawings stored?',
        'They remain in this browser on this device. The free interface keeps the recent drawings described on the page; clearing browser data can remove them. Save important drawings to files rather than relying on browser storage alone.',
      ],
      [
        'Which exports can I share?',
        'Use DXF for a drawing exchange copy, or PDF, SVG and PNG for viewable output. Inspect the result: export availability does not guarantee every imported entity, font or layout survives conversion unchanged.',
      ],
    ],
  },
};

export function guideFaqJsonLd(page: GuidePage) {
  const copy = guideCopy[page];
  if (!copy?.faq.length) return undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: copy.faq.map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };
}
