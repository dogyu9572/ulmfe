import TermsPageView from '@/components/public-terms/TermsPageView'
import { getPublicTermsServer } from '@/lib/publicApiServer'

export default async function TermsNoEmailContent() {
	const terms = await getPublicTermsServer('EMAIL').catch(() => null)
	return <TermsPageView activeTypeCode="EMAIL" terms={terms} />
}
