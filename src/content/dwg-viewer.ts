import { MAX_DWG_BYTES, MAX_DXF_BYTES } from '@/lib/dwg-format';
import { faqAnswerText } from '@/lib/faq-links';

const limit = MAX_DWG_BYTES / (1024 * 1024);
const dxfLimit = MAX_DXF_BYTES / (1024 * 1024);

// English-only tool copy. File limits come from the same converter as /online.
export const dwgViewerCopy = {
  title: 'DWG Viewer — Free, Online & No Sign-In',
  description:
    'Open DWG files for free in your browser, without signing up. View drawings through the 2018 DWG format locally on your device.',
  h1: 'DWG viewer',
  lead: 'Open a DWG file for a quick, read-only look in your browser.',
  uploadTitle: 'Drop a DWG file here',
  choose: 'Choose DWG file',
  change: 'Choose another DWG',
  limits: `Up to ${limit} MB per DWG. No upload or sign-in.`,
  empty: 'No drawing selected',
  readOnly: 'Read-only preview',
  canvas: 'DWG drawing preview. Drag to pan; scroll or pinch to zoom.',
  fit: 'Fit drawing',
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  cancel: 'Cancel',
  ready: 'Preview ready',
  cancelled: 'Opening cancelled. Choose a DWG to try again.',
  hint: 'Drag to pan · Scroll or pinch to zoom',
  fidelity:
    '2D model-space preview. Fonts, layouts and unsupported objects may differ; keep the original DWG.',
  phases: {
    loading: 'Loading the local DWG reader…',
    converting: 'Reading your DWG on this device…',
    rendering: 'Preparing the drawing preview…',
  },
  errors: {
    file_type: 'Choose a .dwg file to view.',
    too_large: `This drawing exceeds the browser limit (${limit} MB DWG / ${dxfLimit} MB converted DXF). Try a smaller drawing or the desktop app.`,
    invalid: 'This is not a valid DWG file, or the file is incomplete.',
    version:
      'This DWG revision is not supported here. R12 (AC1009) and older files cannot be opened.',
    conversion:
      'This DWG could not be converted. The file may be damaged or contain unsupported objects.',
    reader_failed:
      'The local reader could not load. Check your connection and try again.',
    timeout:
      'The drawing took too long to open. Try a smaller drawing or the desktop app.',
    graphics:
      'The viewer needs WebGL2 graphics. Try a current desktop browser with hardware acceleration.',
    empty:
      'No previewable 2D geometry was found. This file may contain only unsupported objects or paper-space content.',
    preview:
      'The preview could not be rendered. Try another drawing or use the desktop app.',
  },
};

// Codes and format labels mirror /blog/how-to-open-dwg-file, including its caveats.
export const dwgViewerVersions = [
  ['AC1009 or lower', 'R12 and earlier', 'Not supported'],
  ['AC1012', 'R13', 'Listed support; not fully tested'],
  ['AC1014', 'R14', 'Listed support; not fully tested'],
  ['AC1015', '2000', 'Supported for preview'],
  ['AC1018', '2004', 'Supported for preview'],
  ['AC1021', '2007', 'Supported for preview'],
  ['AC1024', '2010', 'Supported for preview'],
  ['AC1027', '2013', 'Supported for preview'],
  ['AC1032', '2018', 'Supported for preview'],
];

export const dwgViewerFaq: [string, string][] = [
  [
    'Which DWG versions can I open?',
    'The browser reader accepts DWG R13 through the 2018 format (AC1012–AC1032). R13/R14 support is listed but not fully tested. R12 (AC1009) and earlier files are not supported. Conversion fidelity depends on the drawing’s entities, fonts and objects.',
  ],
  [
    'Will my drawing be uploaded to a server?',
    `No. Your DWG is converted and previewed on this device; the file is not uploaded or saved to an account. The browser downloads the reader, viewer and font assets. This uses the same ${limit} MB DWG input limit as the online editor.`,
  ],
  [
    'Can I use the DWG viewer on a phone?',
    'You can try a small drawing in a current mobile browser with WebAssembly and WebGL2 support. Drag to pan and pinch to zoom. Memory and graphics support vary by device; a desktop browser is recommended for larger or complex drawings.',
  ],
  [
    'Can I edit a DWG directly in this browser viewer?',
    'This page is for viewing only. To modify geometry or save a copy, use the [online editor](/online), which imports DWG locally and edits/saves DXF copies. Use the [desktop download](/download) for the desktop DWG workflow.',
  ],
];

export function dwgViewerFaqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: dwgViewerFaq.map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: faqAnswerText(answer) },
    })),
  };
}
