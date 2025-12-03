// src/app/pages/todo/TodoListPage.tsx
import React, {useEffect, useMemo, useState} from 'react'
import {TodoItem} from './todoTypes'
import {
    apiClient,
    ISSUE_TODO_LIST_URL,
    ISSUE_IMPORTANT_UPDATE_URL,
} from '../../config/api'

const TodoListPage: React.FC = () => {
    const [todos, setTodos] = useState<TodoItem[]>([])
    const [loading, setLoading] = useState(false)

    const loadTodos = async () => {
        try {
            setLoading(true)
            const res = await apiClient.post(ISSUE_TODO_LIST_URL, {})
            const list: TodoItem[] = res.data.list || []
            setTodos(list)
        } catch (e) {
            console.error('todo_list 로딩 실패', e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadTodos()
    }, [])

    // 좌측 카운트
    const todayCount = useMemo(
        () => todos.filter((t) => t.isToday === 1).length,
        [todos]
    )
    const importantCount = useMemo(
        () => todos.filter((t) => t.isImportant === 1).length,
        [todos]
    )
    const totalCount = todos.length

    const formatDate = (value?: string) => {
        if (!value) return ''
        // '2025-12-03 00:00:00' → '2025-12-03'
        return value.substring(0, 10)
    }

    // ⭐ 중요 토글
    const toggleImportant = async (item: TodoItem) => {
        const next = item.isImportant === 1 ? 0 : 1

        // optimistic UI 업데이트
        setTodos((prev) =>
            prev.map((t) =>
                t.issueId === item.issueId ? {...t, isImportant: next} : t
            )
        )

        try {
            await apiClient.post(ISSUE_IMPORTANT_UPDATE_URL, {
                issueId: item.issueId,
                isImportant: next,
            })
        } catch (e) {
            console.error('중요 표시 변경 실패', e)
            // 실패 시 롤백
            setTodos((prev) =>
                prev.map((t) =>
                    t.issueId === item.issueId ? {...t, isImportant: item.isImportant} : t
                )
            )
            alert('중요 표시 변경에 실패했습니다.')
        }
    }

    return (
        <div className='d-flex h-100'>
            {/* 왼쪽 사이드 목록 */}
            <div
                className='border-end'
                style={{width: 260, minWidth: 260, backgroundColor: '#fafafa'}}
            >
                <div className='p-4 border-bottom'>
                    <div className='fw-bold fs-4'>작업</div>
                </div>

                <div className='p-3'>
                    <SideNavItem label='오늘 할 일' count={todayCount} isActive={false} />
                    <SideNavItem label='중요' count={importantCount} isActive={false} />
{/*                    <SideNavItem label='계획된 일정' count={0} isActive={false} />
                    <SideNavItem label='나에게 할당됨' count={0} isActive={false} />*/}
                    <SideNavItem label='작업' count={totalCount} isActive={true} />
                </div>

                <div className='mt-auto p-3 text-primary' style={{cursor: 'pointer'}}>
                    + 새 목록
                </div>
            </div>

            {/* 오른쪽 메인 영역 */}
            <div className='flex-grow-1'>
                <div className='border-bottom px-4 py-3 d-flex align-items-center justify-content-between'>
                    <div className='d-flex align-items-center'>
                        <i className='bi bi-house-door me-2'></i>
                        <span className='fw-bold fs-5'>작업</span>
                    </div>
                    <div className='text-muted small'>
                        {loading ? '불러오는 중...' : `${totalCount}개 작업`}
                    </div>
                </div>

                {/* "작업 추가" 입력줄(현재는 모양만) */}
                <div className='px-4 py-3 border-bottom'>
                    <button className='btn btn-light w-100 text-start'>
                        <i className='bi bi-plus-lg me-2'></i>
                        작업 추가
                    </button>
                </div>

                {/* Todo 리스트 */}
                <div className='px-4 py-3'>
                    {todos.length === 0 && !loading && (
                        <div className='text-muted'>등록된 작업이 없습니다.</div>
                    )}

                    {todos.map((item) => (
                        <div
                            key={item.issueId}
                            className='d-flex align-items-center justify-content-between border rounded-3 mb-2 px-3 py-2'
                            style={{backgroundColor: '#fbfbfb'}}
                        >
                            <div className='d-flex align-items-center flex-grow-1'>
                                {/* 완료 체크 원 (지금은 클릭 처리 X, 모양만) */}
                                <button
                                    className='btn btn-sm btn-icon me-3'
                                    style={{borderRadius: '50%', border: '1px solid #ddd'}}
                                >
                                    {item.isDone === 1 ? (
                                        <i className='bi bi-check2'></i>
                                    ) : (
                                        <span>&nbsp;</span>
                                    )}
                                </button>

                                <div>
                                    <div className='fw-semibold'>{item.name}</div>
                                    <div className='text-muted small'>
                                        {/* 예시: "오늘 할 일 · 프로젝트명 · 빨간색 범주" 느낌만 */}
                                        {item.isToday === 1 && <span>오늘 할 일</span>}<br/>
                                        {item.projectName && <span>{item.projectName}</span>}<br/>
                                        {item.endDate && (
                                            <span>기한 {formatDate(item.endDate)}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* 오른쪽 별 아이콘 */}
                            <button
                                className='btn btn-sm btn-icon'
                                onClick={() => toggleImportant(item)}
                            >
                                <i
                                    className={
                                        item.isImportant === 1 ? 'bi bi-star-fill' : 'bi bi-star'
                                    }
                                    style={{
                                        fontSize: 20,
                                        color: item.isImportant === 1 ? '#f59e0b' : '#c4c4c4',
                                    }}
                                ></i>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

interface SideNavItemProps {
    label: string
    count?: number
    isActive?: boolean
}

const SideNavItem: React.FC<SideNavItemProps> = ({label, count = 0, isActive}) => {
    return (
        <div
            className={`d-flex justify-content-between align-items-center px-3 py-2 rounded-3 mb-1 ${
                isActive ? 'bg-light fw-semibold' : 'bg-transparent'
            }`}
            style={{cursor: 'pointer'}}
        >
            <span>{label}</span>
            {count > 0 && <span className='text-muted small'>{count}</span>}
        </div>
    )
}

export default TodoListPage
