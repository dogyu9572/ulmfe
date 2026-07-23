import TermsPageView from '@/components/public-terms/TermsPageView'
import { getPublicTermsServer } from '@/lib/publicApiServer'

export default async function TermsPrivacyContent() {
	const terms = await getPublicTermsServer('PRIVACY').catch(() => null)
	return <TermsPageView activeTypeCode="PRIVACY" terms={terms} />
}
