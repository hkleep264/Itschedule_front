// src/app/modules/user/pages/UserListPage.tsx (예시)

import React, {FC, useEffect, useState} from 'react'
import {UserListItem, UserListResponse} from './models.ts'
import {
    apiClient,
    USER_LIST_URL,
    USER_AUTH_UPDATE_URL,
    USER_ADMIN_UPDATE_URL,
} from '../../config/api'

const PAGE_SIZE = 10

const UserListPage: FC = () => {
    const [users, setUsers] = useState<UserListItem[]>([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const [totalCount, setTotalCount] = useState(0)
    const [loading, setLoading] = useState(false)

    // 이슈 리스트 형식 참고해서 load 함수 작성
    const loadUsers = async (pageNo: number) => {
        setLoading(true)
        try {
            const res = await apiClient.post<UserListResponse>(
                USER_LIST_URL,
                {
                    page: pageNo,
                    size: PAGE_SIZE,
                },
                {withCredentials: true}
            )

            setUsers(res.data.list)
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
        loadUsers(1)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleChangeEmailAuth = async (userId: number, value: 0 | 1) => {
        try {
            await apiClient.post(
                USER_AUTH_UPDATE_URL,
                {
                    userId,
                    auth: value, // 0: 인증 안함, 1: 인증
                },
                {withCredentials: true}
            )

            // 화면 반영
            setUsers((prev) =>
                prev.map((u) => (u.id === userId ? {...u, isEmailAuth: value} : u))
            )
        } catch (e) {
            console.error(e)
            alert('인증 여부 변경 중 오류가 발생했습니다.')
        }
    }

    const handleChangeAdmin = async (userId: number, value: 0 | 1) => {
        try {
            await apiClient.post(
                USER_ADMIN_UPDATE_URL,
                {
                    userId,
                    adminAuth: value, // 0: 유저, 1: 관리자
                },
                {withCredentials: true}
            )

            // 화면 반영
            setUsers((prev) =>
                prev.map((u) => (u.id === userId ? {...u, isAdmin: value} : u))
            )
        } catch (e) {
            console.error(e)
            alert('관리자 여부 변경 중 오류가 발생했습니다.')
        }
    }

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return
        loadUsers(newPage)
    }

    return (
        <div className='card'>
            <div className='card-header border-0 pt-6'>
                <div className='card-title'>
                    <h2>유저 리스트</h2>
                </div>
                <div className='card-toolbar'>
          <span className='text-muted fs-7'>
            총 {totalCount}명
          </span>
                </div>
            </div>

            <div className='card-body pt-0'>
                {loading ? (
                    <div className='text-center py-10'>로딩중...</div>
                ) : (
                    <div className='table-responsive'>
                        <table className='table align-middle table-row-dashed fs-6 gy-5'>
                            <thead>
                            <tr className='text-start text-muted fw-bold fs-7 text-uppercase gs-0'>
                                <th className='min-w-80px'>유저 아이디</th>
                                <th className='min-w-150px'>이메일</th>
                                <th className='min-w-120px'>이름</th>
                                <th className='min-w-120px'>인증 여부</th>
                                <th className='min-w-120px'>관리자 여부</th>
                                <th className='min-w-160px'>가입일</th>
                            </tr>
                            </thead>
                            <tbody className='text-gray-600 fw-semibold'>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className='text-center py-10'>
                                        등록된 유저가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id}>
                                        {/* 유저 아이디 */}
                                        <td>{user.id}</td>

                                        {/* 이메일 */}
                                        <td>{user.email}</td>

                                        {/* 이름 */}
                                        <td>{user.name}</td>

                                        {/* 인증 여부 select */}
                                        <td>
                                            <select
                                                className='form-select form-select-sm'
                                                value={user.isEmailAuth}
                                                onChange={(e) =>
                                                    handleChangeEmailAuth(
                                                        user.id,
                                                        Number(e.target.value) as 0 | 1
                                                    )
                                                }
                                            >
                                                <option value={0}>미인증</option>
                                                <option value={1}>인증</option>
                                            </select>
                                        </td>

                                        {/* 관리자 여부 select */}
                                        <td>
                                            <select
                                                className='form-select form-select-sm'
                                                value={user.isAdmin}
                                                onChange={(e) =>
                                                    handleChangeAdmin(
                                                        user.id,
                                                        Number(e.target.value) as 0 | 1
                                                    )
                                                }
                                            >
                                                <option value={0}>유저</option>
                                                <option value={1}>관리자</option>
                                            </select>
                                        </td>

                                        {/* 가입일 */}
                                        <td>{user.created}</td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* 페이지네이션: IssueListPage에 있는 패턴이 있으면 그걸로 대체해도 됨 */}
                {totalPages > 1 && (
                    <div className='d-flex justify-content-end align-items-center mt-5'>
                        <button
                            className='btn btn-sm btn-light me-2'
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 1}
                        >
                            이전
                        </button>
                        <span className='me-2'>
              {page} / {totalPages}
            </span>
                        <button
                            className='btn btn-sm btn-light'
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page === totalPages}
                        >
                            다음
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default UserListPage
