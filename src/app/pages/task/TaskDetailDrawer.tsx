import React, {useEffect, useState} from 'react'
import {
    Task,
    TaskProgress,
    taskPriorityOptions,
    taskProgressOptions,
} from './taskTypes'
import {apiClient, TASK_UPDATE_URL} from '../../config/api'

type Props = {
    task: Task | null
    open: boolean
    onClose: () => void
    onSave: (task: Task) => void
}

const TaskDetailDrawer: React.FC<Props> = ({task, open, onClose, onSave}) => {
    const [localTask, setLocalTask] = useState<Task | null>(task)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        setLocalTask(task)
    }, [task])

    if (!localTask) return null

    const handleChange = <K extends keyof Task>(key: K, value: Task[K]) => {
        setLocalTask({...localTask, [key]: value})
    }

    const handleSave = async () => {
        if (!localTask.title.trim()) {
            alert('제목을 입력해 주세요.')
            return
        }

        setSaving(true)

        // progress → issueStatus(0/1/2) 매핑
        const progressToIssueStatus: Record<TaskProgress, number> = {
            NOT_STARTED: 0,
            IN_PROGRESS: 1,
            COMPLETED: 2,
        }

        const issueStatus = progressToIssueStatus[localTask.progress]

        try {
            await apiClient.post(
                TASK_UPDATE_URL,
                {
                    issueId: localTask.id,
                    name: localTask.title,
                    issuePriority: Number(localTask.priority),
                    issueStatus: issueStatus,
                    content: localTask.memo ?? '',
                    startDate: localTask.startDate ?? '',
                    endDate: localTask.endDate ?? '',
                },
                {withCredentials: true}
            )

            // 부모에게 "저장 성공했다"만 알려주기
            onSave(localTask)

        } catch (error) {
            console.error('task update 실패:', error)
            alert('작업 수정에 실패했습니다. 다시 시도해 주세요.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div
            className={`position-fixed top-0 end-0 h-100 bg-white shadow-lg border-start ${
                open ? 'translate-none' : 'translate-end'
            }`}
            style={{
                width: 420,
                zIndex: 1050,
                transition: 'transform 0.25s ease-in-out',
                transform: open ? 'translateX(0)' : 'translateX(100%)',
            }}
        >
            {/* 헤더 */}
            <div className='d-flex justify-content-between align-items-center p-4 border-bottom'>
                <div className='fw-bold fs-5'>{localTask.title || '작업'}</div>
                <button className='btn btn-icon btn-sm btn-light' onClick={onClose} disabled={saving}>
                    ✕
                </button>
            </div>

            {/* 내용 */}
            <div className='p-4 overflow-auto h-100' style={{paddingBottom: 80}}>
                {/* 제목 */}
                <div className='mb-5'>
                    <label className='form-label fw-bold'>작업 제목</label>
                    <input
                        className='form-control'
                        value={localTask.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        disabled={saving}
                    />
                </div>

                {/* 진행률 + 우선순위 */}
                <div className='mb-5 row'>
                    <div className='col-6'>
                        <label className='form-label fw-bold'>진행률</label>
                        <select
                            className='form-select'
                            value={localTask.progress}
                            onChange={(e) =>
                                handleChange('progress', e.target.value as TaskProgress)
                            }
                            disabled={saving}
                        >
                            {taskProgressOptions.map((p) => (
                                <option key={p.value} value={p.value}>
                                    {p.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className='col-6'>
                        <label className='form-label fw-bold'>우선순위</label>
                        <select
                            className='form-select'
                            value={localTask.priority}
                            onChange={(e) =>
                                handleChange('priority', e.target.value as '1' | '2' | '3')
                            }
                            disabled={saving}
                        >
                            {taskPriorityOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 날짜 */}
                <div className='mb-5 row'>
                    <div className='col-6'>
                        <label className='form-label fw-bold'>시작 날짜</label>
                        <input
                            type='date'
                            className='form-control'
                            value={localTask.startDate ? localTask.startDate.substring(0, 10) : ''}
                            onChange={(e) => handleChange('startDate', e.target.value)}
                            disabled={saving}
                        />
                    </div>
                    <div className='col-6'>
                        <label className='form-label fw-bold'>기한</label>
                        <input
                            type='date'
                            className='form-control'
                            value={localTask.endDate ? localTask.endDate.substring(0, 10) : ''}
                            onChange={(e) => handleChange('endDate', e.target.value)}
                            disabled={saving}
                        />
                    </div>
                </div>

                {/* 내용 */}
                <div className='mb-5'>
                    <label className='form-label fw-bold'>내용</label>
                    <textarea
                        className='form-control'
                        rows={4}
                        placeholder='여기에 설명을 입력하거나 내용를 추가하세요'
                        value={localTask.memo ?? ''}
                        onChange={(e) => handleChange('memo', e.target.value)}
                        disabled={saving}
                    />
                </div>
            </div>

            {/* 하단 버튼 */}
            <div className='position-absolute bottom-0 start-0 end-0 p-3 border-top bg-white'>
                <button className='btn btn-light me-2' onClick={onClose} disabled={saving}>
                    취소
                </button>
                <button className='btn btn-primary' onClick={handleSave} disabled={saving}>
                    {saving ? '저장 중...' : '저장'}
                </button>
            </div>
        </div>
    )
}

export default TaskDetailDrawer
