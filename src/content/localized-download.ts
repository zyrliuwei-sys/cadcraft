/** Body/FAQ translations only; the full installation template and release URLs are shared. */
export const localizedDownloadGuides: Record<
  string,
  { paragraphs: string[]; faq: [string, string][] }
> = {
  'pt-BR': {
    paragraphs: [
      'Esta página ajuda você a escolher o download oficial do CADCraft, instalar no sistema correto e conferir o pacote antes de abrir um desenho. O aplicativo para desktop é gratuito e de código aberto. Os recursos opcionais de nuvem Pro vendidos pelo cadcraft.org são separados do software original e não são necessários para usar uma instalação local.',
      'A versão indicada oferece instaladores e arquivos portáteis para Windows em várias arquiteturas, um DMG universal para macOS, pacotes Linux para as arquiteturas compatíveis e arquivos para FreeBSD. Escolha a arquitetura do seu computador: um pacote Linux aarch64 não substitui um download x86_64. Confira os arquivos da versão e o SHA256SUMS.txt, em vez de baixar por engano o ZIP do código-fonte do repositório. Rust só é necessário para compilar, não para executar um instalador pronto.',
      'Para desenho no desktop, o CADCraft lê DXF ASCII R12–2018 e binário R13–2018. A conversão de DWG usa acadrust e tem limites de fidelidade; há impressão em PDF e exportação para SVG e PNG. Guarde os originais e confira os arquivos convertidos. As versões desktop precisam de fontes e drivers gráficos compatíveis; a edição de navegador exige WebAssembly e um renderizador compatível, com modo CPU como alternativa. Não prometemos um requisito mínimo de RAM sem verificação. Siga as etapas da sua plataforma e reproduza um desenho pequeno com os tutoriais antes de confiar um arquivo de trabalho ao programa.',
    ],
    faq: [
      [
        'O download para desktop é gratuito?',
        'Sim. O aplicativo original é de código aberto, sob MIT OR Apache-2.0. A assinatura Pro do cadcraft.org é opcional e cobre os recursos de nuvem deste site, não uma licença do aplicativo desktop.',
      ],
      [
        'Qual pacote corresponde ao meu computador?',
        'Escolha o instalador ou arquivo portátil Windows para o seu processador, o DMG universal no macOS ou o pacote Linux/FreeBSD da sua arquitetura. O link rápido do Linux é Flatpak x86_64; os pacotes ARM64 são arquivos separados da versão.',
      ],
      [
        'O ZIP do código-fonte instala o CADCraft?',
        'Não. O ZIP do repositório contém código-fonte. Na página da versão oficial, abra a lista de arquivos e escolha um instalador ou pacote compilado. O arquivo cadcraft-web contém a aplicação de navegador para hospedar, não um instalador desktop.',
      ],
      [
        'Preciso instalar Rust ou criar uma conta?',
        'Não é preciso Rust para executar um pacote já compilado, e desenhar localmente não exige conta no cadcraft.org. Para compilar a partir do código-fonte, use as ferramentas e dependências nativas documentadas para a versão escolhida.',
      ],
      [
        'Como conferir se o download está íntegro?',
        'Baixe o SHA256SUMS.txt da mesma versão, calcule o SHA-256 do pacote com os comandos desta página e compare o hash completo com a linha do arquivo correspondente. Valores iguais confirmam que os bytes baixados correspondem àquele registro.',
      ],
      [
        'Quais formatos de desenho posso usar?',
        'O CADCraft desktop lê DXF ASCII R12–2018 e binário R13–2018, converte DWG com acadrust e salva DXF/DWG 2000–2018. Há impressão em PDF e exportação para SVG e PNG. A compatibilidade depende das entidades e do arquivo; preserve o original e confira o resultado.',
      ],
    ],
  },
  'it-IT': {
    paragraphs: [
      'Questa pagina ti aiuta a scegliere un download ufficiale di CADCraft, installarlo sul sistema giusto e verificare il pacchetto prima di aprire un disegno. L’applicazione desktop è gratuita e a codice aperto. Le funzioni cloud Pro facoltative vendute da cadcraft.org sono separate dal software originale e non servono per usare un’installazione locale.',
      'La versione indicata offre installer e archivi portatili Windows per diverse architetture, un DMG universale macOS, pacchetti Linux per le architetture supportate e archivi FreeBSD. Scegli l’architettura del tuo computer: un pacchetto Linux aarch64 non sostituisce un download x86_64. Controlla l’elenco dei file della versione e SHA256SUMS.txt, anziché scaricare per errore lo ZIP dei sorgenti. Rust serve per compilare, non per eseguire un pacchetto già pronto.',
      'Per il disegno desktop, CADCraft legge DXF ASCII R12–2018 e binario R13–2018. La conversione DWG usa acadrust e presenta limiti di fedeltà; sono disponibili stampa PDF ed esportazioni SVG e PNG. Conserva gli originali e controlla i file convertiti. Le versioni desktop richiedono driver grafici e caratteri compatibili; la versione browser richiede WebAssembly e un sistema di rendering supportato, con modalità CPU disponibile per compatibilità. Non viene promesso un requisito minimo di RAM non verificato. Segui i passaggi per la tua piattaforma e riproduci un piccolo disegno con le lezioni prima di affidare al programma un file di lavoro.',
    ],
    faq: [
      [
        'Il download desktop è gratuito?',
        'Sì. L’applicazione originale è a codice aperto con licenza MIT OR Apache-2.0. L’abbonamento Pro di cadcraft.org è facoltativo e riguarda le funzioni cloud del sito, non una licenza desktop.',
      ],
      [
        'Quale pacchetto va bene per il mio computer?',
        'Scegli l’installer o l’archivio portatile Windows adatto al processore, il DMG universale macOS oppure il pacchetto Linux/FreeBSD per la tua architettura. Il collegamento rapido Linux è Flatpak x86_64; i pacchetti ARM64 sono file separati della versione.',
      ],
      [
        'Lo ZIP dei sorgenti installa CADCraft?',
        'No. Lo ZIP del repository contiene il codice sorgente. Apri l’elenco dei file della versione ufficiale e scegli un installer o pacchetto compilato. L’archivio cadcraft-web contiene l’applicazione browser da ospitare, non un installer desktop.',
      ],
      [
        'Servono Rust o un account?',
        'Non serve Rust per eseguire un pacchetto precompilato e il disegno locale non richiede un account cadcraft.org. Per compilare dal sorgente servono la toolchain e le dipendenze native documentate per la versione scelta.',
      ],
      [
        'Come verifico il file scaricato?',
        'Scarica SHA256SUMS.txt dalla stessa versione, calcola localmente lo SHA-256 del pacchetto con i comandi di questa pagina e confronta l’intero valore con la voce del file corrispondente. Se coincidono, i byte scaricati corrispondono a quella voce.',
      ],
      [
        'Quali formati di disegno sono supportati?',
        'CADCraft desktop legge DXF ASCII R12–2018 e binario R13–2018, converte DWG tramite acadrust e salva DXF/DWG 2000–2018. Sono disponibili stampa PDF ed esportazioni SVG e PNG. La compatibilità varia in base alle entità e al file: conserva gli originali e verifica il risultato.',
      ],
    ],
  },
  'de-DE': {
    paragraphs: [
      'Diese Seite hilft Ihnen, einen offiziellen CADCraft-Download auszuwählen, ihn auf dem richtigen Betriebssystem zu installieren und das Paket vor dem Öffnen einer Zeichnung zu prüfen. Die Desktop-Anwendung ist kostenlos und quelloffen. Die optionalen Pro-Cloud-Funktionen von cadcraft.org sind vom ursprünglichen Programm getrennt und für eine lokale Installation nicht erforderlich.',
      'Die verlinkte Version enthält Windows-Installationsprogramme und portable Archive für mehrere Prozessorarchitekturen, ein universelles macOS-DMG, Linux-Pakete für unterstützte Architekturen sowie FreeBSD-Archive. Wählen Sie die Architektur Ihres Computers: Ein aarch64-Linux-Paket ersetzt keinen x86_64-Download. Prüfen Sie die Dateiliste der Veröffentlichung und SHA256SUMS.txt, statt versehentlich das Quellcode-ZIP des Repositorys herunterzuladen. Rust wird zum Kompilieren benötigt, nicht zum Ausführen eines fertigen Pakets.',
      'Für Desktop-Zeichnungen liest CADCraft ASCII-DXF R12–2018 und binäres DXF R13–2018. Die DWG-Konvertierung verwendet acadrust und hat Grenzen bei der Dateitreue; PDF-Ausgabe sowie SVG- und PNG-Export sind verfügbar. Bewahren Sie Originale auf und prüfen Sie konvertierte Dateien. Desktop-Versionen benötigen passende Grafiktreiber und Schriften; die Browser-Ausgabe benötigt WebAssembly und einen unterstützten Renderer, bei Bedarf mit CPU-Modus. Eine ungeprüfte Mindestanforderung an den Arbeitsspeicher wird hier nicht versprochen. Folgen Sie den Schritten für Ihr System und zeichnen Sie mithilfe der Anleitungen zunächst ein kleines Beispiel, bevor Sie dem Programm eine produktive Datei anvertrauen.',
    ],
    faq: [
      [
        'Ist der Desktop-Download kostenlos?',
        'Ja. Die ursprüngliche Desktop-Anwendung ist unter MIT OR Apache-2.0 quelloffen. Ein cadcraft.org-Pro-Abonnement ist optional und betrifft die Cloud-Funktionen dieser Website, nicht die Desktop-Lizenz.',
      ],
      [
        'Welcher Download passt zu meinem Computer?',
        'Wählen Sie das Windows-Installationsprogramm oder portable Archiv für Ihren Prozessor, das universelle macOS-DMG oder das Linux-/FreeBSD-Paket für Ihre Architektur. Der Linux-Direktlink führt zum x86_64-Flatpak; ARM64-Pakete sind separate Veröffentlichungsdateien.',
      ],
      [
        'Installiert das Quellcode-ZIP CADCraft?',
        'Nein. Das ZIP des Repositorys enthält den Quellcode. Öffnen Sie die Dateiliste der offiziellen Version und wählen Sie ein kompiliertes Installationsprogramm oder Paket. Das cadcraft-web-Archiv ist eine selbst hostbare Browser-Anwendung, kein Desktop-Installationsprogramm.',
      ],
      [
        'Brauche ich Rust oder ein Benutzerkonto?',
        'Für ein vorkompiliertes Desktop-Paket brauchen Sie kein Rust. Lokales Zeichnen erfordert auch kein cadcraft.org-Konto. Zum Kompilieren aus dem Quellcode benötigen Sie die für den jeweiligen Versionsstand dokumentierte Werkzeugkette und native Abhängigkeiten.',
      ],
      [
        'Wie überprüfe ich die heruntergeladene Datei?',
        'Laden Sie SHA256SUMS.txt aus derselben Veröffentlichung herunter, berechnen Sie die SHA-256-Prüfsumme des Pakets mit den Befehlen dieser Seite und vergleichen Sie den vollständigen Wert mit dem zugehörigen Dateieintrag. Stimmen die Werte überein, entsprechen die heruntergeladenen Bytes diesem Eintrag.',
      ],
      [
        'Welche Zeichnungsformate kann ich verwenden?',
        'CADCraft für den Desktop liest ASCII-DXF R12–2018 und binäres DXF R13–2018, konvertiert DWG über acadrust und speichert DXF/DWG 2000–2018. PDF-Ausgabe sowie SVG- und PNG-Export sind verfügbar. Die Kompatibilität hängt von Objekten und Datei ab. Bewahren Sie Originale auf und prüfen Sie die Ausgabe.',
      ],
    ],
  },
};
