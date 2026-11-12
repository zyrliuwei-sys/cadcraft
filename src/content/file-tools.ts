import { MAX_DWG_BYTES, MAX_DXF_BYTES } from '@/lib/dwg-format';
import { faqAnswerText } from '@/lib/faq-links';

export const dwgLimit = MAX_DWG_BYTES / 1024 / 1024;
export const dxfLimit = MAX_DXF_BYTES / 1024 / 1024;
export type FileToolKind = 'dxf' | 'pdf';
export const fileToolCopy = {
  dxf: {
    path: '/dxf-viewer',
    title: 'DXF Viewer — Free, Online & No Sign-In',
    h1: 'DXF viewer',
    description:
      'Open DXF files for free directly in your browser, without signing up. View ASCII R12–2018 and binary R13–2018 drawings locally on your device.',
    lead: 'Choose a DXF for a read-only look, without opening an editor.',
    limits: `Up to ${dxfLimit} MB per DXF, matching the online editor. No upload or sign-in.`,
    accept: '.dxf',
    choose: 'Choose DXF file',
    drop: 'Drop a DXF file here',
    change: 'Choose another DXF',
    phases: {
      loading: 'Loading the local DXF reader…',
      converting: 'Reading your drawing…',
      opening: 'Opening DXF on this device…',
      exporting: 'Preparing the read-only preview…',
    },
  },
  pdf: {
    path: '/dwg-to-pdf',
    title: 'DWG to PDF — Free Browser Converter (Beta)',
    h1: 'DWG to PDF',
    description:
      'Convert DWG to PDF for free in your browser, without signing up. Beta local conversion for single DWG files up to 20 MB. Download your PDF on this page.',
    lead: 'Turn one drawing into a downloadable PDF, right here. Browser conversion is in beta.',
    limits: `DWG beta: up to ${dwgLimit} MB. DXF: up to ${dxfLimit} MB. One file at a time; no upload or sign-in.`,
    accept: '.dwg,.dxf',
    choose: 'Choose DWG or DXF',
    drop: 'Drop a DWG or DXF file here',
    change: 'Convert another drawing',
    phases: {
      loading: 'Loading the local CADCraft plotter…',
      converting: 'Converting DWG locally (beta)…',
      opening: 'Reading the drawing…',
      exporting: 'Creating your vector PDF…',
    },
  },
} as const;

export const toolErrors: Record<string, string> = {
  file_type: 'Choose a drawing with the file extension shown above.',
  invalid:
    'This drawing could not be read. Check that it is a complete, valid CAD file.',
  version:
    'Unsupported format revision. DWG requires R13–2018; DXF accepts ASCII R12–2018 or binary R13–2018. Binary R12 DXF cannot be read.',
  too_large: `Browser limits are ${dwgLimit} MB for DWG and ${dxfLimit} MB for DXF. Use the desktop app for larger files.`,
  empty:
    'No supported model-space geometry was found. Check the drawing in the desktop app; paper-space-only and unsupported objects may not produce a preview.',
  engine:
    'The local CADCraft engine could not start or read this drawing. Use a current browser with WebAssembly and WebGL2, or try the desktop app.',
  conversion:
    'DWG conversion failed. The file may be damaged or contain unsupported objects. Keep the original and try the desktop app.',
  reader_failed:
    'The DWG reader could not load. Check your connection and try again.',
  export:
    'A valid output could not be created. Try a simpler drawing, check its fonts and layouts, or use the desktop app.',
  timeout:
    'The drawing took too long to process. Try a smaller file or the desktop app.',
  cancelled: 'Processing cancelled. Choose a drawing to try again.',
};

export const dxfVersions = [
  ['AC1009', 'R12', 'Yes', 'No — R12 binary is not supported'],
  ['AC1012', 'R13', 'Yes', 'Yes'],
  ['AC1014', 'R14', 'Yes', 'Yes'],
  ['AC1015', '2000', 'Yes', 'Yes'],
  ['AC1018', '2004', 'Yes', 'Yes'],
  ['AC1021', '2007', 'Yes', 'Yes'],
  ['AC1024', '2010', 'Yes', 'Yes'],
  ['AC1027', '2013', 'Yes', 'Yes'],
  ['AC1032', '2018', 'Yes', 'Yes'],
];
export const fileToolFaq: Record<FileToolKind, [string, string][]> = {
  dxf: [
    [
      'Can I view a DXF on my phone?',
      'A current mobile browser with WebAssembly and WebGL2 can try small drawings. Drag to pan, pinch or use the zoom buttons. Large files can exhaust phone memory; use a desktop browser for complex drawings.',
    ],
    [
      'Will my DXF be uploaded?',
      'No. The existing CADCraft reader and plotter run on your device. The page downloads application assets but does not send your drawing to a server or store it in a cloud account.',
    ],
    [
      'What if the DXF will not open or looks blank?',
      'Check the ASCII/binary format and version first: binary R12 is unsupported. Use Fit drawing after zooming. This viewer shows 2D model-space geometry, so a paper-space-only file or unsupported objects can look empty. If the reader fails, check WebAssembly/WebGL2 support or inspect the file in the [desktop app](/download).',
    ],
    [
      'What is the maximum DXF file size?',
      `The input limit is ${dxfLimit} MB (${MAX_DXF_BYTES.toLocaleString('en-US')} bytes), using the same limit as the online editor. Device memory can impose a lower practical limit. The ${dwgLimit} MB DWG limit is for DWG input, not DXF.`,
    ],
  ],
  pdf: [
    [
      'Can I batch-convert DWG or DXF to PDF?',
      'This browser tool handles one drawing at a time. For batch DWG to PDF or DXF to PDF, use the [desktop download](/download) and cadcraft-cli. The desktop workflow does not have this host’s 20 MB DWG browser cap; available memory and file complexity still matter.',
    ],
    [
      'Why did my fonts change in the PDF?',
      'Missing SHX fonts use a substitute stroke font, so widths and line wrapping may change. SHX text becomes lines and is not searchable. TrueType/OpenType text can remain searchable when the font can be embedded; unavailable fonts or fallback outlining can change that. Set FONTALT to a suitable TrueType font in the editor or desktop app before exporting when you need a particular substitute.',
    ],
    [
      'What should I do if conversion fails?',
      'Check that the DWG is complete, uses R13–2018 format, and is no larger than 20 MB. This beta imports DWG locally and plots a model-space PDF; custom objects, missing fonts, complex files and layout-only content may fail or differ. Keep the original, check the output, and use the [desktop workflow](/download) for larger files, batch jobs or layout/page-setup control.',
    ],
  ],
};

export function fileToolFaqSchema(kind: FileToolKind) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: fileToolFaq[kind].map(([name, text]) => ({
      '@type': 'Question',
      name,
      acceptedAnswer: { '@type': 'Answer', text: faqAnswerText(text) },
    })),
  };
}
