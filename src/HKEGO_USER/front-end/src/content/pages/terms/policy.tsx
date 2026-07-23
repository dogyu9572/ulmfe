import TermsPageView from '@/components/public-terms/TermsPageView'
import { getPublicTermsServer } from '@/lib/publicApiServer'

export default async function TermsPolicyContent() {
	const terms = await getPublicTermsServer('USE').catch(() => null)
	return <TermsPageView activeTypeCode="USE" terms={terms} />
}
