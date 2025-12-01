import React, {useEffect, useState} from 'react'
import axios from 'axios'
import {DragDropContext, Droppable, DropResult} from '@hello-pangea/dnd'
import TaskCard from './TaskCard'
import TaskDetailDrawer from './TaskDetailDrawer'
import {
    Task,
    TaskStatus,
    taskStatusColumns,
} from './taskTypes'

const TaskBoardPage: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([])
    const [selectedTask, setSelectedTask] = useState<Task | null>(null)
    const [detailOpen, setDetailOpen] = useState(false)

    /** API 호출하여 Task 목록 불러오기 */
    const loadTasks = async () => {
        try {
            const res = await axios.post(
                'http://localhost:4567/schedule/task/list',
                {},
                {withCredentials: true}
            )

            const list = res.data.list || []

            const mapped: Task[] = list.map((item: any) => {
                // issueStatus → board status 변환
                const statusMap: Record<number, TaskStatus> = {
                    0: 'TODO',
                    1: 'IN_PROGRESS',
                    2: 'DONE',
                }

                // issueStatus → progress 변환
                const progressMap: Record<number, 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'> = {
                    0: 'NOT_STARTED',
                    1: 'IN_PROGRESS',
                    2: 'COMPLETED',
                }

                return {
                    id: item.issueId,
                    title: item.name,
                    status: statusMap[item.issueStatus],
                    priority: String(item.issuePriority) as '1' | '2' | '3',
                    progress: progressMap[item.issueStatus],
                    assigneeName: item.managerName,
                    assigneeId: item.managerUserId,
                    startDate: item.startDate,
                    endDate: item.endDate,
                    memo: item.content,
                }
            })

            setTasks(mapped)
        } catch (err) {
            console.error('Task 불러오기 실패:', err)
        }
    }

    /** 초기 로딩 */
    useEffect(() => {
        loadTasks()
    }, [])

    /** Drag & Drop 시 상태 업데이트 */
    const handleDragEnd = async (result: DropResult) => {
        const {destination, source, draggableId} = result
        if (!destination) return
        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return
        }

        const taskId = Number(draggableId)
        const newStatus = destination.droppableId as TaskStatus

        // 1) 이전 상태 저장 (API 실패시 롤백용)
        const prevTasks = [...tasks]
        const targetTask = tasks.find((t) => t.id === taskId)
        if (!targetTask) return

        // 2) 화면에서 먼저 상태 변경 (옵티미스틱 업데이트)
        const updatedTasks: Task[] = tasks.map((t): Task =>
            t.id === taskId
                ? {
                    ...t,
                    status: newStatus,
                    progress:
                        newStatus === 'TODO'
                            ? 'NOT_STARTED'
                            : newStatus === 'IN_PROGRESS'
                                ? 'IN_PROGRESS'
                                : 'COMPLETED',
                }
                : t
        )

        setTasks(updatedTasks)

        // 3) TaskStatus → issueStatus(0,1,2) 매핑
        const statusToIssueStatus: Record<TaskStatus, number> = {
            TODO: 0,
            IN_PROGRESS: 1,
            DONE: 2,
        }

        const issueStatus = statusToIssueStatus[newStatus]

        try {
            // 4) API 호출
            await axios.post(
                'http://localhost:4567/schedule/task/quick_update',
                {
                    issueId: targetTask.id,     // = 서버의 issueId
                    issueStatus: issueStatus,   // 0 / 1 / 2
                },
                {withCredentials: true}
            )
            // 성공하면 그대로 두면 됨
        } catch (error) {
            console.error('quick_update 실패:', error)
            alert('상태 변경에 실패했습니다. 다시 시도해 주세요.')
            // 실패시 UI 롤백
            setTasks(prevTasks)
        }
    }

    const openDetail = (task: Task) => {
        setSelectedTask(task)
        setDetailOpen(true)
    }

    const closeDetail = () => {
        setDetailOpen(false)
    }

    const saveTask = () => {
        // 수정 후 목록 다시 조회
        loadTasks()
        setDetailOpen(false)
        setSelectedTask(null)
    }

    return (
        <div className='row g-7'>
            <DragDropContext onDragEnd={handleDragEnd}>
                {taskStatusColumns.map(column => {
                    const columnTasks = tasks.filter(t => t.status === column.id)

                    return (
                        <div className='col-12 col-md-4' key={column.id}>
                            <div className='d-flex justify-content-between align-items-center mb-4'>
                                <h5 className='fw-bold mb-0'>{column.title}</h5>
                            </div>

                            <Droppable droppableId={column.id}>
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className='h-100 min-h-200px bg-light rounded-3 p-3'
                                    >
                                        {columnTasks.map((task, index) => (
                                            <TaskCard
                                                key={task.id}
                                                task={task}
                                                index={index}
                                                onClick={openDetail}
                                            />
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    )
                })}
            </DragDropContext>

            <TaskDetailDrawer
                task={selectedTask}
                open={detailOpen}
                onClose={closeDetail}
                onSave={saveTask}
            />
        </div>
    )
}

export default TaskBoardPage
