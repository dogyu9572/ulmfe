'use client'

// schema.org 구조화 데이터를 application/ld+json 스크립트로 출력한다.

export default function JsonLd({ data }: { data: object | object[] }) {
	return (
		<script
			type="application/ld+json"
			// XSS 방지를 위해 닫는 태그로 해석될 수 있는 문자를 이스케이프한다.
			dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\u003c') }}
		/>
	)
}
