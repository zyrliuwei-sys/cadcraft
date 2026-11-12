import { MAX_DWG_BYTES, MAX_DXF_BYTES } from '@/lib/dwg-format';
import { faqAnswerText } from '@/lib/faq-links';

import translations from './dwg-viewer-translations.json';

export const localizedViewerBody = {
  'pt-BR': {
    intro: [
      'Use esta página para visualizar; para modificar a geometria ou salvar uma cópia, use o ',
      'editor online',
      ' ou o ',
      'download para desktop',
      '.',
    ],
    versionsTitle: 'Versões DWG compatíveis',
    versionsDescription:
      'O leitor aceita R13 até o formato DWG 2018. O código identifica o formato salvo, não o ano em que o arquivo foi enviado. R13/R14 constam como compatíveis, mas ainda não foram totalmente testados.',
    columns: ['Código do arquivo', 'Formato DWG', 'Visualização no navegador'],
    firstCode: 'AC1009 ou anterior',
    firstVersion: 'R12 e anteriores',
    support: [
      'Não compatível',
      'Compatibilidade prevista; testes incompletos',
      'Compatível com a visualização',
    ],
    comparisonTitle: 'Visualizador DWG ou editor online?',
    comparisonColumns: ['Visualizador DWG', 'Editor online'],
    comparison: [
      [
        'Confira um DWG recebido sem começar um trabalho de edição.',
        'Crie ou altere a geometria e trabalhe com camadas e cotas.',
      ],
      [
        'Visualização 2D somente leitura, com movimento, zoom e ajuste do desenho.',
        'Linha de comando CAD, ferramentas de desenho e salvamento local.',
      ],
      [
        'Converte DWG localmente apenas para exibir; nenhum desenho é salvo ou sobrescrito.',
        'Importa DWG/DXF e edita ou salva uma cópia DXF; use o desktop para salvar DWG.',
      ],
      [
        'Não exige conta para visualizar um arquivo local.',
        'Não exige conta para desenhar localmente; a nuvem é opcional.',
      ],
    ],
    faqTitle: 'Dúvidas sobre o visualizador de DWG',
    faq: [
      [
        'Meu DWG antigo vai abrir?',
        'O leitor aceita DWG R13–2018 (AC1012–AC1032). R13/R14 constam como compatíveis, mas os testes ainda não são completos. R12 (AC1009) e anteriores não são compatíveis. O resultado depende das entidades, fontes e objetos do desenho.',
      ],
      [
        'Preciso enviar o desenho ou criar uma conta?',
        'Não. A conversão e a visualização acontecem neste dispositivo; o arquivo não é enviado nem salvo em uma conta. O navegador baixa apenas o leitor, o visualizador e as fontes. O limite de entrada é 20 MB por DWG, igual ao editor online.',
      ],
      [
        'Dá para conferir um DWG no celular?',
        'Você pode tentar desenhos pequenos em um navegador atualizado com WebAssembly e WebGL2. Arraste para mover e use dois dedos para ampliar. A memória e os recursos gráficos variam; prefira um computador para desenhos maiores ou complexos.',
      ],
      [
        'Consigo alterar o desenho nesta página?',
        'Aqui o desenho é somente leitura. Para alterar a geometria ou salvar uma cópia, use o [editor online](/online), que importa DWG localmente e edita/salva em DXF. Para o fluxo desktop com DWG, veja o [download](/pt/download).',
      ],
    ],
  },
  'it-IT': {
    intro: [
      'Usa questa pagina per vedere un disegno; per modificare la geometria o salvarne una copia, passa all’',
      'editor online',
      ' oppure al ',
      'download desktop',
      '.',
    ],
    versionsTitle: 'Versioni DWG supportate',
    versionsDescription:
      'Il lettore accetta i formati da R13 a DWG 2018. Il codice indica il formato del file salvato, non l’anno in cui è stato inviato. R13/R14 sono elencati come supportati, ma non sono ancora completamente testati.',
    columns: ['Codice del file', 'Formato DWG', 'Anteprima nel browser'],
    firstCode: 'AC1009 o precedente',
    firstVersion: 'R12 e precedenti',
    support: [
      'Non supportato',
      'Supporto dichiarato; test non completi',
      'Supportato per l’anteprima',
    ],
    comparisonTitle: 'Visualizzatore DWG o editor online?',
    comparisonColumns: ['Visualizzatore DWG', 'Editor online'],
    comparison: [
      [
        'Controlla un DWG ricevuto senza iniziare una sessione di disegno.',
        'Crea o modifica la geometria, i layer e le quote.',
      ],
      [
        'Anteprima 2D in sola lettura con spostamento, zoom e adattamento al disegno.',
        'Riga di comando CAD, strumenti di disegno e salvataggio locale.',
      ],
      [
        'Converte il DWG localmente soltanto per l’anteprima, senza salvare o sovrascrivere il disegno.',
        'Importa DWG/DXF e modifica o salva una copia DXF; il salvataggio DWG è disponibile nel flusso desktop.',
      ],
      [
        'Non serve un account per vedere un file locale.',
        'Non serve un account per disegnare localmente; il cloud è facoltativo.',
      ],
    ],
    faqTitle: 'Domande sul visualizzatore DWG',
    faq: [
      [
        'Posso aprire un DWG di una vecchia versione?',
        'Il lettore accetta DWG R13–2018 (AC1012–AC1032). Il supporto R13/R14 è dichiarato, ma non completamente testato. R12 (AC1009) e precedenti non sono supportati. La fedeltà della conversione dipende da entità, caratteri e oggetti del disegno.',
      ],
      [
        'Il file viene inviato a un server?',
        'No. DWG viene convertito e visualizzato su questo dispositivo, senza caricamento su server né salvataggio in un account. Il browser scarica il lettore, il visualizzatore e i caratteri. Il limite DWG è 20 MB, come nell’editor online.',
      ],
      [
        'Si può usare dal telefono?',
        'Puoi provare un disegno piccolo in un browser recente con WebAssembly e WebGL2. Trascina per spostarti e usa due dita per lo zoom. Memoria e capacità grafiche dipendono dal dispositivo; per file grandi o complessi è consigliato un computer.',
      ],
      [
        'Posso modificare o salvare il DWG qui?',
        'Questa pagina è in sola lettura. Per modificare la geometria o salvare una copia, usa l’[editor online](/online), che importa DWG localmente e modifica/salva copie DXF. Per il flusso DWG desktop, usa il [download](/it/download).',
      ],
    ],
  },
  'de-DE': {
    intro: [
      'Diese Seite dient zum Ansehen. Zum Bearbeiten der Geometrie oder Speichern einer Kopie nutzen Sie den ',
      'Online-Editor',
      ' oder den ',
      'Desktop-Download',
      '.',
    ],
    versionsTitle: 'Unterstützte DWG-Versionen',
    versionsDescription:
      'Der Leser akzeptiert R13 bis zum DWG-Format 2018. Der Code beschreibt das gespeicherte Dateiformat, nicht das Versandjahr. R13/R14 sind als unterstützt aufgeführt, aber noch nicht vollständig getestet.',
    columns: ['Dateicode', 'DWG-Format', 'Vorschau im Browser'],
    firstCode: 'AC1009 oder älter',
    firstVersion: 'R12 und älter',
    support: [
      'Nicht unterstützt',
      'Unterstützung angegeben; nicht vollständig getestet',
      'Für die Vorschau unterstützt',
    ],
    comparisonTitle: 'DWG-Viewer oder Online-Editor?',
    comparisonColumns: ['DWG-Viewer', 'Online-Editor'],
    comparison: [
      [
        'Eine erhaltene DWG prüfen, ohne eine Zeichenbearbeitung zu beginnen.',
        'Geometrie erstellen oder ändern sowie Layer und Bemaßungen bearbeiten.',
      ],
      [
        'Schreibgeschützte 2D-Vorschau mit Verschieben, Zoom und Einpassen.',
        'CAD-Befehlszeile, Zeichenwerkzeuge und lokale Dateispeicherung.',
      ],
      [
        'Konvertiert DWG nur lokal für die Vorschau. Zeichnungen werden weder gespeichert noch überschrieben.',
        'Importiert DWG/DXF und bearbeitet oder speichert eine DXF-Kopie; DWG-Speicherung erfolgt im Desktop-Arbeitsablauf.',
      ],
      [
        'Für die Ansicht einer lokalen Datei ist kein Konto nötig.',
        'Für lokales Zeichnen ist kein Konto nötig; Cloud-Funktionen sind optional.',
      ],
    ],
    faqTitle: 'Fragen zum DWG-Viewer',
    faq: [
      [
        'Lassen sich auch ältere DWG-Dateien öffnen?',
        'Der Browser-Leser akzeptiert DWG R13–2018 (AC1012–AC1032). R13/R14 sind als unterstützt angegeben, aber noch nicht vollständig getestet. R12 (AC1009) und älter werden nicht unterstützt. Die Dateitreue hängt von Objekten und Schriften der Zeichnung ab.',
      ],
      [
        'Bleibt die Zeichnung auf meinem Rechner?',
        'Ja. Die DWG wird auf diesem Gerät konvertiert und angezeigt, nicht auf einen Server hochgeladen oder in einem Konto gespeichert. Der Browser lädt Leser, Viewer und Schriftdateien herunter. Wie im Online-Editor gilt ein DWG-Eingabelimit von 20 MB.',
      ],
      [
        'Kann ich eine DWG auf dem Smartphone ansehen?',
        'Kleine Zeichnungen können Sie in einem aktuellen Browser mit WebAssembly und WebGL2 ausprobieren. Ziehen verschiebt die Ansicht, zwei Finger zoomen. Speicher und Grafikleistung unterscheiden sich je nach Gerät. Für große oder komplexe Zeichnungen empfiehlt sich ein Desktop-Browser.',
      ],
      [
        'Kann ich die DWG hier ändern oder speichern?',
        'Diese Seite ist nur zum Ansehen gedacht. Zum Bearbeiten oder Speichern einer Kopie verwenden Sie den [Online-Editor](/online), der DWG lokal importiert und DXF-Kopien bearbeitet/speichert. Für den Desktop-Arbeitsablauf mit DWG nutzen Sie den [Download](/de/download).',
      ],
    ],
  },
};

export function localizedDwgContent(locale: string) {
  if (!Object.hasOwn(localizedViewerBody, locale)) return null;
  const body = localizedViewerBody[locale as keyof typeof localizedViewerBody];
  const raw = translations[locale as keyof typeof translations];
  const copy = JSON.parse(
    JSON.stringify(raw)
      .replaceAll('{limit}', String(MAX_DWG_BYTES / 1024 / 1024))
      .replaceAll('{dxfLimit}', String(MAX_DXF_BYTES / 1024 / 1024))
  ) as typeof raw;
  return {
    copy,
    body,
    faqSchema: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: body.faq.map(([name, text]) => ({
        '@type': 'Question',
        name,
        acceptedAnswer: { '@type': 'Answer', text: faqAnswerText(text) },
      })),
    },
  };
}
