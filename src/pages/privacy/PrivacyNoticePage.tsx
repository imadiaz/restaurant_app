const PRIVACY_NOTICE_URL = "/documents/politica-de-privacidad-moreantojo.pdf";

function PrivacyNoticePage() {
  return (
    <iframe
      className="block h-dvh w-full border-0"
      src={PRIVACY_NOTICE_URL}
      title="Política de privacidad de MoreAntojo"
    />
  );
}

export default PrivacyNoticePage;
