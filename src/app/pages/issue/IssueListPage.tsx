import {FC, useEffect, useState} from 'react'
import axios from 'axios'
import {useNavigate} from 'react-router-dom'
import {Issue, getPriorityLabel} from './issueTypes'

type IssueListResponse = {
    list: Issue[]
    page: number
    size: number
    totalCount: number
    totalPages: number
}

const ISSUE_LIST_API = 'http://localhost:4567/schedule/issue/list'

export const IssueListPage: FC = () => {
    const navigate = useNavigate()

    const [issues, setIssues] = useState<Issue[]>([])
    const [page, setPage] = useState(1)
    const [pageSize] = useState(10)
    const [totalPages, setTotalPages] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const [searchInput, setSearchInput] = useState('')
    const [keyword, setKeyword] = useState('')
    const [loading, setLoading] = useState(false)

    const loadIssues = async (pageNo: number, kw: string) => {
        setLoading(true)
        try {
            const res = await axios.post<IssueListResponse>(
                ISSUE_LIST_API,
                {
                    page: pageNo,
                    size: pageSize,
                    projectName: kw || undefined, // 서버에서 제목 검색 파라미터 이름에 맞게 수정
                },
                {withCredentials: true}
            )

            setIssues(res.data.list)
            setPage(res.data.page)
            setTotalPages(res.data.totalPages)
            setTotalCount(res.data.totalCount)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadIssues(page, keyword)
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

    return (
        <div className='row g-5 g-xl-8'>
            <div className='col-12'>
                <div className='card'>
                    <div className='card-header border-0 pt-5 d-flex justify-content-between align-items-center'>
                        <div>
                            <h3 className='card-title align-items-start flex-column'>
                                <span className='card-label fw-bold fs-3 mb-1'>이슈 리스트</span>
                                <span className='text-muted mt-1 fw-semibold fs-7'>
                  등록된 프로젝트 이슈 목록입니다.
                </span>
                            </h3>
                        </div>

                        <form className='d-flex align-items-center gap-3' onSubmit={onSearchSubmit}>
                            <div className='position-relative'>
                                <i className='bi bi-search position-absolute top-50 translate-middle-y ms-3'></i>
                                <input
                                    type='text'
                                    className='form-control form-control-sm ps-9'
                                    placeholder='프로젝트 제목 검색'
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
                                onClick={() => navigate('/issue/new')}
                            >
                                <i className='bi bi-plus-lg me-1'></i> 이슈 등록
                            </button>
                        </form>
                    </div>

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
                                            <th style={{width: '160px'}}>프로젝트</th>
                                            <th style={{width: '100px'}}>유형</th>
                                            <th style={{width: '80px'}}>중요도</th>
                                            <th style={{width: '120px'}}>담당자</th>
                                            <th style={{width: '180px'}}>기간</th>
                                        </tr>
                                        </thead>
                                        <tbody className='text-gray-700 fw-semibold'>
                                        {issues.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className='text-center py-10 text-muted'>
                                                    등록된 이슈가 없습니다.
                                                </td>
                                            </tr>
                                        )}

                                        {issues.map((issue) => (
                                            <tr key={issue.issueId}>
                                                <td>{issue.issueId}</td>
                                                <td>
                            <span
                                className='text-gray-900 text-hover-primary fw-semibold cursor-pointer'
                                onClick={() => navigate(`/issue/${issue.issueId}`)}
                            >
                              {issue.name}
                            </span>
                                                </td>
                                                <td>{issue.projectName}</td>
                                                <td>{issue.issueType}</td>
                                                <td>{getPriorityLabel(issue.issuePriority)}</td>
                                                <td>{issue.managerName}</td>
                                                <td>
                                                    {issue.startDate} ~ {issue.endDate}
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>

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
