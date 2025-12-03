// src/app/pages/calendar/ScheduleCalendarPage.tsx
import React, {useEffect, useMemo, useState} from 'react'
import axios from 'axios'
import {
    DragDropContext,
    Droppable,
    Draggable,
    DropResult,
} from '@hello-pangea/dnd'
import {
    apiClient,
    BOARD_LIST_URL,
    ISSUE_LIST_URL,
    BOARD_QUICK_UPDATE_URL,
    ISSUE_QUICK_UPDATE_URL,
} from '../../config/api'

type CalendarItemType = 'PROJECT' | 'ISSUE'

interface CalendarItem {
    id: string
    type: CalendarItemType
    title: string
    startDate: string
    endDate?: string | null
    projectName?: string

    projectId?: number
    issueId?: number
    managerName?: string
    priority?: number
    status?: number
    content?: string
}

/* --------------------------------------------------------------------- */
/* 날짜 유틸 함수                                                         */
/* --------------------------------------------------------------------- */

const formatDateKey = (d: Date): string => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

const normalizeDate = (value?: string | null): string | null => {
    if (!value) return null
    return value.substring(0, 10)
}

const parseDate = (value: string): Date => {
    return new Date(value + 'T00:00:00')
}

const addDays = (value: string, days: number): string => {
    const d = parseDate(value)
    d.setDate(d.getDate() + days)
    return formatDateKey(d)
}

const expandDateRange = (start: string, end?: string | null): string[] => {
    const s = parseDate(start)
    const e = end ? parseDate(end) : parseDate(start)

    const dates: string[] = []
    const cur = new Date(s)
    while (cur <= e) {
        dates.push(formatDateKey(cur))
        cur.setDate(cur.getDate() + 1)
    }
    return dates
}

/* --------------------------------------------------------------------- */
/* 메인 컴포넌트                                                          */
/* --------------------------------------------------------------------- */

const ScheduleCalendarPage: React.FC = () => {
    const [currentMonth, setCurrentMonth] = useState(() => {
        const now = new Date()
        return new Date(now.getFullYear(), now.getMonth(), 1)
    })

    const [items, setItems] = useState<CalendarItem[]>([])
    const [loading, setLoading] = useState(false)

    const [selectedDate, setSelectedDate] = useState<string | null>(null)
    const [showDayModal, setShowDayModal] = useState(false)

    const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null)
    const [showItemModal, setShowItemModal] = useState(false)

    const statusLabel = (s?: number) =>
        s === 0 ? '준비중' : s === 1 ? '진행중' : s === 2 ? '완료' : '-'

    const priorityLabel = (p?: number) =>
        p === 1 ? '상' : p === 2 ? '중' : p === 3 ? '하' : '-'

    /* --------------------------------------------------------------------- */
    /* 데이터 로딩                                                            */
    /* --------------------------------------------------------------------- */

    const loadData = async () => {
        try {
            setLoading(true)

            const [boardRes, issueRes] = await Promise.all([
                apiClient.post(BOARD_LIST_URL, {}, {withCredentials: true}),
                apiClient.post(
                    ISSUE_LIST_URL,
                    {page: 1, size: 500, projectName: ''},
                    {withCredentials: true}
                ),
            ])

            const boards = boardRes.data.list || []
            const issues = issueRes.data.list || []

            const projectItems: CalendarItem[] = boards
                .map((b: any): CalendarItem | null => {
                    const start = normalizeDate(b.startDate || b.created)
                    const end = normalizeDate(b.endDate)
                    if (!start) return null
                    return {
                        id: `P-${b.projectId}`,
                        type: 'PROJECT',
                        title: b.name,
                        startDate: start,
                        endDate: end,
                        projectId: b.projectId,
                        projectName: b.name,
                    }
                })
                .filter((x: CalendarItem | null): x is CalendarItem => x !== null)

            const issueItems: CalendarItem[] = issues
                .map((i: any): CalendarItem | null => {
                    const start = normalizeDate(i.startDate)
                    const end = normalizeDate(i.endDate)
                    if (!start) return null
                    return {
                        id: `I-${i.issueId}`,
                        type: 'ISSUE',
                        title: i.name,
                        startDate: start,
                        endDate: end,
                        projectName: i.projectName,
                        projectId: i.projectId,
                        issueId: i.issueId,
                        managerName: i.managerName,
                        priority: i.issuePriority,
                        status: i.issueStatus,
                        content: i.content,
                    }
                })
                .filter((x: CalendarItem | null): x is CalendarItem => x !== null)

            setItems([...projectItems, ...issueItems])
        } catch (err) {
            console.error('캘린더 로딩 실패:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    /* --------------------------------------------------------------------- */
    /* 캘린더 날짜 계산                                                      */
    /* --------------------------------------------------------------------- */

    const calendarDays = useMemo(() => {
        const firstOfMonth = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            1
        )
        const start = new Date(firstOfMonth)
        start.setDate(start.getDate() - start.getDay())

        const days: Date[] = []
        for (let i = 0; i < 42; i++) {
            const d = new Date(start)
            d.setDate(start.getDate() + i)
            days.push(d)
        }
        return days
    }, [currentMonth])

    const itemsByDate = useMemo(() => {
        const map: Record<string, CalendarItem[]> = {}

        items.forEach((item) => {
            const range = expandDateRange(item.startDate, item.endDate)
            range.forEach((d) => {
                if (!map[d]) map[d] = []
                map[d].push(item)
            })
        })

        return map
    }, [items])

    /* --------------------------------------------------------------------- */
    /* Drag & Drop                                                          */
    /* --------------------------------------------------------------------- */

    const handleDragEnd = async (result: DropResult) => {
        const {destination, source, draggableId} = result
        if (!destination) return

        const destDate = destination.droppableId
        const sourceDate = source.droppableId

        if (destDate === sourceDate) return

        const target = items.find((i) => i.id === draggableId)
        if (!target) return

        const start = target.startDate
        const end = target.endDate ?? target.startDate

        const startDateObj = parseDate(start)
        const endDateObj = parseDate(end)
        const diff = (endDateObj.getTime() - startDateObj.getTime()) / 86400000
        const lengthDays = Math.floor(diff) + 1

        const newStart = destDate
        const newEnd = addDays(destDate, lengthDays - 1)

        // rollback 대비 이전값 저장
        const before = {startDate: target.startDate, endDate: target.endDate}

        // 화면 즉시 업데이트
        setItems((prev) =>
            prev.map((i) =>
                i.id === target.id ? {...i, startDate: newStart, endDate: newEnd} : i
            )
        )

        try {
            if (target.type === 'PROJECT') {
                await apiClient.post(
                    BOARD_QUICK_UPDATE_URL,
                    {
                        boardId: target.projectId,
                        startDate: newStart,
                        endDate: newEnd,
                    },
                    {withCredentials: true}
                )
            } else {
                await apiClient.post(
                    ISSUE_QUICK_UPDATE_URL,
                    {
                        issueId: target.issueId,
                        startDate: newStart,
                        endDate: newEnd,
                    },
                    {withCredentials: true}
                )
            }
        } catch (error) {
            console.error('날짜 이동 실패:', error)
            // rollback
            setItems((prev) =>
                prev.map((i) =>
                    i.id === target.id
                        ? {...i, startDate: before.startDate, endDate: before.endDate}
                        : i
                )
            )
            alert('일정 이동에 실패했습니다.')
        }
    }

    /* --------------------------------------------------------------------- */

    const isSameMonth = (d: Date) =>
        d.getMonth() === currentMonth.getMonth() &&
        d.getFullYear() === currentMonth.getFullYear()

    const openDayModal = (d: string) => {
        setSelectedDate(d)
        setShowDayModal(true)
    }

    const selectedDateItems =
        selectedDate && itemsByDate[selectedDate]
            ? itemsByDate[selectedDate]
            : []

    /* --------------------------------------------------------------------- */
    /* 렌더링                                                               */
    /* --------------------------------------------------------------------- */

    return (
        <div className="card">
            <div className="card-header d-flex justify-content-between">
                <div>
                    <button className="btn btn-light btn-sm me-2" onClick={() => setCurrentMonth(new Date())}>
                        오늘
                    </button>
                    <button className="btn btn-light btn-sm me-2" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}>
                        ‹
                    </button>
                    <button className="btn btn-light btn-sm" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>
                        ›
                    </button>
                </div>

                <div className="fw-bold fs-4">
                    {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
                </div>

                <div>
                    <span className="badge me-2" style={{backgroundColor: '#3b82f6'}}>프로젝트</span>
                    <span className="badge" style={{backgroundColor: '#f97316'}}>이슈</span>
                </div>
            </div>

            <div className="card-body">
                <DragDropContext onDragEnd={handleDragEnd}>
                    <div className="row row-cols-7 g-0">
                        {['일','월','화','수','목','금','토'].map((x) => (
                            <div key={x} className="col text-center fw-bold mb-2">{x}</div>
                        ))}

                        {calendarDays.map((date, idx) => {
                            const dateKey = formatDateKey(date)
                            const dayItems = itemsByDate[dateKey] || []
                            const shownItems = dayItems.slice(0,4)
                            const hidden = dayItems.length - shownItems.length

                            return (
                                <Droppable droppableId={dateKey} key={dateKey}>
                                    {(provided) => (
                                        <div
                                            className="col border p-1"
                                            style={{minHeight: 100}}
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                        >
                                            <div className={isSameMonth(date) ? '' : 'text-muted'}>
                                                <strong>{date.getDate()}</strong>
                                                {dayItems.length > 0 && (
                                                    <span
                                                        className="badge bg-light text-muted float-end"
                                                        style={{cursor: 'pointer'}}
                                                        onClick={() => openDayModal(dateKey)}
                                                    >
                            {dayItems.length}건
                          </span>
                                                )}
                                            </div>

                                            {shownItems.map((item, index) => {
                                                const isStart = item.startDate === dateKey

                                                return isStart ? (
                                                    <Draggable draggableId={item.id} index={index} key={item.id}>
                                                        {(drag) => (
                                                            <div
                                                                ref={drag.innerRef}
                                                                {...drag.draggableProps}
                                                                {...drag.dragHandleProps}
                                                                className="mt-1 px-1 py-1 rounded text-truncate"
                                                                style={{
                                                                    fontSize: 11,
                                                                    color: 'white',
                                                                    cursor: 'grab',
                                                                    backgroundColor:
                                                                        item.type === 'PROJECT' ? '#3b82f6' : '#f97316',
                                                                    ...drag.draggableProps.style,
                                                                }}
                                                                onClick={() => {
                                                                    setSelectedItem(item)
                                                                    setShowItemModal(true)
                                                                }}
                                                            >
                                                                {item.type === 'ISSUE' && item.projectName
                                                                    ? `[${item.projectName}] ${item.title}`
                                                                    : item.title}
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ) : (
                                                    <div
                                                        key={item.id + dateKey}
                                                        className="mt-1 px-1 py-1 rounded text-truncate"
                                                        style={{
                                                            fontSize: 11,
                                                            color: 'white',
                                                            backgroundColor:
                                                                item.type === 'PROJECT'
                                                                    ? 'rgba(59,130,246,0.6)'
                                                                    : 'rgba(249,115,22,0.6)',
                                                            cursor: 'pointer',
                                                        }}
                                                        onClick={() => {
                                                            setSelectedItem(item)
                                                            setShowItemModal(true)
                                                        }}
                                                    >
                                                        {item.title}
                                                    </div>
                                                )
                                            })}

                                            {hidden > 0 && (
                                                <div
                                                    className="text-primary small mt-1"
                                                    style={{cursor:'pointer'}}
                                                    onClick={() => openDayModal(dateKey)}
                                                >
                                                    +{hidden}개 더보기
                                                </div>
                                            )}

                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            )
                        })}
                    </div>
                </DragDropContext>
            </div>

            {/* ★★★ 하루 일정 모달 ★★★ */}
            {showDayModal && selectedDate && (
                <div className="modal fade show d-block" style={{background:'rgba(0,0,0,0.3)'}}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5>{selectedDate} 일정 ({selectedDateItems.length}건)</h5>
                                <button className="btn-close" onClick={() => setShowDayModal(false)} />
                            </div>
                            <div className="modal-body">
                                {selectedDateItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="p-2 mb-2 rounded"
                                        style={{
                                            backgroundColor:
                                                item.type === 'PROJECT'
                                                    ? 'rgba(59,130,246,0.1)'
                                                    : 'rgba(249,115,22,0.1)',
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => {
                                            setShowItemModal(true)
                                            setSelectedItem(item)
                                        }}
                                    >
                                        <strong>
                                            {item.type === 'ISSUE' && item.projectName
                                                ? `[${item.projectName}] ${item.title}`
                                                : item.title}
                                        </strong>
                                        <div className="text-muted" style={{fontSize: 12}}>
                                            {item.startDate} ~ {item.endDate}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-light" onClick={() => setShowDayModal(false)}>
                                    닫기
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ★★★ 단일 일정 상세 팝업 ★★★ */}
            {showItemModal && selectedItem && (
                <div className="modal fade show d-block" style={{background:'rgba(0,0,0,0.3)'}}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5>{selectedItem.type === 'PROJECT' ? '프로젝트' : '이슈'} 상세</h5>
                                <button
                                    className="btn-close"
                                    onClick={() => {
                                        setShowItemModal(false)
                                        setSelectedItem(null)
                                    }}
                                />
                            </div>
                            <div className="modal-body">
                                <div><strong>제목</strong><br />{selectedItem.title}</div>

                                {selectedItem.type === 'ISSUE' && (
                                    <>
                                        <div className="mt-2"><strong>프로젝트</strong><br />{selectedItem.projectName}</div>
                                        <div className="mt-2"><strong>담당자</strong><br />{selectedItem.managerName}</div>
                                        <div className="mt-2"><strong>우선순위</strong><br />{priorityLabel(selectedItem.priority)}</div>
                                        <div className="mt-2"><strong>상태</strong><br />{statusLabel(selectedItem.status)}</div>
                                    </>
                                )}

                                <div className="mt-2"><strong>기간</strong><br />
                                    {selectedItem.startDate} ~ {selectedItem.endDate}
                                </div>

                                {selectedItem.type === 'ISSUE' && selectedItem.content && (
                                    <div className="mt-2">
                                        <strong>내용</strong>
                                        <div className="border rounded p-2 mt-1" style={{whiteSpace:'pre-wrap'}}>
                                            {selectedItem.content}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="btn btn-light"
                                    onClick={() => {
                                        setShowItemModal(false)
                                        setSelectedItem(null)
                                    }}
                                >
                                    닫기
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ScheduleCalendarPage
