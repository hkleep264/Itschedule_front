import {FC, useState} from 'react'

type BoardPost = {
    id: number
    title: string
    writer: string
    createdAt: string
    views: number
}

const mockPosts: BoardPost[] = [
    {id: 1, title: '첫 번째 공지입니다.', writer: '관리자', createdAt: '2025-11-26', views: 12},
    {id: 2, title: '시스템 점검 안내 (12/01)', writer: '관리자', createdAt: '2025-11-20', views: 32},
    {id: 3, title: '사용 방법 안내 문서 공유', writer: '관리자', createdAt: '2025-11-15', views: 54},
    {id: 4, title: 'FAQ 모음', writer: '관리자', createdAt: '2025-11-10', views: 7},
]

export const BoardPage: FC = () => {
    const [keyword, setKeyword] = useState('')
    const [posts] = useState<BoardPost[]>(mockPosts)

    const filtered = posts.filter(
        (p) =>
            p.title.toLowerCase().includes(keyword.toLowerCase()) ||
            p.writer.toLowerCase().includes(keyword.toLowerCase())
    )

    return (
        <div className='row g-5 g-xl-8'>
            <div className='col-12'>
                <div className='card'>
                    {/* 카드 헤더 */}
                    <div className='card-header border-0 pt-5 d-flex justify-content-between align-items-center'>
                        <div>
                            <h3 className='card-title align-items-start flex-column'>
                                <span className='card-label fw-bold fs-3 mb-1'>게시판</span>
                                <span className='text-muted mt-1 fw-semibold fs-7'>
                  공지사항 및 간단한 게시글을 관리하는 페이지입니다.
                </span>
                            </h3>
                        </div>

                        <div className='d-flex align-items-center gap-3'>
                            {/* 검색창 */}
                            <div className='position-relative'>
                                <i className='bi bi-search position-absolute top-50 translate-middle-y ms-3'></i>
                                <input
                                    type='text'
                                    className='form-control form-control-sm ps-9'
                                    placeholder='제목 / 작성자 검색'
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                />
                            </div>

                            {/* 글쓰기 버튼 (추후 /board/write 같은 페이지로 연결 가능) */}
                            <button type='button' className='btn btn-sm btn-primary'>
                                <i className='bi bi-pencil-square me-1'></i>
                                글쓰기
                            </button>
                        </div>
                    </div>

                    {/* 카드 바디 (테이블) */}
                    <div className='card-body py-3'>
                        <div className='table-responsive'>
                            <table className='table align-middle table-row-dashed fs-6 gy-3'>
                                <thead>
                                <tr className='text-start text-gray-500 fw-bold fs-7 text-uppercase gs-0'>
                                    <th style={{width: '70px'}}>번호</th>
                                    <th>제목</th>
                                    <th style={{width: '140px'}}>작성자</th>
                                    <th style={{width: '150px'}}>작성일</th>
                                    <th style={{width: '90px'}} className='text-end'>
                                        조회수
                                    </th>
                                </tr>
                                </thead>
                                <tbody className='text-gray-700 fw-semibold'>
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className='text-center py-10 text-muted'>
                                            검색 결과가 없습니다.
                                        </td>
                                    </tr>
                                )}

                                {filtered.map((post, idx) => (
                                    <tr key={post.id}>
                                        <td>{post.id}</td>
                                        <td>
                                            {/* 추후 상세 페이지(/board/:id)로 연결하고 싶으면 Link로 교체 */}
                                            <span className='text-gray-900 text-hover-primary fw-semibold cursor-pointer'>
                          {post.title}
                        </span>
                                        </td>
                                        <td>{post.writer}</td>
                                        <td>{post.createdAt}</td>
                                        <td className='text-end'>{post.views}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {/* 페이징 영역 (지금은 UI만, 나중에 실제 페이징 로직 연결 가능) */}
                        <div className='d-flex justify-content-between align-items-center mt-4'>
                            <div className='text-muted fs-7'>
                                총 <span className='fw-bold'>{filtered.length}</span> 건
                            </div>
                            <ul className='pagination pagination-sm mb-0'>
                                <li className='page-item disabled'>
                  <span className='page-link'>
                    <i className='bi bi-chevron-left'></i>
                  </span>
                                </li>
                                <li className='page-item active'>
                                    <span className='page-link'>1</span>
                                </li>
                                <li className='page-item'>
                                    <span className='page-link'>2</span>
                                </li>
                                <li className='page-item'>
                  <span className='page-link'>
                    <i className='bi bi-chevron-right'></i>
                  </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
