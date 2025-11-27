// src/app/pages/board/BoardPage.tsx
import {FC, useEffect, useState} from 'react'
import axios from 'axios'
import {useNavigate} from 'react-router-dom'

type BoardPost = {
    id: number
    name: string
    content: string
    writer: string
    created: string
}

type BoardPageResponse = {
    list: BoardPost[]
    page: number
    size: number
    totalCount: number
    totalPages: number
}

// 개발 환경: 직접 백엔드 포트로
const BOARD_API_URL = 'http://localhost:4567/schedule/board/list'
// nginx 프록시 쓰게 되면 '/schedule/board/list' 로 바꾸면 됨


export const BoardPage: FC = () => {
    const [posts, setPosts] = useState<BoardPost[]>([])
    const [page, setPage] = useState(1)
    const [pageSize] = useState(10)
    const [totalPages, setTotalPages] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const [keyword, setKeyword] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [loading, setLoading] = useState(false)

    const loadBoard = async (pageNo: number, kw: string) => {
        setLoading(true)
        try {
            const res = await axios.post<BoardPageResponse>(
                BOARD_API_URL,
                {
                    page: pageNo,
                    size: pageSize,
                    name: kw || undefined,
                },
                {
                    withCredentials: true,
                }
            )


            setPosts(res.data.list)
            setPage(res.data.page)
            setTotalPages(res.data.totalPages)
            setTotalCount(res.data.totalCount)
        } catch (e) {
            console.error('loadBoard error', e)
        } finally {
            setLoading(false)
        }
    }

    // page, keyword 변경될 때마다 호출
    useEffect(() => {
        loadBoard(page, keyword)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, keyword])

    const onSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setPage(1)
        setKeyword(searchInput)
    }

    const goPage = (p: number) => {
        if (p < 1 || p > totalPages) return
        setPage(p)
    }

    const navigate = useNavigate()

    return (
        <div className='row g-5 g-xl-8'>
            <div className='col-12'>
                <div className='card'>
                    {/* 헤더 */}
                    <div className='card-header border-0 pt-5 d-flex justify-content-between align-items-center'>
                        <div>
                            <h3 className='card-title align-items-start flex-column'>
                                <span className='card-label fw-bold fs-3 mb-1'>프로젝트 리스트</span>
                                <span className='text-muted mt-1 fw-semibold fs-7'>
                  프로젝트 목록입니다.
                </span>
                            </h3>
                        </div>

                        <form className='d-flex align-items-center gap-3' onSubmit={onSearchSubmit}>
                            {/* 검색 입력 */}
                            <div className='position-relative'>
                                <i className='bi bi-search position-absolute top-50 translate-middle-y ms-3'></i>
                                <input
                                    type='text'
                                    className='form-control form-control-sm ps-9'
                                    placeholder='제목 검색'
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                />
                            </div>

                            <button type='submit' className='btn btn-sm btn-light-primary'>
                                검색
                            </button>

                            <button
                                type='button'
                                className='btn btn-sm btn-primary'
                                onClick={() => navigate('/board/new')}
                            >
                                <i className='bi bi-pencil-square me-1'></i>
                                글쓰기
                            </button>

                        </form>
                    </div>

                    {/* 바디 */}
                    <div className='card-body py-3'>
                        {loading && (
                            <div className='text-center py-10'>
                                <span className='spinner-border spinner-border-sm align-middle me-2'></span>
                                <span className='text-muted'>불러오는 중...</span>
                            </div>
                        )}

                        {!loading && (
                            <>
                                <div className='table-responsive'>
                                    <table className='table align-middle table-row-dashed fs-6 gy-3'>
                                        <thead>
                                        <tr className='text-start text-gray-500 fw-bold fs-7 text-uppercase gs-0'>
                                            <th style={{width: '70px'}}>번호</th>
                                            <th>제목</th>
                                            <th style={{width: '140px'}}>작성자</th>
                                            <th style={{width: '180px'}}>작성일</th>
                                        </tr>
                                        </thead>
                                        <tbody className='text-gray-700 fw-semibold'>
                                        {posts.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className='text-center py-10 text-muted'>
                                                    등록된 게시글이 없습니다.
                                                </td>
                                            </tr>
                                        )}

                                        {posts.map((post) => (
                                            <tr key={post.id}>
                                                <td>{post.id}</td>
                                                <td>
                            <span className='text-gray-900 text-hover-primary fw-semibold cursor-pointer'
                                  onClick={() => navigate(`/board/${post.id}`)}>
                              {post.name}
                            </span>
                                                </td>
                                                <td>{post.writer}</td>
                                                <td>{post.created}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* 페이지네이션 */}
                                <div className='d-flex justify-content-between align-items-center mt-4'>
                                    <div className='text-muted fs-7'>
                                        총 <span className='fw-bold'>{totalCount}</span> 건
                                    </div>

                                    <ul className='pagination pagination-sm mb-0'>
                                        <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
                                            <button
                                                type='button'
                                                className='page-link'
                                                onClick={() => goPage(page - 1)}
                                            >
                                                <i className='bi bi-chevron-left'></i>
                                            </button>
                                        </li>

                                        {/* 간단히 현재 페이지만 표시 (원하면 더 확장 가능) */}
                                        <li className='page-item active'>
                      <span className='page-link'>
                        {page} / {totalPages}
                      </span>
                                        </li>

                                        <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
                                            <button
                                                type='button'
                                                className='page-link'
                                                onClick={() => goPage(page + 1)}
                                            >
                                                <i className='bi bi-chevron-right'></i>
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
