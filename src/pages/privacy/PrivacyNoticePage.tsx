const PRIVACY_NOTICE_URL = "/documents/Politica_de_Privacidad_Baiyu.pdf";

function PrivacyNoticePage() {
  return (
    <iframe
      className="block h-dvh w-full border-0"
      src={PRIVACY_NOTICE_URL}
      title="Política de privacidad de Baiyu"
    />
  );
}

export default PrivacyNoticePage;
