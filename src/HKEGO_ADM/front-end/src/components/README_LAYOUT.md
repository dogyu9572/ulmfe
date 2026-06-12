# 관리자 목록/CRUD 페이지 기본 레이아웃

새 메뉴(목록 + 신규/상세) 추가 시 아래 공통 컴포넌트를 사용하면 관리자관리·권한그룹관리·코드관리와 동일한 레이아웃이 적용됩니다.

## 공통 컴포넌트

| 컴포넌트 | 용도 |
|----------|------|
| `CrudPageCard` | 카드 레이아웃 (제목, 에러/메시지, 본문). 목록 페이지의 최상위 카드로 사용 |
| `LayerPopup` | 레이어 팝업 (제목, 본문, 푸터). 신규 등록/상세 수정 폼을 팝업으로 띄울 때 사용 |
| `RowActionButtons` | 테이블 "관리" 열의 수정/삭제(및 추가) 버튼 |

## 페이지 구조 예시

```tsx
import { AdminLayout } from '../components/AdminLayout'
import { CrudPageCard } from '../components/CrudPageCard'
import { LayerPopup } from '../components/LayerPopup'
import { RowActionButtons } from '../components/RowActionButtons'

// 1. AdminLayout으로 감싸고, 본문은 CrudPageCard 사용
<AdminLayout title="메뉴명">
  <CrudPageCard title="메뉴명" error={error} message={message}>
    <div className="code-filters">
      {/* 검색/필터 + [조회] [신규] 버튼 */}
    </div>
    <table className="table">
      <thead>...</thead>
      <tbody>
        {list.map((row) => (
          <tr key={row.id} className="clickable" onClick={() => openEditPopup(row)}>
            <td>...</td>
            <td className="table-actions" onClick={(e) => e.stopPropagation()}>
              <RowActionButtons
                onEdit={() => openEditPopup(row)}
                onDelete={() => handleDeleteRow(row.id, row.name)}
                disabled={loading}
                extra={[]}  // 필요 시 예: [{ label: '권한관리', onClick: () => ... }]
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </CrudPageCard>

  {/* 2. 신규/상세 폼은 LayerPopup으로 */}
  <LayerPopup
    open={popupOpen}
    title={popupMode === 'new' ? '등록' : '상세 (수정)'}
    onClose={closePopup}
    footer={<> 삭제(수정시) / 등록|수정 / 닫기 </>}
    wide={false}
  >
    {error && <p className="form-error">{error}</p>}
    <table className="form-table">
      <tbody>
        <tr><th>필드명</th><td><input ... /></td></tr>
      </tbody>
    </table>
  </LayerPopup>
</AdminLayout>
```

## 스타일 클래스

- **필터 영역**: `code-filters` (label + select/input + 버튼)
- **테이블**: `table` (헤더/셀 가운데 정렬 적용됨)
- **관리 열**: `table-actions` + `RowActionButtons`, 행 클릭 시 상세 팝업 열기
- **팝업 폼**: `form-table` (2열: th 라벨, td 입력)
- **푸터 버튼**: 삭제는 `form-actions-btn-secondary` + `marginRight: 'auto'`, 등록/수정·닫기

## 참고 페이지

- `pages/AdminListPage.tsx` – 단일 목록 + 레이어 팝업
- `pages/AuthGroupPage.tsx` – 목록 + 권한관리 추가 버튼(extra)
- `pages/CodePage.tsx` – 마스터/상세 2단 영역 + 팝업 2개 (wide 사용)
