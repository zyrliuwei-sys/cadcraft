import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';

const copy = {
  en: {
    preview: (app: string) =>
      `Your account is ready — start drafting with CADCraft on ${app}`,
    heading: (app: string) => `Welcome to ${app}`,
    greeting: (name?: string) => (name ? `Hi ${name},` : 'Hi there,'),
    intro:
      'Your account is ready. CADCraft is a free, open-source AutoCAD-style drafting app — you can use it right in your browser, or download it for Windows, macOS, Linux or FreeBSD.',
    stepsTitle: 'Get started',
    steps: [
      'Open CADCraft online — no install needed.',
      'Type a command such as LINE or CIRCLE and press Enter.',
      'Follow the beginner tutorials to learn editing, layers and export.',
    ],
    credits: (n: number) =>
      `We've added ${n.toLocaleString('en-US')} free credits to your account.`,
    cta: 'Open CADCraft online',
    footer: (app: string) =>
      `You're receiving this email because you created an account on ${app}.`,
  },
  zh: {
    preview: (app: string) => `账号已就绪，在 ${app} 开始用 CADCraft 画图`,
    heading: (app: string) => `欢迎来到 ${app}`,
    greeting: (name?: string) => (name ? `${name}，你好：` : '你好：'),
    intro:
      '你的账号已经准备好了。CADCraft 是一款免费开源的 AutoCAD 式制图软件，可以直接在浏览器里使用，也可以下载 Windows、macOS、Linux 或 FreeBSD 版。',
    stepsTitle: '快速上手',
    steps: [
      '打开 CADCraft 在线版，无需安装。',
      '输入 LINE 或 CIRCLE 等命令，按回车。',
      '跟着新手教程，学习编辑、图层和导出。',
    ],
    credits: (n: number) =>
      `我们已向你的账号赠送 ${n.toLocaleString('en-US')} 积分。`,
    cta: '打开 CADCraft 在线版',
    footer: (app: string) => `你收到这封邮件，是因为你在 ${app} 注册了账号。`,
  },
};

export function WelcomeEmail({
  appName = 'our app',
  logoUrl,
  url,
  name,
  credits,
  locale = 'en',
}: {
  appName?: string;
  logoUrl?: string;
  /** Where the main button goes. */
  url: string;
  name?: string;
  /** Signup credits granted, if any — omitted from the copy when 0. */
  credits?: number;
  locale?: string;
}) {
  const t = locale.startsWith('zh') ? copy.zh : copy.en;
  return (
    <Html>
      <Head />
      <Preview>{t.preview(appName)}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.card}>
            <Section style={styles.accentBar} />
            <Section style={styles.brandRow}>
              {logoUrl ? (
                <Img
                  src={logoUrl}
                  width="40"
                  height="40"
                  alt={appName}
                  style={styles.cardLogo}
                />
              ) : null}
              <Text style={styles.cardBrand}>{appName}</Text>
            </Section>
            <Heading style={styles.h1}>{t.heading(appName)}</Heading>
            <Text style={styles.p}>{t.greeting(name)}</Text>
            <Text style={styles.p}>{t.intro}</Text>

            <Text style={styles.stepsTitle}>{t.stepsTitle}</Text>
            {t.steps.map((step, i) => (
              <Text key={i} style={styles.step}>
                <span style={styles.stepNum}>{i + 1}</span>
                {step}
              </Text>
            ))}

            <Section style={styles.buttonWrap}>
              <Button href={url} style={styles.button}>
                {t.cta}
              </Button>
            </Section>

            {credits && credits > 0 ? (
              <Section style={styles.perks}>
                <Text style={styles.perk}>
                  {'🎁\u00a0\u00a0'}
                  {t.credits(credits)}
                </Text>
              </Section>
            ) : null}

            <Hr style={styles.hr} />

            <Text style={styles.footer}>{t.footer(appName)}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles: Record<string, React.CSSProperties> = {
  body: {
    margin: 0,
    padding: 0,
    backgroundColor: '#f6f9fc',
    fontFamily:
      '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Inter,Helvetica,Arial,sans-serif',
    color: '#0f172a',
  },
  container: {
    maxWidth: 560,
    margin: '0 auto',
    padding: '32px 16px 40px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: '28px 24px',
    border: '1px solid rgba(15, 23, 42, 0.08)',
    boxShadow:
      '0 20px 50px rgba(2, 6, 23, 0.10), 0 2px 8px rgba(2, 6, 23, 0.05)',
  },
  accentBar: {
    height: 6,
    borderRadius: 999,
    marginBottom: 18,
    background: 'linear-gradient(90deg, #f97316 0%, #fb923c 55%, #fdba74 100%)',
  },
  brandRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  cardLogo: {
    borderRadius: 10,
    border: '1px solid rgba(15, 23, 42, 0.10)',
    backgroundColor: 'rgba(15, 23, 42, 0.03)',
  },
  cardBrand: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: '18px',
    fontWeight: 600,
    color: '#0f172a',
    letterSpacing: '-0.01em',
  },
  h1: {
    margin: '0 0 14px',
    fontSize: 24,
    lineHeight: '30px',
    fontWeight: 700,
    letterSpacing: '-0.01em',
  },
  p: {
    margin: '0 0 12px',
    fontSize: 14,
    lineHeight: '22px',
    color: '#334155',
  },
  buttonWrap: {
    textAlign: 'center',
    margin: '20px 0 14px',
  },
  button: {
    backgroundColor: '#ea580c',
    borderRadius: 12,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 600,
    textDecoration: 'none',
    padding: '12px 18px',
    display: 'inline-block',
  },
  stepsTitle: {
    margin: '20px 0 8px',
    fontSize: 13,
    lineHeight: '18px',
    fontWeight: 700,
    color: '#0f172a',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  step: {
    margin: '0 0 8px',
    fontSize: 14,
    lineHeight: '22px',
    color: '#334155',
  },
  stepNum: {
    display: 'inline-block',
    width: 22,
    height: 22,
    marginRight: 10,
    borderRadius: 999,
    backgroundColor: '#f97316',
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 700,
    lineHeight: '22px',
    textAlign: 'center',
  },
  perks: {
    backgroundColor: '#fff7ed',
    borderRadius: 12,
    padding: '12px 16px',
    margin: '6px 0 14px',
  },
  perk: {
    margin: '4px 0',
    fontSize: 13,
    lineHeight: '20px',
    color: '#7c2d12',
  },
  small: {
    margin: '0 0 6px',
    fontSize: 12,
    lineHeight: '18px',
    color: '#64748b',
    textAlign: 'center',
  },
  link: {
    color: '#ea580c',
    textDecoration: 'underline',
  },
  hr: {
    borderColor: 'rgba(15, 23, 42, 0.08)',
    margin: '18px 0',
  },
  footer: {
    margin: 0,
    fontSize: 12,
    lineHeight: '18px',
    color: '#94a3b8',
  },
};
