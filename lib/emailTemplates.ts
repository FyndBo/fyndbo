export interface NewsletterTemplate {
  name: string
  description: string
  subject: string
  preheader: string
  heading: string
  message: string
  ctaLabel: string
  ctaUrl: string
  heroUrl: string
}

export const DEFAULT_NEWSLETTER_HERO =
  'https://fyndbo.se/email-house.jpg'

export const NEWSLETTER_TEMPLATES: Record<
  string,
  NewsletterTemplate
> = {
  welcome: {
    name: 'Välkommen',
    description:
      'Ett varmt och personligt välkomstmail för nya prenumeranter.',
    subject:
      'Välkommen till FyndBo – du är med från början',
    preheader:
      'Tack för att du följer FyndBo redan innan lanseringen.',
    heading:
      'Välkommen till början på något nytt.',
    message:
      `Hej och varmt välkommen till FyndBo.

Tack för att du har valt att följa oss redan innan lanseringen. Du är med medan FyndBo fortfarande byggs, förbättras och tar form.

FyndBo skapas med en enkel idé: det ska vara lättare att hitta, förstå och jämföra bostäder.

Vi vill samla smart sökning, tydliga filter, en användbar karta och relevant bostadsinformation på ett ställe – utan att göra bostadssökandet mer komplicerat än det behöver vara.

Som prenumerant kommer du att vara bland de första som får veta när nya delar av FyndBo blir tillgängliga, vilka funktioner vi utvecklar och när vi närmar oss lansering.

Tack för att du är med från början.`,
    ctaLabel:
      'Upptäck FyndBo',
    ctaUrl:
      'https://fyndbo.se/om',
    heroUrl:
      DEFAULT_NEWSLETTER_HERO,
  },

  launch: {
    name: 'Lansering',
    description:
      'Ett större och mer exklusivt utskick inför lanseringen.',
    subject:
      'Snart öppnar FyndBo.se',
    preheader:
      'Den 23 november 2026 är den planerade lanseringen av FyndBo.',
    heading:
      'Snart öppnar vi dörrarna.',
    message:
      `Det som började som en idé börjar nu bli en riktig bostadsplattform.

Efter utveckling, tester och många förbättringar närmar sig FyndBo den planerade lanseringen den 23 november 2026.

Målet är att göra bostadssökandet mer överskådligt: tydligare sökning, bättre filter, en användbar karta och bostadsinformation som hjälper dig att jämföra alternativen.

Du som följer FyndBo redan nu är med före lanseringen och får våra viktigaste uppdateringar direkt.

Vi ser fram emot att snart kunna visa dig mer.`,
    ctaLabel:
      'Läs om FyndBo',
    ctaUrl:
      'https://fyndbo.se/om',
    heroUrl:
      DEFAULT_NEWSLETTER_HERO,
  },

  update: {
    name: 'Produktuppdatering',
    description:
      'Berätta om förbättringar, funktioner och utvecklingen av FyndBo.',
    subject:
      'Det här är nytt på FyndBo',
    preheader:
      'Nya förbättringar i sökning, karta och bostadsupplevelse.',
    heading:
      'FyndBo blir bättre, steg för steg.',
    message:
      `Vi fortsätter utveckla FyndBo med fokus på sådant som faktiskt gör bostadssökandet enklare.

Den senaste tiden har arbetet bland annat handlat om bostadssökningen, kartan, filtreringen, bostadssidorna och en bättre upplevelse på både mobil och dator.

Vi lägger stor vikt vid att tjänsten ska kännas snabb, tydlig och enkel att förstå – även när mängden bostäder och information växer.

Tack för att du följer utvecklingen. Vi har mycket mer på väg.`,
    ctaLabel:
      'Besök FyndBo',
    ctaUrl:
      'https://fyndbo.se',
    heroUrl:
      DEFAULT_NEWSLETTER_HERO,
  },

  properties: {
    name: 'Nya bostäder',
    description:
      'Ett bostadsfokuserat utskick som leder direkt till sökningen.',
    subject:
      'Nya bostäder att upptäcka på FyndBo',
    preheader:
      'Utforska nya bostäder och hitta fler alternativ på kartan.',
    heading:
      'Nya hem. Nya möjligheter.',
    message:
      `Det finns nya bostäder att upptäcka på FyndBo.

Använd sökningen för att hitta rätt område, filtrera efter det som är viktigt för dig och växla över till kartan när du vill få en bättre känsla för läget.

FyndBo är byggt för att göra det enklare att gå från många alternativ till de bostäder som faktiskt känns intressanta.

Kanske finns nästa hem redan där.`,
    ctaLabel:
      'Utforska bostäder',
    ctaUrl:
      'https://fyndbo.se/bostader',
    heroUrl:
      DEFAULT_NEWSLETTER_HERO,
  },
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function textToHtml(value: string) {
  return value
    .split(/\n\s*\n/)
    .map(
      (paragraph) =>
        `<p style="margin:0 0 18px;">${escapeHtml(
          paragraph.trim()
        ).replace(/\n/g, '<br>')}</p>`
    )
    .join('')
}

function featureRow(
  number: string,
  title: string,
  text: string
) {
  return `
    <tr>
      <td style="padding-bottom:12px;">
        <table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="
            background:#f8fafc;
            border:1px solid #e2e8f0;
            border-radius:14px;
          "
        >
          <tr>
            <td
              width="62"
              valign="top"
              style="padding:18px 0 18px 18px;"
            >
              <div
                style="
                  width:38px;
                  height:38px;
                  line-height:38px;
                  text-align:center;
                  background:#dbeafe;
                  color:#2563eb;
                  border-radius:11px;
                  font-family:Arial,Helvetica,sans-serif;
                  font-size:11px;
                  font-weight:800;
                "
              >
                ${escapeHtml(number)}
              </div>
            </td>

            <td
              valign="top"
              style="padding:18px 18px 18px 10px;"
            >
              <p
                style="
                  margin:0;
                  color:#0f172a;
                  font-family:Arial,Helvetica,sans-serif;
                  font-size:14px;
                  line-height:20px;
                  font-weight:700;
                "
              >
                ${escapeHtml(title)}
              </p>

              <p
                style="
                  margin:5px 0 0;
                  color:#64748b;
                  font-family:Arial,Helvetica,sans-serif;
                  font-size:13px;
                  line-height:20px;
                "
              >
                ${escapeHtml(text)}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `
}

function buildTemplateExtra(templateKey: string) {
  if (templateKey === 'welcome') {
    return `
      <table
        role="presentation"
        width="100%"
        cellspacing="0"
        cellpadding="0"
        border="0"
        style="
          margin-top:38px;
          background:#0f172a;
          border-radius:18px;
        "
      >
        <tr>
          <td style="padding:28px;">
            <p
              style="
                margin:0 0 8px;
                color:#60a5fa;
                font-family:Arial,Helvetica,sans-serif;
                font-size:10px;
                font-weight:700;
                letter-spacing:1.3px;
                text-transform:uppercase;
              "
            >
              VARFÖR FYNDBO?
            </p>

            <h2
              style="
                margin:0;
                color:#ffffff;
                font-family:Arial,Helvetica,sans-serif;
                font-size:22px;
                line-height:29px;
                font-weight:800;
              "
            >
              Ett enklare sätt att hitta hem.
            </h2>

            <p
              style="
                margin:14px 0 0;
                color:#94a3b8;
                font-family:Arial,Helvetica,sans-serif;
                font-size:14px;
                line-height:23px;
              "
            >
              FyndBo byggs för människor som söker bostad.
              Tydligare sökning, smartare karta och bättre
              överblick ska göra det lättare att hitta rätt.
            </p>
          </td>
        </tr>
      </table>

      <table
        role="presentation"
        width="100%"
        cellspacing="0"
        cellpadding="0"
        border="0"
        style="margin-top:36px;"
      >
        <tr>
          <td>
            <p
              style="
                margin:0 0 7px;
                color:#2563eb;
                font-family:Arial,Helvetica,sans-serif;
                font-size:10px;
                font-weight:700;
                letter-spacing:1.2px;
                text-transform:uppercase;
              "
            >
              DU SOM FÖLJER OSS
            </p>

            <h2
              style="
                margin:0 0 22px;
                color:#0f172a;
                font-family:Arial,Helvetica,sans-serif;
                font-size:23px;
                line-height:30px;
                font-weight:800;
              "
            >
              Det här kan du förvänta dig.
            </h2>
          </td>
        </tr>

        ${featureRow(
          '01',
          'Viktiga nyheter först',
          'Du får veta när större funktioner, förändringar och lanseringsnyheter är på väg.'
        )}

        ${featureRow(
          '02',
          'Följ resan från början',
          'Du får följa hur FyndBo utvecklas från en växande idé till en komplett bostadsplattform.'
        )}

        ${featureRow(
          '03',
          'Fokus på bostadssökningen',
          'Vi arbetar med kartor, filter, sökning och information som ska göra det lättare att hitta rätt.'
        )}
      </table>

      ${launchDateBox()}
    `
  }

  if (templateKey === 'launch') {
    return `
      <table
        role="presentation"
        width="100%"
        cellspacing="0"
        cellpadding="0"
        border="0"
        style="margin-top:36px;"
      >
        ${featureRow(
          '01',
          'Sök tydligare',
          'Filtrera fram bostäder utifrån det som faktiskt är viktigt för dig.'
        )}

        ${featureRow(
          '02',
          'Utforska på karta',
          'Se bostäderna i sitt geografiska sammanhang och upptäck fler områden.'
        )}

        ${featureRow(
          '03',
          'Jämför enklare',
          'Få en mer sammanhållen överblick när du tittar på olika alternativ.'
        )}
      </table>

      ${launchDateBox()}
    `
  }

  if (templateKey === 'update') {
    return `
      <table
        role="presentation"
        width="100%"
        cellspacing="0"
        cellpadding="0"
        border="0"
        style="margin-top:36px;"
      >
        ${featureRow(
          '01',
          'Sökningen',
          'Vi fortsätter finslipa filtreringen och hur du snabbt tar dig till relevanta bostäder.'
        )}

        ${featureRow(
          '02',
          'Kartan',
          'Kartvyn utvecklas för att ge en bättre överblick och känsla för varje område.'
        )}

        ${featureRow(
          '03',
          'Bostadssidorna',
          'Informationen presenteras tydligare så att viktiga fakta blir enklare att hitta.'
        )}
      </table>
    `
  }

  if (templateKey === 'properties') {
    return `
      <table
        role="presentation"
        width="100%"
        cellspacing="0"
        cellpadding="0"
        border="0"
        style="
          margin-top:36px;
          background:#eff6ff;
          border:1px solid #dbeafe;
          border-radius:17px;
        "
      >
        <tr>
          <td style="padding:25px 26px;">
            <p
              style="
                margin:0;
                color:#2563eb;
                font-family:Arial,Helvetica,sans-serif;
                font-size:10px;
                font-weight:700;
                letter-spacing:1.2px;
                text-transform:uppercase;
              "
            >
              TIPS
            </p>

            <p
              style="
                margin:8px 0 0;
                color:#0f172a;
                font-family:Arial,Helvetica,sans-serif;
                font-size:17px;
                line-height:24px;
                font-weight:800;
              "
            >
              Testa både listan och kartan.
            </p>

            <p
              style="
                margin:8px 0 0;
                color:#64748b;
                font-family:Arial,Helvetica,sans-serif;
                font-size:13px;
                line-height:21px;
              "
            >
              Samma sökning kan kännas helt annorlunda när du
              ser objekten på kartan. Det kan hjälpa dig att
              upptäcka områden du annars hade missat.
            </p>
          </td>
        </tr>
      </table>
    `
  }

  return ''
}

function launchDateBox() {
  return `
    <table
      role="presentation"
      width="100%"
      cellspacing="0"
      cellpadding="0"
      border="0"
      style="
        margin-top:36px;
        background:#eff6ff;
        border:1px solid #dbeafe;
        border-radius:17px;
      "
    >
      <tr>
        <td
          align="center"
          style="padding:27px 22px;"
        >
          <p
            style="
              margin:0;
              color:#2563eb;
              font-family:Arial,Helvetica,sans-serif;
              font-size:10px;
              font-weight:700;
              letter-spacing:1.3px;
              text-transform:uppercase;
            "
          >
            PLANERAD LANSERING
          </p>

          <p
            style="
              margin:8px 0 0;
              color:#0f172a;
              font-family:Arial,Helvetica,sans-serif;
              font-size:24px;
              line-height:31px;
              font-weight:800;
            "
          >
            23 november 2026
          </p>

          <p
            style="
              margin:7px 0 0;
              color:#64748b;
              font-family:Arial,Helvetica,sans-serif;
              font-size:12px;
              line-height:19px;
            "
          >
            Du följer FyndBo redan innan vi har öppnat.
          </p>
        </td>
      </tr>
    </table>
  `
}

export function buildNewsletterHtml({
  templateKey,
  subject,
  preheader,
  heading,
  message,
  ctaLabel,
  ctaUrl,
  heroUrl,
}: {
  templateKey: string
  subject: string
  preheader: string
  heading: string
  message: string
  ctaLabel: string
  ctaUrl: string
  heroUrl: string
}) {
  const safeSubject =
    escapeHtml(subject)

  const safePreheader =
    escapeHtml(preheader)

  const safeHeading =
    escapeHtml(heading)

  const safeMessage =
    textToHtml(message)

  const safeCtaLabel =
    escapeHtml(ctaLabel)

  const safeCtaUrl =
    escapeHtml(ctaUrl)

  const safeHeroUrl =
    escapeHtml(
      heroUrl ||
        DEFAULT_NEWSLETTER_HERO
    )

  const extraContent =
    buildTemplateExtra(
      templateKey
    )

  const button =
    ctaLabel.trim() &&
    ctaUrl.trim()
      ? `
        <table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="margin-top:28px;"
        >
          <tr>
            <td align="left">
              <a
                href="${safeCtaUrl}"
                target="_blank"
                style="
                  display:inline-block;
                  padding:15px 24px;
                  border-radius:11px;
                  background:#2563eb;
                  color:#ffffff;
                  font-family:Arial,Helvetica,sans-serif;
                  font-size:15px;
                  line-height:20px;
                  font-weight:700;
                  text-decoration:none;
                "
              >
                ${safeCtaLabel}
              </a>
            </td>
          </tr>
        </table>
      `
      : ''

  return `
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >
  <meta
    name="color-scheme"
    content="light"
  >
  <meta
    name="supported-color-schemes"
    content="light"
  >
  <title>${safeSubject}</title>

  <style>
    body,
    table,
    td,
    a {
      -webkit-text-size-adjust:100%;
      -ms-text-size-adjust:100%;
    }

    table,
    td {
      mso-table-lspace:0pt;
      mso-table-rspace:0pt;
    }

    img {
      -ms-interpolation-mode:bicubic;
      border:0;
      outline:none;
      text-decoration:none;
    }

    @media only screen and (max-width: 640px) {
      .email-shell {
        width:100% !important;
      }

      .content-cell {
        padding:30px 22px !important;
      }

      .hero-copy {
        padding:29px 22px 31px !important;
      }

      .hero-heading {
        font-size:29px !important;
        line-height:35px !important;
      }

      .fyndbo-logo {
        width:210px !important;
        max-width:82% !important;
      }

      .footer-cell {
        padding:25px 22px !important;
      }
    }
  </style>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#e8edf4;
    font-family:Arial,Helvetica,sans-serif;
  "
>
  <div
    style="
      display:none;
      max-height:0;
      overflow:hidden;
      opacity:0;
      color:transparent;
      mso-hide:all;
    "
  >
    ${safePreheader}
  </div>

  <table
    role="presentation"
    width="100%"
    cellspacing="0"
    cellpadding="0"
    border="0"
    style="
      width:100%;
      background:#e8edf4;
    "
  >
    <tr>
      <td
        align="center"
        style="padding:26px 12px 38px;"
      >

        <table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          class="email-shell"
          style="
            width:100%;
            max-width:650px;
          "
        >
          <tr>
            <td
              align="center"
              style="
                padding:0 10px 11px;
                color:#94a3b8;
                font-family:Arial,Helvetica,sans-serif;
                font-size:10px;
                line-height:16px;
              "
            >
              Problem att läsa mailet?
              <a
                href="{{ mirror }}"
                style="
                  color:#64748b;
                  text-decoration:underline;
                "
              >
                Visa i webbläsaren
              </a>
            </td>
          </tr>
        </table>

        <table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          class="email-shell"
          style="
            width:100%;
            max-width:650px;
            background:#ffffff;
            border-radius:22px;
            overflow:hidden;
            box-shadow:0 20px 60px rgba(15,23,42,.12);
          "
        >

          <!-- BRAND -->
          <tr>
            <td
              style="
                background:#0f172a;
                padding:25px 32px 22px;
              "
            >
              <img
                src="https://fyndbo.se/Fyndbo-blue-bkg.png"
                alt="FyndBo.se"
                width="235"
                class="fyndbo-logo"
                style="
                  display:block;
                  width:235px;
                  max-width:86%;
                  height:auto;
                  border:0;
                "
              >
            </td>
          </tr>

          <!--
            HERO IMAGE
            Använder en riktig IMG-tag i stället för CSS-bakgrund.
            Det ger betydligt bättre stöd i Gmail, Apple Mail,
            Outlook och mobila mailklienter.
          -->
          <tr>
            <td
              style="
                padding:0;
                margin:0;
                background:#cbd5e1;
                line-height:0;
                font-size:0;
              "
            >
              <img
                src="${safeHeroUrl}"
                alt="Modernt hem – FyndBo"
                width="650"
                style="
                  display:block;
                  width:100%;
                  max-width:650px;
                  height:auto;
                  margin:0;
                  border:0;
                "
              >
            </td>
          </tr>

          <!-- HERO COPY -->
          <tr>
            <td
              class="hero-copy"
              style="
                background:#0f172a;
                padding:34px 36px 37px;
              "
            >
              <div
                style="
                  display:inline-block;
                  padding:6px 11px;
                  border-radius:999px;
                  background:#2563eb;
                  color:#ffffff;
                  font-family:Arial,Helvetica,sans-serif;
                  font-size:9px;
                  line-height:13px;
                  font-weight:700;
                  letter-spacing:1.3px;
                "
              >
                FYNDBO.SE
              </div>

              <h1
                class="hero-heading"
                style="
                  margin:15px 0 0;
                  max-width:540px;
                  color:#ffffff;
                  font-family:Arial,Helvetica,sans-serif;
                  font-size:35px;
                  line-height:42px;
                  font-weight:800;
                  letter-spacing:-.7px;
                "
              >
                ${safeHeading}
              </h1>

              ${
                safePreheader
                  ? `
                    <p
                      style="
                        margin:15px 0 0;
                        max-width:500px;
                        color:#cbd5e1;
                        font-family:Arial,Helvetica,sans-serif;
                        font-size:14px;
                        line-height:22px;
                      "
                    >
                      ${safePreheader}
                    </p>
                  `
                  : ''
              }
            </td>
          </tr>

          <!-- MAIN CONTENT -->
          <tr>
            <td
              class="content-cell"
              style="padding:40px 39px 43px;"
            >
              <div
                style="
                  color:#475569;
                  font-family:Arial,Helvetica,sans-serif;
                  font-size:15px;
                  line-height:1.78;
                "
              >
                ${safeMessage}
              </div>

              ${button}

              ${extraContent}

              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="
                  margin-top:38px;
                  border-top:1px solid #e2e8f0;
                "
              >
                <tr>
                  <td style="padding-top:25px;">
                    <p
                      style="
                        margin:0;
                        color:#0f172a;
                        font-family:Arial,Helvetica,sans-serif;
                        font-size:14px;
                        line-height:22px;
                        font-weight:700;
                      "
                    >
                      Tack för att du följer FyndBo.
                    </p>

                    <p
                      style="
                        margin:4px 0 0;
                        color:#64748b;
                        font-family:Arial,Helvetica,sans-serif;
                        font-size:12px;
                        line-height:19px;
                      "
                    >
                      Teamet bakom FyndBo.se
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td
              class="footer-cell"
              style="
                background:#0f172a;
                padding:28px 35px;
              "
            >
              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
              >
                <tr>
                  <td
                    style="
                      color:#94a3b8;
                      font-family:Arial,Helvetica,sans-serif;
                      font-size:11px;
                      line-height:18px;
                    "
                  >
                    <strong
                      style="
                        display:block;
                        margin-bottom:3px;
                        color:#ffffff;
                        font-size:12px;
                      "
                    >
                      FyndBo.se
                    </strong>

                    En enklare väg till ditt nästa hem.
                  </td>

                  <td
                    align="right"
                    valign="middle"
                  >
                    <a
                      href="https://fyndbo.se"
                      style="
                        color:#60a5fa;
                        font-family:Arial,Helvetica,sans-serif;
                        font-size:11px;
                        font-weight:700;
                        text-decoration:none;
                      "
                    >
                      fyndbo.se
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          class="email-shell"
          style="
            width:100%;
            max-width:650px;
          "
        >
          <tr>
            <td
              align="center"
              style="
                padding:18px 18px 0;
                color:#94a3b8;
                font-family:Arial,Helvetica,sans-serif;
                font-size:10px;
                line-height:17px;
              "
            >
              Du får detta mail eftersom du har valt att följa
              FyndBo och få våra nyheter.

              <br>

              <a
                href="{{ unsubscribe }}"
                style="
                  color:#64748b;
                  text-decoration:underline;
                "
              >
                Avregistrera
              </a>

              &nbsp;&nbsp;·&nbsp;&nbsp;

              <a
                href="{{ mirror }}"
                style="
                  color:#64748b;
                  text-decoration:underline;
                "
              >
                Visa i webbläsaren
              </a>

              <br>

              © 2026 FyndBo.se
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `
}
