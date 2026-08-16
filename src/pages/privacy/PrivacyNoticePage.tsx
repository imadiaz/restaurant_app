const PRIVACY_NOTICE_URL = "/documents/politica-de-privacidad-moreantojo.pdf";

function PrivacyNoticePage() {
  return (
    <main className="flex min-h-dvh flex-col bg-neutral-100">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 py-3 shadow-sm">
        <div>
          <h1 className="text-lg font-semibold text-neutral-900">
            Aviso de privacidad
          </h1>
          <p className="text-sm text-neutral-600">MoreAntojo</p>
        </div>

        <div className="flex gap-2">
          <a
            className="rounded-lg border border-orange-600 px-4 py-2 text-sm font-medium text-orange-700 transition hover:bg-orange-50"
            href={PRIVACY_NOTICE_URL}
            target="_blank"
            rel="noreferrer"
          >
            Abrir PDF
          </a>
          <a
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-700"
            href={PRIVACY_NOTICE_URL}
            download="Politica_de_Privacidad_MoreAntojo.pdf"
          >
            Descargar
          </a>
        </div>
      </header>

      <object
        className="min-h-[calc(100dvh-81px)] w-full flex-1"
        data={PRIVACY_NOTICE_URL}
        type="application/pdf"
        aria-label="Política de privacidad de MoreAntojo"
      >
        <div className="mx-auto max-w-xl p-8 text-center text-neutral-700">
          <p>Tu navegador no puede mostrar el documento en esta página.</p>
          <a
            className="mt-4 inline-block font-medium text-orange-700 underline"
            href={PRIVACY_NOTICE_URL}
          >
            Consultar la política de privacidad en PDF
          </a>
        </div>
      </object>
    </main>
  );
}

export default PrivacyNoticePage;
