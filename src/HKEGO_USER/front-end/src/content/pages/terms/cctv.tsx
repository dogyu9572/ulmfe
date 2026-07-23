import TermsPageView from '@/components/public-terms/TermsPageView'
import { getPublicTermsServer } from '@/lib/publicApiServer'

export default async function TermsCctvContent() {
	const terms = await getPublicTermsServer('VIDEO').catch(() => null)
	return <TermsPageView activeTypeCode="VIDEO" terms={terms} />
}
