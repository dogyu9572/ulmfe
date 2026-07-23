'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
	createPublicQna,
	extractCreatedPostId,
	getPublicQna,
	getQnaCaptchaUrl,
	updatePublicQna
} from '@/lib/publicQnaApi'
import { qnaListHref, qnaPageHref } from './qnaNavigation'

type Props = { mode: 'create' | 'modify' }

function validPassword(value: string) {
	if (value.length < 10) return false
	const kinds = [/[A-Za-z]/.test(value), /[0-9]/.test(value), /[!@#$%^&*]/.test(value)].filter(Boolean).length
	return kinds >= 2
}

export default function QnaForm({ mode }: Props) {
	const router = useRouter()
	const params = useSearchParams()
	const postId = params.get('post_id') || params.get('id') || ''
	const paramsSnapshot = useMemo(() => new URLSearchParams(params.toString()), [params])
	const [title, setTitle] = useState('')
	const [writerName, setWriterName] = useState('')
	const [password, setPassword] = useState('')
	const [content, setContent] = useState('')
	const [captcha, setCaptcha] = useState('')
	const [captchaNonce, setCaptchaNonce] = useState(1)
	const [loading, setLoading] = useState(mode === 'modify')
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState('')

	useEffect(() => {
		if (mode !== 'modify') return
		if (!postId) {
			setError('수정할 문의 정보가 없습니다.')
			setLoading(false)
			return
		}
		let cancelled = false
		setLoading(true)
		void getPublicQna(postId, false)
			.then((post) => {
				if (cancelled) return
				setTitle(post.title || '')
				setWriterName(post.writerName || '')
				setContent(post.content || '')
			})
			.catch((reason: unknown) => {
				if (!cancelled) setError(reason instanceof Error ? reason.message : '문의 정보를 불러오지 못했습니다.')
			})
			.finally(() => { if (!cancelled) setLoading(false) })
		return () => { cancelled = true }
	}, [mode, postId])

	const refreshCaptcha = () => {
		setCaptcha('')
		setCaptchaNonce(Date.now())
	}

	const submit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (submitting || loading) return
		if (!title.trim()) return setError('제목을 입력해주세요.')
		if (mode === 'create' && !writerName.trim()) return setError('작성자를 입력해주세요.')
		if (!validPassword(password)) return setError('비밀번호는 영문, 숫자, 특수문자 중 2종류 이상을 조합하여 10자리 이상 입력해주세요.')
		if (!content.trim()) return setError('내용을 입력해주세요.')
		if (!captcha.trim()) return setError('자동등록방지 문자를 입력해주세요.')
		setSubmitting(true)
		setError('')
		try {
			if (mode === 'create') {
				const created = await createPublicQna({
					title: title.trim(),
					writerName: writerName.trim(),
					password,
					content: content.trim(),
					captcha: captcha.trim()
				})
				const createdPostId = extractCreatedPostId(created)
				if (createdPostId) router.push(qnaPageHref('/support/qna_view', createdPostId, paramsSnapshot))
				else router.push(qnaListHref(paramsSnapshot))
			} else {
				if (!postId) throw new Error('수정할 문의 정보가 없습니다.')
				await updatePublicQna(postId, {
					title: title.trim(),
					content: content.trim(),
					password,
					captcha: captcha.trim()
				})
				router.push(qnaPageHref('/support/qna_view', postId, paramsSnapshot))
			}
		} catch (reason) {
			setError(reason instanceof Error ? reason.message : '문의 내용을 저장하지 못했습니다.')
			refreshCaptcha()
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<section className="board_wrap inner" aria-labelledby="page-title">
			<h1 id="page-title" className="subtitle">1:1문의 작성</h1>
			<form onSubmit={submit}>
				<div className="board_write">
					<table>
						<colgroup><col className="w1" /><col /></colgroup>
						<tbody>
							<tr>
								<th scope="row"><label htmlFor="inputTitle">제목<span className="c_blue">*</span></label></th>
								<td><input type="text" id="inputTitle" className="text w100p" placeholder="제목을 입력해주세요." value={title} onChange={(event) => setTitle(event.target.value)} maxLength={500} disabled={loading} /></td>
							</tr>
							<tr>
								<th scope="row"><label htmlFor="inputWriter">작성자<span className="c_blue">*</span></label></th>
								<td><input type="text" id="inputWriter" className="text w100p" placeholder="작성자를 입력해주세요." value={writerName} onChange={(event) => setWriterName(event.target.value)} maxLength={100} disabled={mode === 'modify' || loading} /></td>
							</tr>
							<tr>
								<th scope="row"><label htmlFor="inputPassword">비밀번호<span className="c_blue">*</span></label></th>
								<td><input type="password" id="inputPassword" className="text w100p" placeholder="영문, 숫자, 특수문자 2종류 이상을 조합하여 10자리 이상 입력해주세요. (특수문자 가능 기호  ! @ # $ % ^ & *)" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" disabled={loading} /></td>
							</tr>
							<tr>
								<th scope="row"><label htmlFor="inputContent">내용<span className="c_blue">*</span></label></th>
								<td><textarea id="inputContent" cols={30} rows={10} className="text w100p" placeholder="내용을 입력해주세요." value={content} onChange={(event) => setContent(event.target.value)} maxLength={4000} disabled={loading}></textarea></td>
							</tr>
							<tr>
								<th scope="row"><label htmlFor="captchaArea">자동등록방지<span className="c_blue">*</span></label></th>
								<td>
									<div className="captcha_area">
										<div className="obj_area">
											<div className="obj imgfit"><img src={getQnaCaptchaUrl(captchaNonce)} alt="자동등록방지 코드" /></div>
											<button type="button" className="obj btn_re" onClick={refreshCaptcha} aria-label="숫자 이미지 변경"></button>
										</div>
										<input type="text" name="captcha" id="captchaArea" className="obj text" maxLength={6} autoComplete="off" value={captcha} onChange={(event) => setCaptcha(event.target.value)} disabled={loading} />
									</div>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
				{error && <p role="alert" className="tac" style={{ color: '#e5484d' }}>{error}</p>}
				<div className="board_bottom"><div className="flex_center btns"><button type="submit" id="btn_submit" className="btn btn_wbb btn_large" disabled={loading || submitting}>{submitting ? '처리 중' : '등록'}</button></div></div>
			</form>
		</section>
	)
}
